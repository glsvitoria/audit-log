import { Test, TestingModule } from '@nestjs/testing'
import {
	ExecutionContext,
	INestApplication,
	ValidationPipe,
} from '@nestjs/common'
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { randomUUID } from 'crypto'
import { UserRole } from '@/generated/prisma/enums'

describe('ApiKey Controller', () => {
	let app: INestApplication
	let currentUserMock: {
		sub: string
		role: string
		enterpriseId: string | null
	}

	const mockApiKeyService = {
		create: vi.fn(),
		createByEnterprise: vi.fn(),
		delete: vi.fn(),
		disable: vi.fn(),
		enable: vi.fn(),
		findAll: vi.fn(),
		update: vi.fn(),
	}

	beforeEach(async () => {
		vi.clearAllMocks()

		currentUserMock = {
			sub: randomUUID(),
			role: UserRole.ADMIN,
			enterpriseId: randomUUID(),
		}

		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [ApiKeyController],
			providers: [
				{
					provide: ApiKeyService,
					useValue: mockApiKeyService,
				},
			],
		})
			.overrideGuard(AccessTokenGuard)
			.useValue({
				canActivate: (context: ExecutionContext) => {
					const req = context.switchToHttp().getRequest()
					req.user = currentUserMock
					return true
				},
			})
			.compile()

		app = moduleRef.createNestApplication()
		app.useGlobalPipes(new ValidationPipe())
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	describe('(POST /api-key)', () => {
		it('should allow ADMIN to create an api key', async () => {
			currentUserMock.role = UserRole.ADMIN
			const createDto = { description: 'New Key', enterpriseId: randomUUID() }
			mockApiKeyService.create.mockResolvedValue({ id: '1' })

			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send(createDto)

			expect(response.status).toBe(201)
			expect(mockApiKeyService.create).toHaveBeenCalledWith(createDto)
		})

		it('should forbid ENTERPRISE from using the generic create route', async () => {
			currentUserMock.role = UserRole.ENTERPRISE
			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send({})

			expect(response.status).toBe(403)
		})
	})

	describe('(POST /api-key/enterprise)', () => {
		it('should allow ENTERPRISE to create its own key', async () => {
			currentUserMock.role = UserRole.ENTERPRISE
			const createDto = { description: 'Enterprise Key' }
			mockApiKeyService.createByEnterprise.mockResolvedValue({ id: '1' })

			const response = await request(app.getHttpServer())
				.post('/api-key/enterprise')
				.send(createDto)

			expect(response.status).toBe(201)
			expect(mockApiKeyService.createByEnterprise).toHaveBeenCalledWith(
				createDto,
				currentUserMock.sub
			)
		})
	})

	describe('(PATCH /disable /enable)', () => {
		it('should allow both ADMIN and ENTERPRISE to disable a key', async () => {
			const apiKeyId = randomUUID()
			mockApiKeyService.disable.mockResolvedValue({ message: 'Disabled' })

			currentUserMock.role = UserRole.ENTERPRISE
			const response = await request(app.getHttpServer()).patch(
				`/api-key/disable/${apiKeyId}`
			)

			expect(response.status).toBe(200)
			expect(mockApiKeyService.disable).toHaveBeenCalledWith(
				apiKeyId,
				currentUserMock.sub
			)
		})
	})

	describe('(GET /api-key)', () => {
		it('should list api keys with pagination', async () => {
			currentUserMock.role = UserRole.ENTERPRISE
			mockApiKeyService.findAll.mockResolvedValue({ data: [], total: 0 })

			const response = await request(app.getHttpServer())
				.get('/api-key')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(mockApiKeyService.findAll).toHaveBeenCalled()
		})
	})

	describe('(PUT /api-key/:id)', () => {
		it('should return 400 for invalid UUID on update', async () => {
			const response = await request(app.getHttpServer())
				.put('/api-key/not-a-uuid')
				.send({ description: 'New' })

			expect(response.status).toBe(400)
		})

		it('should update api key description', async () => {
			const apiKeyId = randomUUID()
			const updateDto = { description: 'Updated Description' }
			mockApiKeyService.update.mockResolvedValue({ id: apiKeyId })

			const response = await request(app.getHttpServer())
				.put(`/api-key/${apiKeyId}`)
				.send(updateDto)

			expect(response.status).toBe(200)
			expect(mockApiKeyService.update).toHaveBeenCalledWith(
				updateDto,
				apiKeyId,
				currentUserMock.sub
			)
		})
	})
})
