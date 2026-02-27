import { AppModule } from '@/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { UserRole } from '@/generated/prisma/enums'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { PrismaService } from '@/database/prisma/prisma.service'

describe('Enterprise E2E (Real Database)', () => {
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

	describe('POST /enterprise', () => {
		it('should create an enterprise, a user and an api key in a transaction', async () => {
			const email = 'contact@techcorp.com'

			const response = await request(app.getHttpServer())
				.post('/enterprise')
				.send({
					email,
					corporateReason: 'Tech Corp LTDA',
					responsibleName: 'Owner Name',
					password: 'password123',
					confirmPassword: 'password123',
				})

			expect(response.status).toBe(201)
			expect(response.body).toHaveProperty('apiKey')

			const enterpriseInDb = await prisma.enterprise.findFirst({
				where: { email },
			})
			expect(enterpriseInDb).toBeTruthy()
			expect(enterpriseInDb?.corporateReason).toBe('Tech Corp LTDA')

			const userInDb = await prisma.user.findFirst({
				where: { email },
			})
			expect(userInDb).toBeTruthy()
			expect(userInDb?.enterpriseId).toBe(enterpriseInDb?.id)

			const apiKeyInDb = await prisma.apiKey.findFirst({
				where: { enterpriseId: enterpriseInDb?.id },
			})
			expect(apiKeyInDb).toBeTruthy()
		})

		it('should throw ConflictException if email is already used by another enterprise', async () => {
			const email = 'duplicate@test.com'

			await prisma.enterprise.create({
				data: {
					email,
					corporateReason: 'Existente',
				},
			})

			const response = await request(app.getHttpServer())
				.post('/enterprise')
				.send({
					email,
					corporateReason: 'Nova Tentativa',
					responsibleName: 'Novo',
					password: 'password123',
					confirmPassword: 'password123',
				})

			expect(response.status).toBe(409)
		})

		it('should throw ConflictException if email is already used by a standalone user', async () => {
			const email = 'user@test.com'

			await prisma.user.create({
				data: { email, name: 'User Solo', password: '123' },
			})

			const response = await request(app.getHttpServer())
				.post('/enterprise')
				.send({
					email,
					corporateReason: 'Empresa do User',
					responsibleName: 'Dono',
					password: 'password123',
					confirmPassword: 'password123',
				})

			expect(response.status).toBe(409)
		})
	})

	describe('DELETE /enterprise/:enterpriseId', () => {
		it('should delete an enterprise and its cascading dependencies', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: 'johndoe@example.com',
				},
			})

			const response = await request(app.getHttpServer()).delete(
				`/enterprise/${enterprise.id}`
			)

			expect(response.status).toBe(200)

			const enterpriseDb = await prisma.enterprise.findFirst({
				where: { id: enterprise.id },
			})
			expect(enterpriseDb).toBeNull()
		})

		it('should return 404 when enterprise does not exist', async () => {
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer()).delete(
				`/enterprise/${fakeId}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 when enterpriseId is not a valid UUID', async () => {
			const response = await request(app.getHttpServer()).delete(
				'/enterprise/invalid-id'
			)

			expect(response.status).toBe(400)
		})
	})

	describe('PATCH /enterprise/disable/:enterpriseId', () => {
		it('should disable an enterprise in the database', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: `johndoe@example.com`,
				},
			})

			const response = await request(app.getHttpServer()).patch(
				`/enterprise/disable/${enterprise.id}`
			)

			expect(response.status).toBe(200)

			const updatedEnterprise = await prisma.enterprise.findUnique({
				where: { id: enterprise.id },
			})
			expect(updatedEnterprise?.disabledAt).toBeTruthy()
		})

		it('should return 404 when trying to disable a non-existent enterprise', async () => {
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer()).patch(
				`/enterprise/disable/${fakeId}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 for invalid UUID format', async () => {
			const response = await request(app.getHttpServer()).patch(
				'/enterprise/disable/not-a-uuid'
			)

			expect(response.status).toBe(400)
		})
	})

	describe('PATCH /enterprise/enable/:enterpriseId', () => {
		it('should enable an enterprise in the database', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: 'johndoe@example.com',
				},
			})

			await prisma.enterprise.update({
				where: {
					id: enterprise.id,
				},
				data: {
					disabledAt: new Date(),
				},
			})

			const response = await request(app.getHttpServer()).patch(
				`/enterprise/enable/${enterprise.id}`
			)

			expect(response.status).toBe(200)

			const updatedEnterprise = await prisma.enterprise.findUnique({
				where: { id: enterprise.id },
			})
			expect(updatedEnterprise?.disabledAt).toBeNull()
		})

		it('should return 404 when trying to enable a non-existent enterprise', async () => {
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer()).patch(
				`/enterprise/enable/${fakeId}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 for invalid UUID format', async () => {
			const response = await request(app.getHttpServer()).patch(
				'/enterprise/enable/not-a-uuid'
			)

			expect(response.status).toBe(400)
		})
	})

	describe('GET /enterprise/:enterpriseId', () => {
		it('should return an enterprise with its associated data', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: 'johndoe@example.com',
				},
			})

			const response = await request(app.getHttpServer()).get(
				`/enterprise/${enterprise.id}`
			)

			expect(response.status).toBe(200)
			expect(response.body.id).toBe(enterprise.id)
			expect(response.body.corporateReason).toBe('John Doe')
			expect(response.body.email).toBe(enterprise.email)
			expect(response.body.password).toBeUndefined()
		})

		it('should return 404 when enterprise is not found', async () => {
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer()).get(
				`/enterprise/${fakeId}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 when enterpriseId is not a valid UUID', async () => {
			const response = await request(app.getHttpServer()).get(
				'/enterprise/invalid-uuid-format'
			)

			expect(response.status).toBe(400)
		})
	})

	describe('GET /enterprise', () => {
		it('should return a paginated list of enterprises', async () => {
			await prisma.enterprise.createMany({
				data: [
					{
						corporateReason: 'John Doe',
						email: `johndoe@example.com`,
					},
					{
						corporateReason: 'John Doa',
						email: `johndoa@example.com`,
					},
				],
			})

			const response = await request(app.getHttpServer())
				.get('/enterprise')
				.query({ init: 0, limit: 10 })

			expect(response.status).toBe(200)
			expect(Array.isArray(response.body.enterprises)).toBe(true)
			expect(response.body.enterprises.length).toBeGreaterThanOrEqual(2)
		})

		it('should filter enterprises by corporateReason', async () => {
			const targetName = `John Doe`
			await prisma.enterprise.create({
				data: {
					corporateReason: targetName,
					email: 'johndoe@example.com',
				},
			})

			const response = await request(app.getHttpServer())
				.get('/enterprise')
				.query({ init: 0, limit: 10, corporateReason: targetName })

			expect(response.status).toBe(200)
			expect(response.body.enterprises[0].corporateReason).toBe(targetName)
		})

		it('should return empty data when no enterprise matches corporateReason filter', async () => {
			const response = await request(app.getHttpServer())
				.get('/enterprise')
				.query({ init: 0, limit: 10, corporateReason: 'NonExistentReason' })

			expect(response.status).toBe(200)
			expect(response.body.enterprises.length).toBe(0)
		})

		it('should filter enterprises by email', async () => {
			const email = `johndoe@example.com`
			await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email,
				},
			})

			const response = await request(app.getHttpServer())
				.get('/enterprise')
				.query({ init: 0, limit: 10, email })

			expect(response.status).toBe(200)
			expect(response.body.enterprises[0].email).toBe(email)
		})

		it('should return empty data when no enterprise matches email filter', async () => {
			const response = await request(app.getHttpServer())
				.get('/enterprise')
				.query({ init: 0, limit: 10, email: 'nonexistent@example.com' })

			expect(response.status).toBe(200)
			expect(response.body.enterprises.length).toBe(0)
		})
	})

	describe('PUT /enterprise/:enterpriseId', () => {
		it('should update enterprise data in the database', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: 'johndoe@example.com',
				},
			})

			const updateDto = {
				corporateReason: 'New Reason',
				email: 'johndoa@example.com',
			}

			const response = await request(app.getHttpServer())
				.put(`/enterprise/${enterprise.id}`)
				.send(updateDto)

			expect(response.status).toBe(200)

			const updatedDb = await prisma.enterprise.findUnique({
				where: { id: enterprise.id },
			})
			expect(updatedDb?.corporateReason).toBe('New Reason')
			expect(updatedDb?.email).toBe('johndoa@example.com')
		})

		it('should return 409 when updating to an email already in use', async () => {
			const existingEmail = 'johndoe@example.com'
			await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doe',
					email: existingEmail,
				},
			})

			const targetEnterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'John Doa',
					email: 'johndoa@example.com',
				},
			})

			const response = await request(app.getHttpServer())
				.put(`/enterprise/${targetEnterprise.id}`)
				.send({ email: existingEmail })

			expect(response.status).toBe(409)
		})

		it('should return 404 when enterprise does not exist', async () => {
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer())
				.put(`/enterprise/${fakeId}`)
				.send({ corporateReason: 'New' })

			expect(response.status).toBe(404)
		})
	})
})
