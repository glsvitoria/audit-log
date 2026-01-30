import { Injectable } from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogRepository } from './repositories/log.repository'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'

@Injectable()
export class LogService {
	constructor(private logRepository: LogRepository) {}

	async create(createLogDto: CreateLogDto) {
		return this.logRepository.create(createLogDto)
	}

	async find(id: string) {
		return this.logRepository.find(id)
	}

	async findAll(findAllPaginationDto: FindAllPaginationDto) {
		return this.logRepository.findAll(findAllPaginationDto)
	}
}
