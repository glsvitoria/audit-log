import { Injectable, UnauthorizedException } from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogRepository } from './repositories/log.repository'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'

@Injectable()
export class LogService {
	constructor(
		private enterpriseRepository: EnterpriseRepository,
		private logRepository: LogRepository
	) {}

	async create(createLogDto: CreateLogDto, enterpriseApiKey: string) {
		const enterprise =
			await this.enterpriseRepository.findByApiKey(enterpriseApiKey)

		if (!enterprise) {
			throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
		}

		return this.logRepository.create({
			...createLogDto,
			enterprise: {
				connect: {
					id: enterprise?.id,
				},
			},
		})
	}

	async find(id: string) {
		return this.logRepository.find(id)
	}

	async findAll(findAllPaginationDto: FindAllPaginationDto) {
		return this.logRepository.findAll(findAllPaginationDto)
	}
}
