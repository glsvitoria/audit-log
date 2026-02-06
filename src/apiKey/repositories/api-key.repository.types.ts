import { PrismaTransactionClient } from '@/database/prisma/prisma.service'
import { ApiKey, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationApiKeyDto } from '../dto/find-all-pagination.dto'

export interface IApiKeyRepository {
	create(
		props: CreateApiKeyProps,
		tx?: PrismaTransactionClient
	): Promise<CreateApiKeyReturn>
	delete(apiKeyId: string): Promise<ApiKey>
	deleteByEnterpriseId(enterpriseId: string): Promise<void>
	disable(apiKey_id: string): Promise<ApiKey | null>
	disableByEnterpriseId(enterpriseId: string): Promise<void>
	find(apiKey: string, enterpriseId?: string): Promise<ApiKey | null>
	findEnabled(apiKey: string): Promise<ApiKey | null>
	findAll(findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto): Promise<{
		apiKeys: ApiKey[]
		total: number
	}>
	update(apiKey: Prisma.ApiKeyUpdateInput, apiKeyId: string): Promise<ApiKey>
	updateLastUsed(apiKeyId: string): Promise<void>
}

export interface CreateApiKeyProps {
	enterpriseId?: string
	description?: string
}

export interface CreateApiKeyReturn {
	apiKey: string
}
