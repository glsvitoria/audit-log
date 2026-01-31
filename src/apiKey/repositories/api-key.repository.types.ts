export interface IApiKeyRepository {
	create(props: CreateApiKeyProps): Promise<CreateApiKeyReturn>
}

export interface CreateApiKeyProps {
	enterpriseId: string
	description?: string
}

export interface CreateApiKeyReturn {
	apiKey: string
}
