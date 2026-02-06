import {
	BadRequestException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { CreateApiKeyDto } from './dto/create.dto'
import { ApiKeyRepository } from './repositories/api-key.repository'
import { FindAllPaginationApiKeyDto } from './dto/find-all-pagination.dto'
import { UpdateApiKeyDto } from './dto/update.dto'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'

@Injectable()
export class ApiKeyService {
	constructor(
		private apiKeyRepository: ApiKeyRepository,
		private enterpriseRepository: EnterpriseRepository
	) {}

	async create(createApiKeyDto: CreateApiKeyDto) {
		const enterprise = await this.enterpriseRepository.findById(
			createApiKeyDto.enterpriseId
		)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		return await this.apiKeyRepository.create(createApiKeyDto)
	}

	async delete(apiKeyId: string, enterpriseId?: string) {
		const apiKey = await this.apiKeyRepository.findById(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		await this.apiKeyRepository.delete(apiKeyId)

		return {
			message: SuccessMessagesHelper.API_KEY_DELETED,
		}
	}

	async disable(apiKeyId: string, enterpriseId?: string) {
		const apiKey = await this.apiKeyRepository.findById(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		if (apiKey.disabledAt) {
			throw new BadRequestException(
				ErrorMessagesHelper.API_KEY_ALREADY_DISABLED
			)
		}

		await this.apiKeyRepository.disable(apiKeyId)

		return {
			message: SuccessMessagesHelper.API_KEY_DISABLED,
		}
	}

	async enable(apiKeyId: string, enterpriseId?: string) {
		const apiKey = await this.apiKeyRepository.findById(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		if (!apiKey.disabledAt) {
			throw new BadRequestException(ErrorMessagesHelper.API_KEY_ALREADY_ENABLED)
		}

		await this.apiKeyRepository.enable(apiKeyId)

		return {
			message: SuccessMessagesHelper.API_KEY_ENABLED,
		}
	}

	async findAll(
		findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto,
		enterpriseId?: string
	) {
		if (enterpriseId) findAllPaginationApiKeyDto.enterpriseId = enterpriseId

		return await this.apiKeyRepository.findAll(findAllPaginationApiKeyDto)
	}

	async update(
		updateApiKeyDto: UpdateApiKeyDto,
		apiKeyId: string,
		enterpriseId?: string
	) {
		const apiKey = await this.apiKeyRepository.findById(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		return this.apiKeyRepository.update(updateApiKeyDto, apiKeyId, enterpriseId)
	}
}
