import { InMemoryApiKeyRepository } from '@/apiKey/repositories/in-memory-api-key.repository'
import { randomUUID } from 'crypto'

interface MakeApiKeyOverride {
	description: string
	enterpriseId: string
}

export async function makeApiKey(
	repository: InMemoryApiKeyRepository,
	override: Partial<MakeApiKeyOverride> = {}
) {
	return repository.create({
		description: override.description ?? 'Default API Key Description',
		enterpriseId: override.enterpriseId ?? randomUUID(),
	})
}
