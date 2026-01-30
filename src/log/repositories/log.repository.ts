import { Injectable } from '@nestjs/common'
import { ILogRepository } from './log.repository.types'
import { Prisma } from '@/generated/prisma/client'
import { PrismaService } from 'src/database/prisma/prisma.service'
import { FindAllPaginationDto } from '../dto/find-all-pagination.dto'

@Injectable()
export class LogRepository implements ILogRepository {
	constructor(private prismaService: PrismaService) {}

	async create(log: Prisma.LogCreateInput) {
		return await this.prismaService.log.create({ data: log })
	}

	async find(log_id: string) {
		return await this.prismaService.log.findUnique({ where: { id: log_id } })
	}

	async findAll(findAllPaginationDto: FindAllPaginationDto) {
		const [logs, total] = await Promise.all([
			await this.prismaService.log.findMany({
				...findAllPaginationDto?.pagination(),
				where: {
					...findAllPaginationDto.where(),
				},
				orderBy: {
					[findAllPaginationDto.sort]: 'desc',
				},
			}),
			await this.prismaService.log.count({
				where: {
					...findAllPaginationDto.where(),
				},
				orderBy: {
					[findAllPaginationDto.sort]: 'desc',
				},
			}),
		])
		return {
			logs,
			total,
		}
	}
}
