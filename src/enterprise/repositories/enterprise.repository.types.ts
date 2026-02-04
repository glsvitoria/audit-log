import { Enterprise, Prisma } from '@/generated/prisma/client'

export interface IEnterpriseRepository {
	create(enterprise: Prisma.EnterpriseCreateInput): Promise<Enterprise>
	delete(enterprise_id: string): Promise<Enterprise | null>
	findByApiKey(apiKey: string): Promise<Enterprise | null>
	findByEmail(email: string): Promise<Enterprise | null>
	findById(id: string): Promise<Enterprise | null>
	findByUserId(user_id: string): Promise<Enterprise | null>
	update(
		enterprise_id: string,
		enterprise: Prisma.EnterpriseUpdateInput
	): Promise<Enterprise>
}
