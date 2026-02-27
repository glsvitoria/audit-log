import { ApiKeyService } from './api-key.service'
import { InMemoryApiKeyRepository } from './repositories/in-memory-api-key.repository'
import { InMemoryEnterpriseRepository } from '@/enterprise/repositories/in-memory-enterprise.repository'
import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import { makeUser } from '@/test/factories/make-user'
import { BadRequestException, NotFoundException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { makeApiKey } from '@/test/factories/make-api-key'

let apiKeyRepository: InMemoryApiKeyRepository
let enterpriseRepository: InMemoryEnterpriseRepository
let userRepository: InMemoryUserRepository
let sut: ApiKeyService

describe('ApiKey Service', () => {
	beforeEach(async () => {
		apiKeyRepository = new InMemoryApiKeyRepository()
		enterpriseRepository = new InMemoryEnterpriseRepository()
		userRepository = new InMemoryUserRepository()

		sut = new ApiKeyService(
			apiKeyRepository,
			enterpriseRepository,
			userRepository
		)
	})

	describe('create', () => {
		it('should be able to create a new api key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const apiKey = await sut.create({
				enterpriseId: enterprise.id,
			})

			expect(apiKey).toBeDefined()
		})

		it('should not be able to create a key for a non-existent enterprise', async () => {
			await expect(
				sut.create({
					enterpriseId: randomUUID(),
				})
			).rejects.toBeInstanceOf(NotFoundException)
		})
	})

	describe('createByEnterprise', () => {
		it('should be able to create a key using user context', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKey = await sut.createByEnterprise({}, user.id)

			expect(apiKey).toBeDefined()
		})

		it('should not be able to create a key using non-existent user', async () => {
			await expect(
				sut.createByEnterprise({}, randomUUID())
			).rejects.toBeInstanceOf(NotFoundException)
		})
	})

	describe('delete', () => {
		it('should be able to delete an api key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await expect(sut.delete(apiKeyCreated!.id, user.id)).resolves.toBeTruthy()

			const apiKeyFinde = await apiKeyRepository.findByApiKey(apiKey)

			expect(apiKeyFinde).toBeNull()
		})

		it('should not be able to delete a key from another enterprise', async () => {
			const enterprise1 = await makeEnterprise(enterpriseRepository)
			const enterprise2 = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise1.id,
			})

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise2.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await expect(
				sut.delete(apiKeyCreated!.id, user.id)
			).rejects.toBeInstanceOf(NotFoundException)
		})
	})

	describe('disable/enable', () => {
		it('should be able to disable an active api key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await expect(
				sut.disable(apiKeyCreated!.id, user.id)
			).resolves.toBeTruthy()
		})

		it('should not be able to disable an already disabled key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await apiKeyRepository.disable(apiKeyCreated!.id)

			await expect(
				sut.disable(apiKeyCreated!.id, user.id)
			).rejects.toBeInstanceOf(BadRequestException)
		})

		it('should be able to enable a disabled api key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await apiKeyRepository.disable(apiKeyCreated!.id)

			await expect(sut.enable(apiKeyCreated!.id, user.id)).resolves.toBeTruthy()
		})

		it('should not be able to enable an already enabled key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await expect(
				sut.enable(apiKeyCreated!.id, user.id)
			).rejects.toBeInstanceOf(BadRequestException)
		})
	})

	describe('update', () => {
		it('should be able to update an api key description', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)
			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})
			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await sut.update(
				{ description: 'New Description' },
				apiKeyCreated!.id,
				user.id
			)

			const apiKeyUpdated = await apiKeyRepository.findByApiKey(apiKey)

			expect(apiKeyUpdated!.description).toEqual('New Description')
		})

		it('should not be able to update an api key with a inexistent user', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const { apiKey } = await makeApiKey(apiKeyRepository, {
				enterpriseId: enterprise.id,
			})

			const apiKeyCreated = await apiKeyRepository.findByApiKey(apiKey)

			await expect(
				sut.update(
					{ description: 'New Description' },
					apiKeyCreated!.id,
					randomUUID()
				)
			).rejects.toBeInstanceOf(NotFoundException)
		})
	})
})
