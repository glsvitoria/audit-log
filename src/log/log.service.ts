import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogRepository } from './repositories/log.repository'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'

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

	async delete(logId: string, userId: string) {
		const enterprise = await this.enterpriseRepository.findByUserId(userId)

		const log = await this.logRepository.findById(logId, enterprise?.id)

		if (!log) {
			throw new NotFoundException(ErrorMessagesHelper.LOG_NOT_FOUND)
		}

		await this.logRepository.delete(logId)

		return {
			message: SuccessMessagesHelper.LOG_DELETED,
		}
	}

	async find(id: string) {
		const log = await this.logRepository.findById(id)

		if (!log) {
			throw new NotFoundException(ErrorMessagesHelper.LOG_NOT_FOUND)
		}

		return log
	}

	async findAll(findAllPaginationDto: FindAllPaginationDto, userId: string) {
		const enterprise = await this.enterpriseRepository.findByUserId(userId)

		if (enterprise) {
			findAllPaginationDto.enterpriseId = enterprise.id
		}

		return this.logRepository.findAll(findAllPaginationDto)
	}
}
