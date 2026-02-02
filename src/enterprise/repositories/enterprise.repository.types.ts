import { Enterprise, Prisma } from '@/generated/prisma/client'

export interface IEnterpriseRepository {
	create(enterprise: Prisma.EnterpriseCreateInput): Promise<Enterprise>
	findByEmail(email: string): Promise<Enterprise | null>
	findByApiKey(apiKey: string): Promise<Enterprise | null>
}
