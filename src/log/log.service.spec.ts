import { LogService } from './log.service'
import { InMemoryLogRepository } from './repositories/in-memory-log.repository'
import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { InMemoryApiKeyRepository } from '@/apiKey/repositories/in-memory-api-key.repository'
import { InMemoryEnterpriseRepository } from '@/enterprise/repositories/in-memory-enterprise.repository'
import { makeEnterprise } from '@/test/factories/make-enterprise'
import { NotFoundException, UnauthorizedException } from '@nestjs/common'
import { randomUUID } from 'crypto'
import { makeUser } from '@/test/factories/make-user'
import { makeLog } from '@/test/factories/make-log'

let logRepository: InMemoryLogRepository
let userRepository: InMemoryUserRepository
let apiKeyRepository: InMemoryApiKeyRepository
let enterpriseRepository: InMemoryEnterpriseRepository
let sut: LogService

describe('Log Service', () => {
	beforeEach(async () => {
		logRepository = new InMemoryLogRepository()
		userRepository = new InMemoryUserRepository()
		apiKeyRepository = new InMemoryApiKeyRepository()
		enterpriseRepository = new InMemoryEnterpriseRepository()

		sut = new LogService(apiKeyRepository, logRepository, userRepository)
	})

	describe('create', () => {
		it('should be able to create a log with a valid api key', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const { apiKey } = await apiKeyRepository.create({
				enterpriseId: enterprise.id,
			})

			const log = await sut.create(
				{
					action: 'CREATE_USER',
					entity: 'USER',
					entityId: randomUUID(),
					actorRole: 'ADMIN',
					actorId: randomUUID(),
					message: 'User created successfully',
				},
				apiKey
			)

			expect(log).toBeDefined()
		})

		it('should not be able to create a log with an invalid api key', async () => {
			await expect(
				sut.create(
					{
						action: 'ANY_ACTION',
						actorRole: 'USER',
						actorId: randomUUID(),
						entityId: randomUUID(),
					},
					'invalid-key'
				)
			).rejects.toBeInstanceOf(UnauthorizedException)
		})
	})

	describe('delete', () => {
		it('should be able to delete a log if it belongs to the user enterprise', async () => {
			const enterprise = await makeEnterprise(enterpriseRepository)

			const user = await makeUser(userRepository, {
				enterpriseId: enterprise.id,
			})

			const log = await makeLog(logRepository, { enterpriseId: enterprise.id })

			await expect(sut.delete(log.id, user.id)).resolves.toBeTruthy()

			const logFinde = await logRepository.findById(log.id)

			expect(logFinde).toBeNull()
		})

		it('should not be able to delete a log from another enterprise', async () => {
			const user = await makeUser(userRepository)
			const log = await makeLog(logRepository)

			await expect(sut.delete(log.id, user.id)).rejects.toBeInstanceOf(
				NotFoundException
			)
		})

		it('should not be able to delete a inexistent log', async () => {
			const user = await makeUser(userRepository)

			await expect(sut.delete(randomUUID(), user.id)).rejects.toBeInstanceOf(
				NotFoundException
			)
		})

		it('should not be able to delete a log with inexistent user', async () => {
			const log = await makeLog(logRepository)

			await expect(sut.delete(log.id, randomUUID())).rejects.toBeInstanceOf(
				NotFoundException
			)
		})
	})

	describe('find', () => {
		it('should be able to find a log by id', async () => {
			const log = await makeLog(logRepository)
			const result = await sut.find(log.id)

			expect(result.id).toEqual(log.id)
		})

		it('should not be able to find a inexistent log', async () => {
			await expect(sut.find(randomUUID())).rejects.toBeInstanceOf(
				NotFoundException
			)
		})
	})
})
