import { AppModule } from '@/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { UserRole } from '@/generated/prisma/enums'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { PrismaService } from '@/database/prisma/prisma.service'
import { hashApiKey } from '@/utils/hash-api-key'
import { addPrefixApiKey } from '@/utils/add-prefix-api-key'

describe('User E2E (Real Database)', () => {
	let app: INestApplication
	let prisma: PrismaService

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
		await app.init()
	}, 60000)

	afterEach(async () => {
		await app.close()
	})

	describe('POST /log', () => {
		it('should create a log entry when a valid API Key is provided', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: 'johndoe@example.com',
				},
			})

			const apiKey = await prisma.apiKey.create({
				data: {
					enterpriseId: enterprise.id,
					keyHash: hashApiKey('12345678'),
				},
			})

			const logDto = {
				action: 'ACTION',
				entityId: 'ENTITY_ID',
				actorRole: 'ACTOR_ROLE',
				actorId: 'ACTOR_ID',
			}

			const response = await request(app.getHttpServer())
				.post('/log')
				.set('x-api-key', addPrefixApiKey(apiKey.keyHash))
				.send(logDto)


			expect(response.status).toBe(201)

			const logInDb = await prisma.log.findFirst({
				where: { enterpriseId: enterprise.id },
			})

			expect(logInDb).toBeTruthy()
		})

		// it('should return 401 when x-api-key header is missing', async () => {
		// 	const response = await request(app.getHttpServer()).post('/log').send()

		// 	expect(response.status).toBe(401)
		// })

		// it('should return 401 when an invalid API Key is provided', async () => {
		// 	const response = await request(app.getHttpServer())
		// 		.post('/log')
		// 		.set('x-api-key', 'invalid-key-123')
		// 		.send()

		// 	expect(response.status).toBe(401)
		// })

		// it('should update the lastUsed field of the API Key after successful log creation', async () => {
		// 	const enterprise = await prisma.enterprise.create({
		// 		data: {
		// 			corporateReason: 'John Doe',
		// 			email: `johndoe@example.com`,
		// 		},
		// 	})

		// 	const apiKey = await prisma.apiKey.create({
		// 		data: {
		// 			enterpriseId: enterprise.id,
		// 			keyHash: hashApiKey('12345678'),
		// 		},
		// 	})

		// 	const logDto = {
		// 		action: 'ACTION',
		// 		entityId: 'ENTITY_ID',
		// 		actorRole: 'ACTOR_ROLE',
		// 		actorId: 'ACTOR_ID',
		// 	}

		// 	await request(app.getHttpServer())
		// 		.post('/log')
		// 		.set('x-api-key', addPrefixApiKey(apiKey.keyHash))
		// 		.send(logDto)

		// 	const updatedKey = await prisma.apiKey.findUnique({
		// 		where: { id: apiKey.id },
		// 	})

		// 	expect(updatedKey?.lastUsedAt).not.toBeNull()
		// })
	})

	// describe('GET /log/:logId', () => {
	// 	it('should return a specific log when a valid API Key and logId are provided', async () => {
	// 		const enterprise = await prisma.enterprise.create({
	// 			data: {
	// 				corporateReason: 'John Doe',
	// 				email: 'johndoe@example.com',
	// 			},
	// 		})

	// 		const apiKey = await prisma.apiKey.create({
	// 			data: {
	// 				enterpriseId: enterprise.id,
	// 				keyHash: hashApiKey('12345678'),
	// 			},
	// 		})

	// 		const log = await prisma.log.create({
	// 			data: {
	// 				enterpriseId: enterprise.id,
	// 				action: 'ACTION',
	// 				entityId: 'ENTITY_ID',
	// 				actorRole: 'ACTOR_ROLE',
	// 				actorId: 'ACTOR_ID',
	// 			},
	// 		})

	// 		const response = await request(app.getHttpServer())
	// 			.get(`/log/${log.id}`)
	// 			.set('x-api-key', addPrefixApiKey(apiKey.keyHash))

	// 		expect(response.status).toBe(200)
	// 		expect(response.body.id).toBe(log.id)
	// 		expect(response.body.log.action).toBe('ACTION')
	// 		expect(response.body.log.entityId).toBe('ENTITY_ID')
	// 		expect(response.body.log.actorRole).toBe('ACTOR_ROLE')
	// 		expect(response.body.log.actorId).toBe('ACTOR_ID')
	// 	})

	// 	it('should return 404 when the log does not exist', async () => {
	// 		const enterprise = await prisma.enterprise.create({
	// 			data: {
	// 				corporateReason: 'John Doe',
	// 				email: 'johndoe@example.com',
	// 			},
	// 		})

	// 		const apiKey = await prisma.apiKey.create({
	// 			data: {
	// 				enterpriseId: enterprise.id,
	// 				keyHash: hashApiKey('12345678'),
	// 			},
	// 		})

	// 		const fakeLogId = randomUUID()

	// 		const response = await request(app.getHttpServer())
	// 			.get(`/log/${fakeLogId}`)
	// 			.set('x-api-key', addPrefixApiKey(apiKey.keyHash))

	// 		expect(response.status).toBe(404)
	// 	})

	// 	it('should return 400 for an invalid logId UUID format', async () => {
	// 		const response = await request(app.getHttpServer())
	// 			.get('/log/not-a-valid-uuid')
	// 			.set('x-api-key', 'any-key')

	// 		expect(response.status).toBe(400)
	// 	})

	// 	it('should return 401 if API Key is missing even with valid logId', async () => {
	// 		const logId = randomUUID()
	// 		const response = await request(app.getHttpServer()).get(`/log/${logId}`)

	// 		expect(response.status).toBe(401)
	// 	})
	// })

  // describe('DELETE /log/:logId', () => {
  //   it('should delete a log when user is the owner (ENTERPRISE)', async () => {
  //     const enterprise = await prisma.enterprise.create({
  //       data: {
  //         corporateReason: 'Log Owner Corp',
  //         responsibleName: 'Owner',
  //         email: `owner-${randomUUID()}@test.com`,
  //         password: '123',
  //       },
  //     })
  
  //     const user = await prisma.user.create({
  //       data: {
  //         email: `user-log-${randomUUID()}@test.com`,
  //         name: 'Enterprise User',
  //         password: '123',
  //         enterpriseId: enterprise.id,
  //       },
  //     })
  
  //     const log = await prisma.log.create({
  //       data: {
  //         enterpriseId: enterprise.id,
  //         level: 'info',
  //         message: 'Log to delete',
  //         context: 'Audit',
  //       },
  //     })
  
  //     currentUserMock.sub = user.id
  //     currentUserMock.role = UserRole.ENTERPRISE
  
  //     const response = await request(app.getHttpServer())
  //       .delete(`/log/${log.id}`)
  
  //     expect(response.status).toBe(200)
  
  //     const logInDb = await prisma.log.findUnique({
  //       where: { id: log.id },
  //     })
  //     expect(logInDb).toBeNull()
  //   })
  
  //   it('should allow ADMIN to delete any log', async () => {
  //     const log = await prisma.log.create({
  //       data: {
  //         enterpriseId: randomUUID(),
  //         level: 'error',
  //         message: 'Admin delete test',
  //         context: 'Security',
  //       },
  //     })
  
  //     currentUserMock.sub = randomUUID()
  //     currentUserMock.role = UserRole.ADMIN
  
  //     const response = await request(app.getHttpServer())
  //       .delete(`/log/${log.id}`)
  
  //     expect(response.status).toBe(200)
  
  //     const logInDb = await prisma.log.findUnique({
  //       where: { id: log.id },
  //     })
  //     expect(logInDb).toBeNull()
  //   })
  
  //   it('should return 403 if an ENTERPRISE user tries to delete a log from another enterprise', async () => {
  //     const enterpriseA = await prisma.enterprise.create({
  //       data: { corporateReason: 'A', responsibleName: 'A', email: `a-${randomUUID()}@test.com`, password: '123' }
  //     })
  //     const enterpriseB = await prisma.enterprise.create({
  //       data: { corporateReason: 'B', responsibleName: 'B', email: `b-${randomUUID()}@test.com`, password: '123' }
  //     })
  
  //     const userA = await prisma.user.create({
  //       data: { email: `u-a-${randomUUID()}@test.com`, name: 'A', password: '123', enterpriseId: enterpriseA.id }
  //     })
  
  //     const logB = await prisma.log.create({
  //       data: { enterpriseId: enterpriseB.id, level: 'info', message: 'Log from B', context: 'Test' }
  //     })
  
  //     currentUserMock.sub = userA.id
  //     currentUserMock.role = UserRole.ENTERPRISE
  
  //     const response = await request(app.getHttpServer())
  //       .delete(`/log/${logB.id}`)
  
  //     expect(response.status).toBe(403)
  
  //     const logStillExists = await prisma.log.findUnique({ where: { id: logB.id } })
  //     expect(logStillExists).toBeTruthy()
  //   })
  
  //   it('should return 404 when log does not exist', async () => {
  //     currentUserMock.role = UserRole.ADMIN
  //     const fakeId = randomUUID()
  
  //     const response = await request(app.getHttpServer())
  //       .delete(`/log/${fakeId}`)
  
  //     expect(response.status).toBe(404)
  //   })
  // })

  // describe('GET /log', () => {
  //   it('should return a paginated list of logs for the authenticated enterprise user', async () => {
  //     const enterprise = await prisma.enterprise.create({
  //       data: {
  //         corporateReason: 'Log Pagination Corp',
  //         responsibleName: 'Manager',
  //         email: `pag-${randomUUID()}@test.com`,
  //         password: '123',
  //       },
  //     })
  
  //     const user = await prisma.user.create({
  //       data: {
  //         email: `user-pag-${randomUUID()}@test.com`,
  //         name: 'Enterprise User',
  //         password: '123',
  //         enterpriseId: enterprise.id,
  //       },
  //     })
  
  //     await prisma.log.createMany({
  //       data: [
  //         { enterpriseId: enterprise.id, level: 'info', message: 'Log 1', context: 'Test' },
  //         { enterpriseId: enterprise.id, level: 'warn', message: 'Log 2', context: 'Test' },
  //       ],
  //     })
  
  //     currentUserMock.sub = user.id
  //     currentUserMock.role = UserRole.ENTERPRISE
  
  //     const response = await request(app.getHttpServer())
  //       .get('/log')
  //       .query({ page: 1, limit: 10 })
  
  //     expect(response.status).toBe(200)
  //     expect(response.body.data.length).toBe(2)
  //     expect(response.body.meta).toBeDefined()
  //   })
  
  //   it('should allow ADMIN to see logs from all enterprises', async () => {
  //     const enterpriseA = await prisma.enterprise.create({
  //       data: { corporateReason: 'A', responsibleName: 'A', email: `a-${randomUUID()}@test.com`, password: '123' }
  //     })
  //     const enterpriseB = await prisma.enterprise.create({
  //       data: { corporateReason: 'B', responsibleName: 'B', email: `b-${randomUUID()}@test.com`, password: '123' }
  //     })
  
  //     await prisma.log.create({ data: { enterpriseId: enterpriseA.id, level: 'info', message: 'Log A', context: 'X' } })
  //     await prisma.log.create({ data: { enterpriseId: enterpriseB.id, level: 'info', message: 'Log B', context: 'Y' } })
  
  //     currentUserMock.sub = randomUUID()
  //     currentUserMock.role = UserRole.ADMIN
  
  //     const response = await request(app.getHttpServer())
  //       .get('/log')
  
  //     expect(response.status).toBe(200)
  //     expect(response.body.data.length).toBeGreaterThanOrEqual(2)
  //   })
  
  //   it('should filter logs by level', async () => {
  //     const enterprise = await prisma.enterprise.create({
  //       data: { corporateReason: 'Filter Corp', responsibleName: 'Dev', email: `f-${randomUUID()}@test.com`, password: '123' }
  //     })
  //     const user = await prisma.user.create({
  //       data: { email: `u-f-${randomUUID()}@test.com`, name: 'F', password: '123', enterpriseId: enterprise.id }
  //     })
  
  //     await prisma.log.createMany({
  //       data: [
  //         { enterpriseId: enterprise.id, level: 'error', message: 'Err', context: 'C' },
  //         { enterpriseId: enterprise.id, level: 'info', message: 'Inf', context: 'C' },
  //       ],
  //     })
  
  //     currentUserMock.sub = user.id
  //     currentUserMock.role = UserRole.ENTERPRISE
  
  //     const response = await request(app.getHttpServer())
  //       .get('/log')
  //       .query({ level: 'error' })
  
  //     expect(response.status).toBe(200)
  //     expect(response.body.data.every((l: any) => l.level === 'error')).toBe(true)
  //     expect(response.body.data.length).toBe(1)
  //   })
  
  //   it('should filter logs by date range', async () => {
  //     const enterprise = await prisma.enterprise.create({
  //       data: { corporateReason: 'Date Corp', responsibleName: 'Dev', email: `d-${randomUUID()}@test.com`, password: '123' }
  //     })
  //     const user = await prisma.user.create({
  //       data: { email: `u-d-${randomUUID()}@test.com`, name: 'D', password: '123', enterpriseId: enterprise.id }
  //     })
  
  //     const oldDate = new Date()
  //     oldDate.setDate(oldDate.getDate() - 10)
  
  //     await prisma.log.create({
  //       data: { enterpriseId: enterprise.id, level: 'info', message: 'Old', context: 'C', createdAt: oldDate }
  //     })
  //     await prisma.log.create({
  //       data: { enterpriseId: enterprise.id, level: 'info', message: 'New', context: 'C', createdAt: new Date() }
  //     })
  
  //     currentUserMock.sub = user.id
  //     currentUserMock.role = UserRole.ENTERPRISE
  
  //     const startDate = new Date()
  //     startDate.setDate(startDate.getDate() - 1)
  
  //     const response = await request(app.getHttpServer())
  //       .get('/log')
  //       .query({ startDate: startDate.toISOString() })
  
  //     expect(response.status).toBe(200)
  //     expect(response.body.data.length).toBe(1)
  //     expect(response.body.data[0].message).toBe('New')
  //   })
  // })
})
