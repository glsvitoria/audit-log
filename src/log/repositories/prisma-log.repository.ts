import { Injectable } from '@nestjs/common'
import { LogRepository } from './log.repository'
import { Prisma } from '@/generated/prisma/client'
import { PrismaService } from 'src/database/prisma/prisma.service'
import { FindAllPaginationDto } from '../dto/find-all-pagination.dto'

@Injectable()
export class PrismaLogRepository implements LogRepository {
	constructor(private prismaService: PrismaService) {}

	async create(log: Prisma.LogCreateInput) {
		return await this.prismaService.log.create({ data: log })
	}

	async delete(logId: string) {
		return await this.prismaService.log.delete({
			where: {
				id: logId,
			},
		})
	}

	async findById(logId: string, enterpriseId?: string) {
		return await this.prismaService.log.findFirst({
			where: { id: logId, enterpriseId },
		})
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
