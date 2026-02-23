import { InMemoryEnterpriseRepository } from '@/enterprise/repositories/in-memory-enterprise.repository'
import { InMemoryUserRepository } from './repositories/in-memory-user.repository'
import { UserService } from './user.service'
import { compare } from 'bcryptjs'
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import { randomUUID } from 'crypto'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import { makeUser } from '@/test/factories/make-user'

let userRepository: InMemoryUserRepository
let enterpriseRepository: InMemoryEnterpriseRepository
let sut: UserService

describe('User Service', () => {
	beforeEach(async () => {
		userRepository = new InMemoryUserRepository()
		enterpriseRepository = new InMemoryEnterpriseRepository()
		sut = new UserService(enterpriseRepository, userRepository)
	})

	it('should be able to register user', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await expect(
			sut.create({
				email: 'johndoe@example.com',
				name: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
				enterpriseId: enterprise.id,
			})
		).resolves.toBeTruthy()
	})

	it('should not able to register user without a existent enterprise', async () => {
		await expect(
			sut.create({
				email: 'johndoe@example.com',
				name: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
				enterpriseId: randomUUID(),
			})
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('should not able to register user with a deleted enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await enterpriseRepository.delete(enterprise.id)

		await expect(
			sut.create({
				email: 'johndoe@example.com',
				name: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
				enterpriseId: enterprise.id,
			})
		).rejects.toBeInstanceOf(BadRequestException)
	})

	it('should hash user password upon registration', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await sut.create({
			email: 'johndoe@example.com',
			name: 'John Doe',
			password: '123456',
			confirmPassword: '123456',
			enterpriseId: enterprise.id,
		})

		const user = await userRepository.findByEmail('johndoe@example.com')

		const isPasswordCorrectlyHashed = await compare('123456', user!.password)

		expect(isPasswordCorrectlyHashed).toBe(true)
	})

	it('should not able to create with duplicated e-mail', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await sut.create({
			email: 'johndoe@example.com',
			name: 'John Doe',
			password: '123456',
			confirmPassword: '123456',
			enterpriseId: enterprise.id,
		})

		await expect(
			sut.create({
				email: 'johndoe@example.com',
				name: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
				enterpriseId: enterprise.id,
			})
		).rejects.toBeInstanceOf(ConflictException)
	})

	it('should be able to delete a user', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await sut.create({
			email: 'johndoe@example.com',
			name: 'John Doe',
			password: '123456',
			confirmPassword: '123456',
			enterpriseId: enterprise.id,
		})
		const user = await userRepository.findByEmail('johndoe@example.com')

		await expect(sut.delete(user!.id)).resolves.toBeTruthy()
	})

	it('should not be able to delete a inexistent user', async () => {
		await expect(sut.delete(randomUUID())).rejects.toBeInstanceOf(
			NotFoundException
		)
	})

	it('should be able to update a user', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		const user = await makeUser(userRepository, {
			enterpriseId: enterprise.id,
		})

		const email = 'johndoe2@example.com'
		const name = 'John Doe 2'

		await expect(
			sut.update(
				{
					email,
					name,
				},
				user.id
			)
		).resolves.toBeTruthy()

		const userUpdated = await userRepository.findById(user.id)

		expect(userUpdated?.email).toEqual(email)
		expect(userUpdated?.name).toEqual(name)
	})

	it('should not be able to update a inexistent user', async () => {
		await expect(
			sut.update(
				{
					email: 'johndoe2@example.com',
					name: 'John Doe 2',
				},
				randomUUID()
			)
		).rejects.toBeInstanceOf(NotFoundException)
	})

	it('should not be able to update a user email with a email already registered', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		const user = await makeUser(userRepository, {
			enterpriseId: enterprise.id,
		})

		const email = 'johndoe2@example.com'

		await makeUser(userRepository, {
			enterpriseId: enterprise.id,
			email,
		})

		await expect(
			sut.update(
				{
					email,
				},
				user.id
			)
		).rejects.toBeInstanceOf(ConflictException)
	})

	it('should be able show the user profile', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		const user = await makeUser(userRepository, {
			enterpriseId: enterprise.id,
		})

		await expect(sut.profile(user.id)).resolves.toBeTruthy()
	})

	it('should be able show the user enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		const user = await makeUser(userRepository, {
			enterpriseId: enterprise.id,
		})

		const profile = await sut.profile(user.id)

		expect(profile.enterprise).toBeInstanceOf(Object)
	})

	it('should not be able show the inexistent user profile', async () => {
		await expect(sut.profile(randomUUID())).rejects.toBeInstanceOf(
			NotFoundException
		)
	})
})
