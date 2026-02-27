import { ApiKey } from '@/generated/prisma/client'
import { ApiKeyRepository, CreateApiKeyProps } from './api-key.types'
import { ApiKeyUpdateInput } from '@/generated/prisma/models'
import { FindAllPaginationApiKeyDto } from '../dto/find-all-pagination.dto'
import { randomUUID } from 'crypto'
import { hashApiKey } from '@/utils/hash-api-key'

export class InMemoryApiKeyRepository implements ApiKeyRepository {
	private apiKeys: ApiKey[] = []

	constructor() {}

	async create(props: CreateApiKeyProps) {
		const apiKeyHashed = hashApiKey()

		const newApiKey: ApiKey = {
			description: props.description ?? null,
			enterpriseId: props.enterpriseId,
			id: randomUUID(),
			keyHash: apiKeyHashed,
			createdAt: new Date(),
			deletedAt: null,
			disabledAt: null,
			lastUsedAt: null,
			updatedAt: null,
		}

		this.apiKeys.push(newApiKey)

		return {
			apiKey: apiKeyHashed,
		}
	}

	async delete(apiKeyId: string) {
		const index = this.apiKeys.findIndex(
			(apiKey) => apiKey.id === apiKeyId && !apiKey.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.apiKeys[index] = {
			...this.apiKeys[index],
			deletedAt: new Date(),
			updatedAt: new Date(),
		}

		return this.apiKeys[index]
	}

	async deleteByEnterpriseId(enterpriseId: string) {
		for (const apiKey of this.apiKeys) {
			if (apiKey.enterpriseId === enterpriseId && !apiKey.deletedAt) {
				apiKey.deletedAt = new Date()
				apiKey.updatedAt = new Date()
			}
		}

		return
	}

	async disable(apiKeyId: string) {
		const index = this.apiKeys.findIndex(
			(apiKey) =>
				apiKey.id === apiKeyId && !apiKey.deletedAt && !apiKey.disabledAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.apiKeys[index] = {
			...this.apiKeys[index],
			disabledAt: new Date(),
			updatedAt: new Date(),
		}

		return this.apiKeys[index]
	}

	async disableByEnterpriseId(enterpriseId: string): Promise<void> {
		for (const apiKey of this.apiKeys) {
			if (
				apiKey.enterpriseId === enterpriseId &&
				!apiKey.disabledAt &&
				!apiKey.deletedAt
			) {
				apiKey.disabledAt = new Date()
				apiKey.updatedAt = new Date()
			}
		}

		return
	}

	async enable(apiKeyId: string) {
		const index = this.apiKeys.findIndex(
			(apiKey) =>
				apiKey.id === apiKeyId && !apiKey.deletedAt && !!apiKey.disabledAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.apiKeys[index] = {
			...this.apiKeys[index],
			disabledAt: null,
			updatedAt: new Date(),
		}

		return this.apiKeys[index]
	}

	async enableByEnterpriseId(enterpriseId: string) {
		for (const apiKey of this.apiKeys) {
			if (
				apiKey.enterpriseId === enterpriseId &&
				!!apiKey.disabledAt &&
				!apiKey.deletedAt
			) {
				apiKey.disabledAt = new Date()
				apiKey.updatedAt = new Date()
			}
		}

		return
	}

	async findById(apiKeyId: string, enterpriseId?: string) {
		const index = this.apiKeys.findIndex(
			(apiKey) =>
				apiKey.id === apiKeyId &&
				!apiKey.deletedAt &&
				(enterpriseId ? apiKey.enterpriseId === enterpriseId : true)
		)

		if (index === -1) {
			return null
		}

		return this.apiKeys[index]
	}

	async findByApiKey(apiKey: string) {
		const index = this.apiKeys.findIndex(
			(apiKeyItem) => apiKeyItem.keyHash === apiKey && !apiKeyItem.deletedAt
		)

		if (index === -1) {
			return null
		}

		return this.apiKeys[index]
	}

	async findAll(findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto) {
		const { init, limit, enterpriseId } = findAllPaginationApiKeyDto

		const apiKeysSorted = [...this.apiKeys].sort((a, b) => {
			if (a.createdAt > b.createdAt) return 1
			else if (a.createdAt < b.createdAt) return -1

			return 0
		})

		const apiKeysFiltered = apiKeysSorted.filter((apiKey) => {
			if (apiKey.deletedAt) return false

			if (enterpriseId && apiKey.enterpriseId !== enterpriseId) {
				return false
			}

			return true
		})

		return {
			apiKeys: apiKeysFiltered.slice(init, init + limit),
			total: apiKeysFiltered.length,
		}
	}

	async update(apiKey: ApiKeyUpdateInput, apiKeyId: string): Promise<ApiKey> {
		const index = this.apiKeys.findIndex(
			(apiKey) => apiKey.id === apiKeyId && !apiKey.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.apiKeys[index] = {
			...this.apiKeys[index],
			description: apiKey.description?.toString() ?? null,
			updatedAt: new Date(),
		}

		return this.apiKeys[index]
	}

	async updateLastUsed(apiKeyId: string) {
		const index = this.apiKeys.findIndex(
			(apiKey) => apiKey.id === apiKeyId && !apiKey.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.apiKeys[index] = {
			...this.apiKeys[index],
			lastUsedAt: new Date(),
			updatedAt: new Date(),
		}

		return
	}
}
