import { PrismaTransactionClient } from '@/database/prisma/prisma.service'
import { ApiKey, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationApiKeyDto } from '../dto/find-all-pagination.dto'

export abstract class ApiKeyRepository {
	abstract create(
		props: CreateApiKeyProps,
		tx?: PrismaTransactionClient
	): Promise<CreateApiKeyReturn>
	abstract delete(apiKeyId: string): Promise<ApiKey>
	abstract deleteByEnterpriseId(enterpriseId: string): Promise<void>
	abstract disable(apiKeyId: string): Promise<ApiKey | null>
	abstract disableByEnterpriseId(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<void>
	abstract enable(apiKeyId: string): Promise<ApiKey | null>
	abstract enableByEnterpriseId(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<void>
	abstract findById(apiKeyId: string, enterpriseId?: string): Promise<ApiKey | null>
	abstract findByApiKey(apiKey: string): Promise<ApiKey | null>
	abstract findAll(findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto): Promise<{
		apiKeys: ApiKey[]
		total: number
	}>
	abstract update(apiKey: Prisma.ApiKeyUpdateInput, apiKeyId: string): Promise<ApiKey>
	abstract updateLastUsed(apiKeyId: string): Promise<void>
}

export interface CreateApiKeyProps {
	enterpriseId: string
	description?: string
}

export interface CreateApiKeyReturn {
	apiKey: string
}
