import { ApiKey } from '@/generated/prisma/client'

export interface IApiKeyRepository {
	create(props: CreateApiKeyProps): Promise<CreateApiKeyReturn>
	deleteByEnterpriseId(enterprise_id: string): Promise<null>
	find(apiKey: string): Promise<ApiKey | null>
	updateLastUsed(apiKeyId: string): Promise<void>
}

export interface CreateApiKeyProps {
	enterpriseId: string
	description?: string
}

export interface CreateApiKeyReturn {
	apiKey: string
}
