import { Test, TestingModule } from '@nestjs/testing'
import {
	INestApplication,
	UnauthorizedException,
	ValidationPipe,
} from '@nestjs/common'
import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest'
import request from 'supertest'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'

describe('Auth Controller', () => {
	let app: INestApplication

	const mockAuthService = {
		authenticate: vi.fn(),
	}

	beforeEach(async () => {
		vi.clearAllMocks()

		const moduleRef: TestingModule = await Test.createTestingModule({
			controllers: [AuthController],
			providers: [
				{
					provide: AuthService,
					useValue: mockAuthService,
				},
			],
		}).compile()

		app = moduleRef.createNestApplication()
		app.useGlobalPipes(new ValidationPipe())
		await app.init()
	})

	afterAll(async () => {
		await app.close()
	})

	describe('(POST /auth)', () => {
		it('should return 201 and an access token when credentials are valid', async () => {
			const authenticateDto = {
				email: 'user@example.com',
				password: 'password123',
			}

			const mockResponse = {
				accessToken: 'any-valid-token',
				user: { id: 'user-id', email: 'user@example.com' },
			}

			mockAuthService.authenticate.mockResolvedValue(mockResponse)

			const response = await request(app.getHttpServer())
				.post('/auth')
				.send(authenticateDto)

			expect(response.status).toBe(201)
			expect(response.body).toEqual(mockResponse)
			expect(mockAuthService.authenticate).toHaveBeenCalledWith(authenticateDto)
		})

		it('should return 400 if email is invalid', async () => {
			const response = await request(app.getHttpServer()).post('/auth').send({
				email: 'invalid-email',
				password: 'password123',
			})

			expect(response.status).toBe(400)
		})

		it('should return 401 if service throws UnauthorizedException', async () => {
			mockAuthService.authenticate.mockRejectedValue(
				new UnauthorizedException()
			)

			const response = await request(app.getHttpServer()).post('/auth').send({
				email: 'wrong@example.com',
				password: 'wrong-password',
			})

			expect(response.status).toBe(401)
		})
	})
})
