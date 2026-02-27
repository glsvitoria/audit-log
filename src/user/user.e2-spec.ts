import { AppModule } from '@/app.module'
import { INestApplication, ValidationPipe } from '@nestjs/common'
import { Test } from '@nestjs/testing'
import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import request from 'supertest'
import { randomUUID } from 'node:crypto'
import { UserRole } from '@/generated/prisma/enums'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { PrismaService } from '@/database/prisma/prisma.service'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'

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

	describe('POST /user', () => {
		it('should create a new user with a hashed password and link to an enterprise', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'NestJS Masters',
					email: `enterprise-${randomUUID()}@test.com`,
				},
			})

			currentUserMock.role = UserRole.ADMIN

			const createUserDto = {
				email: `new-user-${randomUUID()}@example.com`,
				name: 'John E2E Doe',
				password: 'password123',
				confirmPassword: 'password123',
				enterpriseId: enterprise.id,
			}

			const response = await request(app.getHttpServer())
				.post('/user')
				.send(createUserDto)

			expect(response.status).toBe(201)
			expect(response.body.message).toBe(SuccessMessagesHelper.USER_CREATED)

			const userInDb = await prisma.user.findFirst({
				where: { email: createUserDto.email },
			})

			expect(userInDb).toBeTruthy()
			expect(userInDb?.name).toBe('John E2E Doe')
			expect(userInDb?.enterpriseId).toBe(enterprise.id)

			expect(userInDb?.password).not.toBe('password123')
			expect(userInDb?.password.length).toBeGreaterThan(20)
		})

		it('should return 400 if the enterpriseId does not exist', async () => {
			currentUserMock.role = UserRole.ADMIN
			const fakeEnterpriseId = randomUUID()

			const response = await request(app.getHttpServer()).post('/user').send({
				email: 'error@test.com',
				name: 'Error User',
				password: 'password123',
				confirmPassword: 'password123',
				enterpriseId: fakeEnterpriseId,
			})

			expect(response.status).toBe(400)
		})

		it('should return 409 if the email is already in use', async () => {
			const existingEmail = 'duplicate@test.com'

			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'NestJS Masters',
					email: `enterprise-${randomUUID()}@test.com`,
				},
			})

			await prisma.user.create({
				data: {
					email: existingEmail,
					name: 'Existing',
					password: '123',
					enterpriseId: enterprise.id,
				},
			})

			currentUserMock.role = UserRole.ADMIN

			const response = await request(app.getHttpServer()).post('/user').send({
				email: existingEmail,
				name: 'Attempt Two',
				password: 'password123',
				confirmPassword: 'password123',
				enterpriseId: enterprise.id,
			})

			expect(response.status).toBe(409)
		})
	})

	describe('GET /user/profile', () => {
		it('should return the profile of the currently authenticated user', async () => {
			const enterprise = await prisma.enterprise.create({
				data: {
					corporateReason: 'Profile Tech',
					email: `corp-${randomUUID()}@test.com`,
				},
			})

			const user = await prisma.user.create({
				data: {
					email: `me-${randomUUID()}@test.com`,
					name: 'Authenticated User',
					password: 'hashed_password',
					role: UserRole.ENTERPRISE,
					enterpriseId: enterprise.id,
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer()).get('/user/profile')

			expect(response.status).toBe(200)

			expect(response.body.email).toBe(user.email)
			expect(response.body.name).toBe('Authenticated User')

			expect(response.body.enterprise).toBeTruthy()
			expect(response.body.enterprise.id).toBe(enterprise.id)
			expect(response.body.enterprise.corporateReason).toBe('Profile Tech')

			expect(response.body.password).toBeUndefined()
		})

		it('should return 404 if the user in the token does not exist in database', async () => {
			currentUserMock.sub = randomUUID()
			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer()).get('/user/profile')

			expect(response.status).toBe(404)
		})
	})

	describe('PUT /user/profile', () => {
		it('should allow a user to update their own profile', async () => {
			const user = await prisma.user.create({
				data: {
					email: `update-me-${randomUUID()}@test.com`,
					name: 'Old Name',
					password: 'hashed_password',
					role: UserRole.ENTERPRISE,
				},
			})

			currentUserMock.sub = user.id
			currentUserMock.role = UserRole.ENTERPRISE

			const updateDto = {
				name: 'New Updated Name',
				email: `new-email-${randomUUID()}@test.com`,
			}

			const response = await request(app.getHttpServer())
				.put('/user/profile')
				.send(updateDto)

			expect(response.status).toBe(200)
			expect(response.body.message).toBeDefined()

			const updatedUser = await prisma.user.findFirst({
				where: { id: user.id },
			})

			expect(updatedUser?.name).toBe('New Updated Name')
			expect(updatedUser?.email).toBe(updateDto.email)
		})

		it('should return 409 if user tries to update to an email already taken by another', async () => {
			await prisma.user.create({
				data: { email: 'userA@test.com', name: 'User A', password: '123' },
			})
			const user = await prisma.user.create({
				data: { email: 'userB@test.com', name: 'User B', password: '123' },
			})

			currentUserMock.sub = user.id
			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer())
				.put('/user/profile')
				.send({ email: 'userA@test.com' })

			expect(response.status).toBe(409)
		})
	})

	describe('DELETE /user/:userId', () => {
		it('should delete a user from the real database as ADMIN', async () => {
			const userToDelete = await prisma.user.create({
				data: {
					email: `delete-me-${randomUUID()}@test.com`,
					name: 'To Be Deleted',
					password: 'hashed_password',
				},
			})

			currentUserMock.role = UserRole.ADMIN

			const response = await request(app.getHttpServer()).delete(
				`/user/${userToDelete.id}`
			)

			expect(response.status).toBe(200)
			expect(response.body.message).toBeDefined()

			const userInDb = await prisma.user.findFirst({
				where: { id: userToDelete.id },
			})
			expect(userInDb).toBeNull()
		})

		it('should return 404 (Not Found) when trying to delete a non-existent user', async () => {
			currentUserMock.role = UserRole.ADMIN
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer()).delete(
				`/user/${fakeId}`
			)

			expect(response.status).toBe(404)
		})

		it('should return 400 (Bad Request) if userId is not a valid UUID', async () => {
			currentUserMock.role = UserRole.ADMIN

			const response = await request(app.getHttpServer()).delete(
				'/user/id-invalido-123'
			)

			expect(response.status).toBe(400)
		})

		it('should return 403 (Forbidden) if an ENTERPRISE tries to delete a user', async () => {
			const user = await prisma.user.create({
				data: {
					email: `save-${randomUUID()}@test.com`,
					name: 'Safe',
					password: '123',
				},
			})

			currentUserMock.role = UserRole.ENTERPRISE

			const response = await request(app.getHttpServer()).delete(
				`/user/${user.id}`
			)

			expect(response.status).toBe(403)

			const userStillExists = await prisma.user.findFirst({
				where: { id: user.id },
			})
			expect(userStillExists).toBeTruthy()
		})
	})

	describe('PUT /user/:userId', () => {
		it('should update any user as ADMIN', async () => {
			const originalUser = await prisma.user.create({
				data: {
					email: `original-${randomUUID()}@test.com`,
					name: 'Original Name',
					password: 'hashed_password',
				},
			})

			currentUserMock.role = UserRole.ADMIN

			const updateDto = {
				name: 'Updated Name',
				email: `updated-${randomUUID()}@test.com`,
			}

			const response = await request(app.getHttpServer())
				.put(`/user/${originalUser.id}`)
				.send(updateDto)

			expect(response.status).toBe(200)
			expect(response.body.message).toBeDefined()

			const updatedUserDb = await prisma.user.findFirst({
				where: { id: originalUser.id },
			})
			expect(updatedUserDb?.name).toBe('Updated Name')
			expect(updatedUserDb?.email).toBe(updateDto.email)
		})

		it('should return 409 (Conflict) when updating to an existing email', async () => {
			const existingEmail = 'already@exists.com'
			await prisma.user.create({
				data: { email: existingEmail, name: 'Existing', password: '123' },
			})

			const userToUpdate = await prisma.user.create({
				data: { email: 'target@test.com', name: 'Target', password: '123' },
			})

			currentUserMock.role = UserRole.ADMIN

			const response = await request(app.getHttpServer())
				.put(`/user/${userToUpdate.id}`)
				.send({ email: existingEmail })

			expect(response.status).toBe(409)
		})

		it('should return 404 when user does not exist', async () => {
			currentUserMock.role = UserRole.ADMIN
			const fakeId = randomUUID()

			const response = await request(app.getHttpServer())
				.put(`/user/${fakeId}`)
				.send({ name: 'New Name' })

			expect(response.status).toBe(404)
		})
	})
})
