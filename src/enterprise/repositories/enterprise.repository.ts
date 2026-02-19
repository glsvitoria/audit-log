import { Enterprise, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationEnterpriseDto } from '../dto/find-all-pagination.dto'
import { PrismaTransactionClient } from '@/database/prisma/prisma.service'

export interface EnterpriseRepository {
	create(
		enterprise: Prisma.EnterpriseCreateInput,
		tx?: PrismaTransactionClient
	): Promise<Enterprise>
	delete(enterpriseId: string): Promise<Enterprise | null>
	disable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise | null>
	enable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise | null>
	findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	): Promise<{
		enterprises: Enterprise[]
		total: number
	}>
	findByEmail(email: string): Promise<Enterprise | null>
	findById(id: string): Promise<Enterprise | null>
	update(
		enterpriseId: string,
		enterprise: Prisma.EnterpriseUpdateInput
	): Promise<Enterprise>
}
