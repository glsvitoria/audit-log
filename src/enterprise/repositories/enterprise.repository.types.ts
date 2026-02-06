import { Enterprise, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationEnterpriseDto } from '../dto/find-all-pagination.dto'

export interface IEnterpriseRepository {
	create(enterprise: Prisma.EnterpriseCreateInput): Promise<Enterprise>
	delete(enterpriseId: string): Promise<Enterprise | null>
	disable(enterpriseId: string): Promise<Enterprise | null>
	enable(enterpriseId: string): Promise<Enterprise | null>
	findActiveById(id: string): Promise<Enterprise | null>
	findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	): Promise<{
		enterprises: Enterprise[]
		total: number
	}>
	findByApiKey(apiKey: string): Promise<Enterprise | null>
	findByEmail(email: string): Promise<Enterprise | null>
	findById(id: string): Promise<Enterprise | null>
	findByUserId(userId: string): Promise<Enterprise | null>
	update(
		enterpriseId: string,
		enterprise: Prisma.EnterpriseUpdateInput
	): Promise<Enterprise>
}
