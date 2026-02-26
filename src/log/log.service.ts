import {
	Injectable,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'
import type { UserRepository } from '@/user/repositories/user.repository'
import type { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import type { LogRepository } from './repositories/log.repository'

@Injectable()
export class LogService {
	constructor(
		private apiKeyRepository: ApiKeyRepository,
		private logRepository: LogRepository,
		private userRepository: UserRepository
	) {}

	async create(createLogDto: CreateLogDto, enterpriseApiKey: string) {
		const enterprise =
			await this.apiKeyRepository.findByApiKey(enterpriseApiKey)

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
		const user = await this.userRepository.findById(userId)

		if (!user) {
			throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND)
		}

		const log = await this.logRepository.findById(
			logId,
			user?.enterpriseId ?? undefined
		)

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
		const user = await this.userRepository.findById(userId)

		if (user?.enterpriseId) {
			findAllPaginationDto.enterpriseId = user.enterpriseId
		}

		return this.logRepository.findAll(findAllPaginationDto)
	}
}
