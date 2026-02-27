import { Enterprise, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationEnterpriseDto } from '../dto/find-all-pagination.dto'
import { PrismaTransactionClient } from '@/database/prisma/prisma.service'

export abstract class EnterpriseRepository {
	abstract create(
		enterprise: Prisma.EnterpriseCreateInput,
		tx?: PrismaTransactionClient
	): Promise<Enterprise>
	abstract delete(enterpriseId: string): Promise<Enterprise | null>
	abstract disable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise | null>
	abstract enable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise | null>
	abstract findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	): Promise<{
		enterprises: Enterprise[]
		total: number
	}>
	abstract findByEmail(email: string): Promise<Enterprise | null>
	abstract findByEmail(email: string): Promise<Enterprise | null>
	abstract findById(id: string): Promise<Enterprise | null>
	abstract update(
		enterpriseId: string,
		enterprise: Prisma.EnterpriseUpdateInput
	): Promise<Enterprise>
}
