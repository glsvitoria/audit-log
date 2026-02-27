import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

interface MakeEnterpriseOverride {
	corporateReason: string
	email: string
}

export async function makeEnterprise(
	repository: EnterpriseRepository,
	override: Partial<MakeEnterpriseOverride> = {}
) {
	return repository.create({
		corporateReason: override.corporateReason ?? 'John Doe Entertainment',
		email: override.email ?? 'johndoeentertainment@example.com',
	})
}
