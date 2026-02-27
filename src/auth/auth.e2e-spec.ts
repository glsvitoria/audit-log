import { AppModule } from '@/app.module'
import { Test } from '@nestjs/testing'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { AccessTokenGuard } from './guards/access-token.guard'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { PrismaService } from '@/database/prisma/prisma.service'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { UserRepository } from '@/user/repositories/user.repository'
import request from 'supertest'
import { UserRole } from '@/generated/prisma/enums'
import { randomUUID } from 'crypto'
import { makeUser } from '@/test/factories/make-user'
import { hash } from 'bcryptjs'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'

describe('User E2E (Real Database)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let enterpriseRepository: EnterpriseRepository
	let userRepository: UserRepository

	let currentUserMock: {
		sub: string
		role: UserRole
	} = {
		sub: randomUUID(),
		role: UserRole.ADMIN,
	}

	beforeEach(async () => {
		const moduleRef = await Test.createTestingModule({
			imports: [AppModule],
		})
			.overrideGuard(AccessTokenGuard)
			.useValue({
				canActivate: (context: any) => {
					const req = context.switchToHttp().getRequest()
					req.user = currentUserMock
					return true
				},
			})
			.compile()

		app = moduleRef.createNestApplication()
		app.useGlobalPipes(new ValidationPipe({ transform: true }))
		prisma = moduleRef.get(PrismaService)

		enterpriseRepository = moduleRef.get(EnterpriseRepository)
		userRepository = moduleRef.get(UserRepository)

		await app.init()
	}, 60000)

	afterEach(async () => {
		await app.close()
	})

	describe('POST /sessions (Authenticate)', () => {
		it('should authenticate a user and return an access token', async () => {
			const email = 'johndoe@example.com'
			const password = 'password123'

			await makeUser(userRepository, {
				role: UserRole.ADMIN,
				email,
				password,
			})

			const response = await request(app.getHttpServer()).post('/auth').send({
				email,
				password,
			})

			expect(response.status).toBe(201)
			expect(response.body).toHaveProperty('access_token')
		})

		it('should return 401 for invalid password', async () => {
			const email = 'test@example.com'
			await makeUser(userRepository, {
				role: UserRole.ADMIN,
				email,
				password: '123456',
			})

			const response = await request(app.getHttpServer()).post('/auth').send({
				email,
				password: '12345',
			})

			expect(response.status).toBe(401)
		})

		it('should return 400 if email is invalid', async () => {
			const response = await request(app.getHttpServer()).post('/auth').send({
				email: 'invalid-email',
				password: 'any-password',
			})

			expect(response.status).toBe(400)
			expect(response.body.message).toContain('O e-mail informado é inválido')
		})
	})
})
