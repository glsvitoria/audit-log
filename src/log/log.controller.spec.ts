import { Test, TestingModule } from '@nestjs/testing'
import {
	ExecutionContext,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common'
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { randomUUID } from 'crypto'
import { UserRole } from '@/generated/prisma/enums'
import { ApiKeyGuard } from '@/auth/guards/api-key.guard'

describe('Log Controller', () => {
	let app: INestApplication

	let currentUserMock: { sub: string; role: string }
	let currentEnterpriseMock: { apiKey: string; id: string }

	const mockLogService = {
		create: vi.fn(),
		find: vi.fn(),
		delete: vi.fn(),
		findAll: vi.fn(),
	}

	beforeEach(async () => {
		vi.clearAllMocks()

		currentUserMock = { sub: randomUUID(), role: UserRole.ADMIN }
		currentEnterpriseMock = { apiKey: 'key-123', id: randomUUID() }

		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [LogController],
			providers: [{ provide: LogService, useValue: mockLogService }],
		})
			.overrideGuard(AccessTokenGuard)
			.useValue({
				canActivate: (context: ExecutionContext) => {
					const req = context.switchToHttp().getRequest()
					req.user = currentUserMock
					return true
				},
			})
			.overrideGuard(ApiKeyGuard)
			.useValue({
				canActivate: (context: ExecutionContext) => {
					const req = context.switchToHttp().getRequest()
					req.enterprise = currentEnterpriseMock
					return true
				},
			})
			.compile()

		app = moduleRef.createNestApplication()
		app.useGlobalPipes(new ValidationPipe({ transform: true }))
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	describe('(POST /log)', () => {
		it('should create a log using API Key', async () => {
			const createDto = {
				action: 'USER_LOGIN',
				actorRole: 'ACTOR_ROLE',
				actorId: 'ACTOR_ID',
				details: 'User logged in',
			}
			mockLogService.create.mockResolvedValue({ id: randomUUID() })

			const response = await request(app.getHttpServer())
				.post('/log')
				.send(createDto)

			expect(response.status).toBe(201)
			expect(mockLogService.create).toHaveBeenCalled()
		})
	})

	describe('(GET /log/:logId)', () => {
		it('should find a log by ID (ApiKey protected)', async () => {
			const logId = randomUUID()
			mockLogService.find.mockResolvedValue({ id: logId, action: 'TEST' })

			const response = await request(app.getHttpServer()).get(`/log/${logId}`)

			expect(response.status).toBe(200)
			expect(mockLogService.find).toHaveBeenCalledWith(logId)
		})
	})

	describe('(GET /log)', () => {
		it('should list logs for authenticated user', async () => {
			currentUserMock.role = UserRole.ENTERPRISE
			mockLogService.findAll.mockResolvedValue({ data: [], total: 0 })

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(mockLogService.findAll).toHaveBeenCalled()
		})
	})

	describe('(DELETE /log/:logId)', () => {
		it('should allow user to delete a log', async () => {
			const logId = randomUUID()
			mockLogService.delete.mockResolvedValue({ success: true })

			const response = await request(app.getHttpServer()).delete(
				`/log/${logId}`
			)

			expect(response.status).toBe(200)
			expect(mockLogService.delete).toHaveBeenCalledWith(
				logId,
				currentUserMock.sub
			)
		})
	})
})
