import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { EnterpriseService } from './enterprise.service'
import { InMemoryEnterpriseRepository } from './repositories/in-memory-enterprise.repository'
import { InMemoryApiKeyRepository } from '@/apiKey/repositories/in-memory-api-key.repository'
import { PrismaService } from '@/database/prisma/prisma.service'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import {
	BadRequestException,
	ConflictException,
	NotFoundException,
} from '@nestjs/common'
import { makeUser } from '@/test/factories/make-user'
import { randomUUID } from 'crypto'

let apiKeyRepository: InMemoryApiKeyRepository
let enterpriseRepository: InMemoryEnterpriseRepository
let userRepository: InMemoryUserRepository
let prismaService: PrismaService
let sut: EnterpriseService

describe('Enterprise Service', () => {
	beforeEach(async () => {
		apiKeyRepository = new InMemoryApiKeyRepository()
		enterpriseRepository = new InMemoryEnterpriseRepository()
		userRepository = new InMemoryUserRepository()
		prismaService = new PrismaService()
		sut = new EnterpriseService(
			apiKeyRepository,
			enterpriseRepository,
			userRepository,
			prismaService
		)
	})

	it('should be able to create a enterprise, a user and a api key', async () => {
		const apiKey = await sut.create({
			corporateReason: 'John Doe Entertainment',
			email: 'johndoeentertainment@example.com',
			responsibleName: 'John Doe',
			password: '123456',
			confirmPassword: '123456',
		})

		expect(apiKey).toBeDefined()

		const user = await userRepository.findByEmail(
			'johndoeentertainment@example.com'
		)

		expect(user?.id).toBeDefined()
	})

	it('should not be able to create a enterprise with same e-mail', async () => {
		await makeEnterprise(enterpriseRepository, {
			email: 'johndoeentertainment@example.com',
		})

		await expect(
			sut.create({
				corporateReason: 'John Doe Entertainment',
				email: 'johndoeentertainment@example.com',
				responsibleName: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
			})
		).rejects.toBeInstanceOf(ConflictException)
	})

	it('should not be able to create a enterprise with same user e-mail', async () => {
		await makeEnterprise(enterpriseRepository, {
			email: 'johndoeentertainment@example.com',
		})

		await makeUser(userRepository, {
			email: 'johndoeentertainment2@example.com',
		})

		await expect(
			sut.create({
				corporateReason: 'John Doe Entertainment',
				email: 'johndoeentertainment2@example.com',
				responsibleName: 'John Doe',
				password: '123456',
				confirmPassword: '123456',
			})
		).rejects.toBeInstanceOf(ConflictException)
	})

	it('should be able to delete a enterprise and user', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository, {
			email: 'johndoeentertainment@example.com',
		})

		await expect(sut.delete(enterprise.id)).resolves.toBeTruthy()

		const enterpriseFinde = await enterpriseRepository.findById(enterprise.id)
		const userFinde = await userRepository.findByEmail(
			'johndoeentertainment@example.com'
		)

		expect(enterpriseFinde).toBeNull()
		expect(userFinde).toBeNull()
	})

	it('should not be able to delete a inexistent enterprise', async () => {
		await expect(sut.delete(randomUUID())).rejects.toBeInstanceOf(
			NotFoundException
		)
	})

	it('should be able to disable a enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await expect(sut.disable(enterprise.id)).resolves.toBeTruthy()

		const enterpriseFinde = await enterpriseRepository.findById(enterprise.id)

		expect(enterpriseFinde?.disabledAt).toBeDefined()
	})

	it('should not be able to disable a disabled enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await enterpriseRepository.disable(enterprise.id)

		await expect(sut.disable(enterprise.id)).rejects.toBeInstanceOf(
			BadRequestException
		)
	})

	it('should be able to enable a enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await enterpriseRepository.disable(enterprise.id)

		await expect(sut.enable(enterprise.id)).resolves.toBeTruthy()

		const enterpriseFinde = await enterpriseRepository.findById(enterprise.id)

		expect(enterpriseFinde?.disabledAt).toBeNull()
	})

	it('should not be able to enable a enabled enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await expect(sut.enable(enterprise.id)).rejects.toBeInstanceOf(
			BadRequestException
		)
	})

	it('should be able to show a enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		const enterpriseFinde = await sut.find(enterprise.id)

		expect(enterpriseFinde.id).toBeDefined()
	})

	it('should not be able to show a inexistent enterprise', async () => {
		await expect(sut.find(randomUUID())).rejects.toBeInstanceOf(
			NotFoundException
		)
	})

	it('should be able to update a enterprise', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository)

		await sut.update(enterprise.id, {
			corporateReason: 'New Enterprise Name',
			email: 'new-enterprise-email@example.com',
		})

		const enterpriseUpdated = await enterpriseRepository.findById(enterprise.id)

		expect(enterpriseUpdated?.corporateReason).toEqual('New Enterprise Name')
		expect(enterpriseUpdated?.email).toEqual('new-enterprise-email@example.com')
	})

	it('should not be able to update a inexistent enterprise', async () => {
		await expect(
			sut.update(randomUUID(), {
				corporateReason: 'New Enterprise Name',
			})
		).rejects.toBeInstanceOf(NotFoundException)
	})

	it('should not be able to update a enterprise e-mail to a e-mail already in use', async () => {
		const enterprise = await makeEnterprise(enterpriseRepository, {
			email: 'johndoeentertainment@example.com',
		})

		await makeEnterprise(enterpriseRepository, {
			email: 'johndoeentertainment2@example.com',
		})

		await expect(
			sut.update(enterprise.id, {
				email: 'johndoeentertainment2@example.com',
			})
		).rejects.toBeInstanceOf(ConflictException)
	})
})
