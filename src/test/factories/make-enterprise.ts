import { InMemoryEnterpriseRepository } from '@/enterprise/repositories/in-memory-enterprise.repository'

interface MakeEnterpriseOverride {
	corporateReason: string
	email: string
}

export async function makeEnterprise(
	repository: InMemoryEnterpriseRepository,
	override: Partial<MakeEnterpriseOverride> = {}
) {
	return repository.create({
		corporateReason: override.corporateReason ?? 'John Doe Entertainment',
		email: override.email ?? 'johndoeentertainment@example.com',
	})
}
