import { Injectable } from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogRepository } from './repositories/log.repository'
import { Prisma } from '@/generated/prisma/client'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'

@Injectable()
export class LogService {
	constructor(private logRepository: LogRepository) {}

	async create(createLogDto: CreateLogDto) {
		const log: Prisma.LogCreateInput = {
			action: createLogDto.action,
			entity: createLogDto.entity,
			actorRole: createLogDto.actorRole,
			actorId: createLogDto.actorId,
			oldData: createLogDto.oldData,
			newData: createLogDto.newData,
			message: createLogDto.message,
		}

		return this.logRepository.create(log)
	}

	async find(id: string) {
		return this.logRepository.find(id)
	}

	async findAll(findAllPaginationDto: FindAllPaginationDto) {
		return this.logRepository.findAll(findAllPaginationDto)
	}
}
