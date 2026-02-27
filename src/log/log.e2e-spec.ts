import { AppModule } from '@/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { UserRole } from '@/generated/prisma/enums'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { PrismaService } from '@/database/prisma/prisma.service'
import { format } from 'date-fns'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import { LogRepository } from './repositories/log.repository'
import { UserRepository } from '@/user/repositories/user.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import { makeApiKey } from '@/test/factories/make-api-key'
import { makeUser } from '@/test/factories/make-user'
import { makeLog } from '@/test/factories/make-log'

describe('Log E2E (Real Database)', () => {
	let app: INestApplication
	let prisma: PrismaService
	let apiKeyRepository: ApiKeyRepository
	let enterpriseRepository: EnterpriseRepository
	let logRepository: LogRepository
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
		logRepository = moduleRef.get(LogRepository)
		userRepository = moduleRef.get(UserRepository)

		enterpriseRepository = new PrismaEnterpriseRepository(prisma)

		await app.init()
	}, 60000)

	afterEach(async () => {
		await app.close()
	})

	describe('POST /log', () => {
		it('should create a log entry when a valid API Key is provided', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const logDto = {
				action: 'ACTION',
				entityId: 'ENTITY_ID',
				actorRole: 'ACTOR_ROLE',
				actorId: 'ACTOR_ID',
			}

			const response = await request(app.getHttpServer())
				.post('/log')
				.set('x-api-key', apiKey)
				.send(logDto)

			expect(response.status).toBe(201)

			const logInDb = await logRepository.findById(response.body.id)

			expect(logInDb).toBeTruthy()
		})

		it('should return 401 when x-api-key header is missing', async () => {
			const response = await request(app.getHttpServer()).post('/log').send()
			expect(response.status).toBe(401)
		})

		it('should return 401 when an invalid API Key is provided', async () => {
			const response = await request(app.getHttpServer())
				.post('/log')
				.set('x-api-key', 'invalid-key-123')
				.send()
			expect(response.status).toBe(401)
		})

		it('should update the lastUsed field of the API Key after successful log creation', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const logDto = {
				action: 'ACTION',
				entityId: 'ENTITY_ID',
				actorRole: 'ACTOR_ROLE',
				actorId: 'ACTOR_ID',
			}
			await request(app.getHttpServer())
				.post('/log')
				.set('x-api-key', apiKey)
				.send(logDto)

			const updatedKey = await apiKeyRepository.findByApiKey(apiKey)

			expect(updatedKey?.lastUsedAt).not.toBeNull()
		})
	})

	describe('GET /log/:logId', () => {
		it('should return a specific log when a valid API Key and logId are provided', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const log = await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).get(`/log/${log.id}`)

			expect(response.status).toBe(200)
			expect(response.body.id).toBe(log.id)
			expect(response.body.action).toBe('ACTION')
			expect(response.body.entityId).toBe('ENTITY_ID')
			expect(response.body.actorRole).toBe('ACTOR_ROLE')
			expect(response.body.actorId).toBe('ACTOR_ID')
		})

		it('should return 404 when the log does not exist', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).get(
				`/log/${randomUUID()}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 for an invalid logId UUID format', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).get(
				'/log/not-a-valid-uuid'
			)

			expect(response.status).toBe(400)
		})
	})

	describe('DELETE /log/:logId', () => {
		it('should delete a log when user is the owner (ENTERPRISE)', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			const log = await makeLog(logRepository, {
				enterpriseId: enterprise.id,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).delete(
				`/log/${log.id}`
			)
			expect(response.status).toBe(200)
			const logInDb = await prisma.log.findFirst({
				where: { id: log.id },
			})
			expect(logInDb).toBeNull()
		})
		it('should allow ADMIN to delete any log', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const log = await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).delete(
				`/log/${log.id}`
			)

			expect(response.status).toBe(200)

			const logInDb = await prisma.log.findFirst({
				where: { id: log.id },
			})

			expect(logInDb).toBeNull()
		})

		it('should return 404 if an ENTERPRISE user tries to delete a log from another enterprise', async () => {
			const enterpriseA = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const enterpriseB = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doa',
				email: 'johndoa@example.com',
			})

			const userA = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterpriseA.id,
			})

			const logB = await makeLog(logRepository, {
				enterpriseId: enterpriseB.id,
			})

			currentUserMock.sub = userA.id
			currentUserMock.role = userA.role

			const response = await request(app.getHttpServer()).delete(
				`/log/${logB.id}`
			)

			expect(response.status).toBe(404)

			const logStillExists = await prisma.log.findFirst({
				where: { id: logB.id },
			})

			expect(logStillExists).toBeTruthy()
		})
		it('should return 404 when log does not exist', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer()).delete(
				`/log/${randomUUID()}`
			)

			expect(response.status).toBe(404)
		})
	})

	describe('GET /log', () => {
		it('should return a paginated list of logs for the authenticated enterprise user', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				role: UserRole.ENTERPRISE,
				enterpriseId: enterprise.id,
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(response.body.logs.length).toBe(2)
		})

		it('should allow ADMIN to see logs from all enterprises', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterpriseA = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const enterpriseB = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doa',
				email: 'johndoa@example.com',
			})

			await prisma.log.create({
				data: {
					enterpriseId: enterpriseA.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})
			await prisma.log.create({
				data: {
					enterpriseId: enterpriseB.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(response.body.logs.length).toBe(2)
		})

		it('should filter logs by action', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION_1',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION_2',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, action: 'ACTION_1' })

			expect(response.status).toBe(200)
			expect(
				response.body.logs.every((l: any) => l.action === 'ACTION_1')
			).toBe(true)
			expect(response.body.logs.length).toBe(1)
		})

		it('should filter logs by entity', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						entity: 'ENTITY_1',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						entity: 'ENTITY_2',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, entity: 'ENTITY_1' })

			expect(response.status).toBe(200)
			expect(
				response.body.logs.every((l: any) => l.entity === 'ENTITY_1')
			).toBe(true)
			expect(response.body.logs.length).toBe(1)
		})

		it('should filter logs by entityId', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID_1',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID_2',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, entityId: 'ENTITY_ID_1' })

			expect(response.status).toBe(200)
			expect(
				response.body.logs.every((l: any) => l.entityId === 'ENTITY_ID_1')
			).toBe(true)
			expect(response.body.logs.length).toBe(1)
		})

		it('should filter logs by actorRole', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE_1',
						actorId: 'ACTOR_ID',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE_2',
						actorId: 'ACTOR_ID',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, actorRole: 'ACTOR_ROLE_1' })

			expect(response.status).toBe(200)
			expect(
				response.body.logs.every((l: any) => l.actorRole === 'ACTOR_ROLE_1')
			).toBe(true)
			expect(response.body.logs.length).toBe(1)
		})

		it('should filter logs by actorId', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			await prisma.log.createMany({
				data: [
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID_1',
					},
					{
						enterpriseId: enterprise.id,
						action: 'ACTION',
						entityId: 'ENTITY_ID',
						actorRole: 'ACTOR_ROLE',
						actorId: 'ACTOR_ID_2',
					},
				],
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, actorId: 'ACTOR_ID_1' })

			expect(response.status).toBe(200)
			expect(
				response.body.logs.every((l: any) => l.actorId === 'ACTOR_ID_1')
			).toBe(true)
			expect(response.body.logs.length).toBe(1)
		})

		it('should filter logs by startDate', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})
			const oldDate = new Date()
			oldDate.setDate(oldDate.getDate() - 10)

			await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION_1',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
					createdAt: oldDate,
				},
			})
			await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE_1',
					actorId: 'ACTOR_ID',
					createdAt: new Date(),
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const startDate = new Date()
			startDate.setDate(startDate.getDate() - 1)

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({
					init: 0,
					limit: 10,
					startDate: format(startDate, 'yyyy-MM-dd'),
				})

			expect(response.status).toBe(200)
			expect(response.body.logs.length).toBe(1)
			expect(response.body.logs[0].action).toBe('ACTION')
		})

		it('should filter logs by endDate', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterprise = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const oldDate = new Date()
			oldDate.setDate(oldDate.getDate() - 10)

			await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION_1',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
					createdAt: oldDate,
				},
			})
			await prisma.log.create({
				data: {
					enterpriseId: enterprise.id,
					action: 'ACTION',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE_1',
					actorId: 'ACTOR_ID',
					createdAt: new Date(),
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const endDate = new Date()
			endDate.setDate(endDate.getDate() - 1)

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, endDate: format(endDate, 'yyyy-MM-dd') })

			expect(response.status).toBe(200)
			expect(response.body.logs.length).toBe(1)
			expect(response.body.logs[0].action).toBe('ACTION_1')
		})

		it('should filter logs by enterpriseId', async () => {
			const user = await makeUser(userRepository, {
				role: UserRole.ADMIN,
			})

			const enterpriseA = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doe',
				email: 'johndoe@example.com',
			})

			const enterpriseB = await makeEnterprise(enterpriseRepository, {
				corporateReason: 'John Doa',
				email: 'johndoa@example.com',
			})

			const oldDate = new Date()
			oldDate.setDate(oldDate.getDate() - 10)

			await prisma.log.create({
				data: {
					enterpriseId: enterpriseA.id,
					action: 'ACTION_1',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})
			await prisma.log.create({
				data: {
					enterpriseId: enterpriseB.id,
					action: 'ACTION_2',
					entityId: 'ENTITY_ID',
					actorRole: 'ACTOR_ROLE',
					actorId: 'ACTOR_ID',
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = user.role

			const response = await request(app.getHttpServer())
				.get('/log')
				.query({ init: 0, limit: 10, enterpriseId: enterpriseA.id })

			expect(response.status).toBe(200)
			expect(response.body.logs.length).toBe(1)
			expect(response.body.logs[0].action).toBe('ACTION_1')
		})
	})
})
