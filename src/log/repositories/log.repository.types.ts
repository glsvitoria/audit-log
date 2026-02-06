import { Log, Prisma } from '@/generated/prisma/client'
import { FindAllPaginationDto } from '../dto/find-all-pagination.dto'

export interface ILogRepository {
	create(log: Prisma.LogCreateInput): Promise<Log>
	delete(logId: string): Promise<Log>
	findById(logId: string, enterpriseId?: string): Promise<Log | null>
	findAll(findAllPaginationDto: FindAllPaginationDto): Promise<{
		logs: Log[]
		total: number
	}>
}
