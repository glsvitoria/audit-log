import { Log, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationDto } from '../dto/find-all-pagination.dto'

export abstract class LogRepository {
	abstract create(log: Prisma.LogCreateInput): Promise<Log>
	abstract delete(logId: string): Promise<Log>
	abstract findById(logId: string, enterpriseId?: string): Promise<Log | null>
	abstract findAll(findAllPaginationDto: FindAllPaginationDto): Promise<{
		logs: Log[]
		total: number
	}>
}
