import { AppModule } from '@/app.module'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { PrismaService } from '@/database/prisma/prisma.service'
import { UserRole } from '@/generated/prisma/enums'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { ApiKeyRepository } from './repositories/api-key.types'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { UserRepository } from '@/user/repositories/user.repository'
import { Test } from '@nestjs/testing'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import request from 'supertest'
import { removePrefixApiKey } from '@/utils/remove-prefix-api-key'
import { makeUser } from '@/test/factories/make-user'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { makeApiKey } from '@/test/factories/make-api-key'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'

describe('User E2E (Real Database)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let apiKeyRepository: ApiKeyRepository
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

		apiKeyRepository = moduleRef.get(ApiKeyRepository)
		enterpriseRepository = moduleRef.get(EnterpriseRepository)
		userRepository = moduleRef.get(UserRepository)

		await app.init()
	}, 60000)

	afterEach(async () => {
		await app.close()
	})

	describe('POST /api-key', () => {
		it('should create a new API Key for a valid enterprise when user is ADMIN', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const createDto = {
				enterpriseId: enterprise.id,
				description: 'Production Key',
			}

			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send(createDto)

			expect(response.status).toBe(201)
			expect(response.body.apiKey).toBeTruthy()

			const apiKeyInDb = await apiKeyRepository.findByApiKey(
				response.body.apiKey
			)

			expect(apiKeyInDb).toBeTruthy()
			expect(apiKeyInDb?.keyHash).toBe(removePrefixApiKey(response.body.apiKey))
		})

		it('should return 404 if the enterpriseId does not exist', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send({
					enterpriseId: randomUUID(),
					description: 'Ghost Key',
				})

			expect(response.status).toBe(404)
			expect(response.body.message).toContain(
				ErrorMessagesHelper.ENTERPRISE_NOT_FOUND
			)
		})

		it('should return 403 (Forbidden) if the user is not an ADMIN', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send({
					enterpriseId: randomUUID(),
				})

			expect(response.status).toBe(403)
		})

		it('should return 400 if enterpriseId is missing in the body', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.post('/api-key')
				.send({
					description: 'Missing ID',
				})

			expect(response.status).toBe(400)
			expect(response.body.message).toContain(
				'O ID da empresa é obrigatório e não pode ser vazio'
			)
		})
	})

	describe('POST /api-key/enterprise', () => {
		it('should create an API Key for the enterprise linked to the authenticated user', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const createDto = {
				description: 'My Enterprise Key',
			}

			const response = await request(app.getHttpServer())
				.post('/api-key/enterprise')
				.send(createDto)

			expect(response.status).toBe(201)
			expect(response.body.apiKey).toBeTruthy()

			const apiKeyInDb = await prisma.apiKey.findFirst({
				where: { enterpriseId: enterprise.id },
			})

			expect(apiKeyInDb).toBeTruthy()
			expect(apiKeyInDb?.keyHash).toBe(removePrefixApiKey(response.body.apiKey))
		})

		it('should return 404 if the user does not have an associated enterprise', async () => {
			const userWithoutEnterprise = await prisma.user.create({
				data: {
					email: 'johndoe@example.com',
					name: 'John Doe',
					password: '123',
					role: UserRole.ENTERPRISE,
				},
			})

			currentUserMock.sub = userWithoutEnterprise.id
			currentUserMock.role = userWithoutEnterprise.role

			const response = await request(app.getHttpServer())
				.post('/api-key/enterprise')
				.send()

			expect(response.status).toBe(404)
		})

		it('should return 403 if an ADMIN tries to access this specific enterprise route', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.post('/api-key/enterprise')
				.send()

			expect(response.status).toBe(403)
		})
	})

	describe('DELETE /api-key/:apiKeyId', () => {
		it('should allow an ENTERPRISE user to delete an API Key belonging to their enterprise', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			const response = await request(app.getHttpServer()).delete(
				`/api-key/${apiKeyCreated?.id}`
			)

			expect(response.status).toBe(200)
			expect(response.body.message).toBe(SuccessMessagesHelper.API_KEY_DELETED)

			const apiKeyStillExists = await apiKeyRepository.findByApiKey(
				apiKeyCreated!.id
			)

			expect(apiKeyStillExists).toBeNull()
		})

		it('should return 404 if an ENTERPRISE user tries to delete an API Key from another enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository)

			const enterpriseB = await makeEnterprise(enterpriseRepository)

			const userA = await makeUser(userRepository, {
				enterpriseId: enterpriseA.id,
				role: UserRole.ENTERPRISE,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseB.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = userA.id
			currentUserMock.role = userA.role

			const response = await request(app.getHttpServer()).delete(
				`/api-key/${apiKeyCreated?.id}`
			)

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(ErrorMessagesHelper.API_KEY_NOT_FOUND)

			const apiKeyStillExists = await apiKeyRepository.findById(
				apiKeyCreated!.id
			)

			expect(apiKeyStillExists).toBeTruthy()
		})

		it('should return 400 if the apiKeyId is not a valid UUID', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).delete(
				'/api-key/invalid-uuid'
			)

			expect(response.status).toBe(400)
		})

		it('should return 404 if the user has no linked enterprise', async () => {
			const userWithoutEnterprise = await prisma.user.create({
				data: {
					email: 'johndoe@example.com',
					name: 'John Doe',
					password: '123456',
					role: UserRole.ENTERPRISE,
				},
			})

			currentUserMock.sub = userWithoutEnterprise.id
			currentUserMock.role = userWithoutEnterprise.role

			const response = await request(app.getHttpServer()).delete(
				`/api-key/${randomUUID()}`
			)

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(
				ErrorMessagesHelper.ENTERPRISE_NOT_FOUND
			)
		})
	})

	describe('PATCH /api-key/disable/:apiKeyId', () => {
		it('should disable an active API Key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).patch(
				`/api-key/disable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(200)
			expect(response.body.message).toBe(SuccessMessagesHelper.API_KEY_DISABLED)

			const updatedKey = await apiKeyRepository.findById(apiKeyCreated!.id)

			expect(updatedKey?.disabledAt).not.toBeNull()
		})

		it('should return 400 if the API Key is already disabled', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await apiKeyRepository.disable(apiKeyCreated!.id)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).patch(
				`/api-key/disable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(400)
			expect(response.body.message).toBe(
				ErrorMessagesHelper.API_KEY_ALREADY_DISABLED
			)
		})

		it('should return 404 if a user tries to disable a key from another enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository)

			const enterpriseB = await makeEnterprise(enterpriseRepository)

			const userA = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterpriseA.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseB.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = userA.id
			currentUserMock.role = userA.role

			const response = await request(app.getHttpServer()).patch(
				`/api-key/disable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		})
	})

	describe('PATCH /api-key/enable/:apiKeyId', () => {
		it('should enable a disabled API Key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await apiKeyRepository.disable(apiKeyCreated!.id)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).patch(
				`/api-key/enable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(200)
			expect(response.body.message).toBe(SuccessMessagesHelper.API_KEY_ENABLED)

			const updatedKey = await apiKeyRepository.findById(apiKeyCreated!.id)

			expect(updatedKey?.disabledAt).toBeNull()
		})

		it('should return 400 if the API Key is already enabled (disabledAt is null)', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = user.id
			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer()).patch(
				`/api-key/enable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(400)
			expect(response.body.message).toBe(
				ErrorMessagesHelper.API_KEY_ALREADY_ENABLED
			)
		})

		it('should return 404 if a user tries to enable a key from another enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository)

			const enterpriseB = await makeEnterprise(enterpriseRepository)

			const userA = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterpriseA.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseB.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await apiKeyRepository.disable(apiKeyCreated!.id)

			currentUserMock.sub = userA.id
			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer()).patch(
				`/api-key/enable/${apiKeyCreated!.id}`
			)

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		})
	})

	describe('GET /api-key', () => {
		it('should return paginated API keys only for the authenticated user enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository)

			const userA = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterpriseA.id,
			})

			await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseA.id,
			})

			await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseA.id,
			})

			const enterpriseB = await makeEnterprise(enterpriseRepository)

			await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseB.id,
			})

			currentUserMock.sub = userA.id
			currentUserMock.role = userA.role

			const response = await request(app.getHttpServer())
				.get('/api-key')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(response.body.apiKeys.length).toBe(2)
			expect(
				response.body.apiKeys.every(
					(k: any) => k.enterpriseId === enterpriseA.id
				)
			).toBe(true)
		})

		it('should apply pagination limits correctly', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			for (let i = 0; i < 5; i++) {
				await makeApiKey(apiKeyRepository, {
					enterpriseId: enterprise.id,
				})
			}

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/api-key')
				.query({ init: 0, limit: 2 })

			expect(response.status).toBe(200)
			expect(response.body.apiKeys.length).toBe(2)
		})

		it('should return 404 if the authenticated user has no enterprise link', async () => {
			const userWithoutEnt = await prisma.user.create({
				data: {
					email: 'johndoe@example.com',
					name: 'John Doe',
					password: '123',
					role: UserRole.ENTERPRISE,
				},
			})

			currentUserMock.sub = userWithoutEnt.id
			currentUserMock.role = userWithoutEnt.role

			const response = await request(app.getHttpServer())
				.get('/api-key')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(
				ErrorMessagesHelper.ENTERPRISE_NOT_FOUND
			)
		})
	})

	describe('PUT /api-key/:apiKeyId', () => {
		it('should update the description of an API Key when user is the owner', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const updateDto = {
				description: 'New shiny description',
			}

			const response = await request(app.getHttpServer())
				.put(`/api-key/${apiKeyCreated!.id}`)
				.send(updateDto)

			expect(response.status).toBe(200)

			const updatedKey = await apiKeyRepository.findById(apiKeyCreated!.id)

			expect(updatedKey?.description).toBe('New shiny description')
		})

		it('should return 404 when an enterprise user tries to update a key from another enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository)

			const enterpriseB = await makeEnterprise(enterpriseRepository)

			const userA = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterpriseA.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterpriseB.id,
				description: 'Key from B',
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = userA.id
			currentUserMock.role = userA.role

			const response = await request(app.getHttpServer())
				.put(`/api-key/${apiKeyCreated!.id}`)
				.send({ description: 'Hack attempt' })

			expect(response.status).toBe(404)
			expect(response.body.message).toBe(ErrorMessagesHelper.API_KEY_NOT_FOUND)

			const keyB = await apiKeyRepository.findById(apiKeyCreated!.id)
			expect(keyB?.description).toBe('Key from B')
		})

		it('should return 400 if the description is not a string', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.put(`/api-key/${apiKeyCreated!.id}`)
				.send({ description: 12345 })

			expect(response.status).toBe(400)
			expect(response.body.message).toContain('A descrição deve ser uma string')
		})

		it('should allow updating with an empty/null description if optional', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.put(`/api-key/${apiKeyCreated!.id}`)
				.send({ description: null })

			expect(response.status).toBe(200)
		})
	})
})
