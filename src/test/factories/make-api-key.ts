import { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import { randomUUID } from 'crypto'

interface MakeApiKeyOverride {
	description: string
	enterpriseId: string
}

export async function makeApiKey(
	repository: ApiKeyRepository,
	override: Partial<MakeApiKeyOverride> = {}
) {
	return repository.create({
		description: override.description ?? 'Default API Key Description',
		enterpriseId: override.enterpriseId ?? randomUUID(),
	})
}
