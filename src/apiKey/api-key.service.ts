import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateApiKeyDto } from './dto/create.dto'
import { ApiKeyRepository } from './repositories/api-key.repository'
import { FindAllPaginationApiKeyDto } from './dto/find-all-pagination.dto'
import { UpdateApiKeyDto } from './dto/update.dto'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'

@Injectable()
export class ApiKeyService {
	constructor(private apiKeyRepository: ApiKeyRepository) {}

	async create(createApiKeyDto: CreateApiKeyDto) {
		return await this.apiKeyRepository.create(createApiKeyDto)
	}

	async delete(apiKeyId: string, enterpriseId?: string) {
		const apiKey = await this.apiKeyRepository.find(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		return await this.apiKeyRepository.delete(apiKeyId)
	}

	async disable(apiKeyId: string, enterpriseId?: string) {
		const apiKey = await this.apiKeyRepository.find(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		return await this.apiKeyRepository.disable(apiKeyId)
	}

	async findAll(
		findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto,
		enterpriseId?: string
	) {
		findAllPaginationApiKeyDto.enterpriseId = enterpriseId

		return await this.apiKeyRepository.findAll(findAllPaginationApiKeyDto)
	}

	async update(
		updateApiKeyDto: UpdateApiKeyDto,
		apiKeyId: string,
		enterpriseId?: string
	) {
		const apiKey = await this.apiKeyRepository.find(apiKeyId, enterpriseId)

		if (!apiKey) {
			throw new NotFoundException(ErrorMessagesHelper.API_KEY_NOT_FOUND)
		}

		return this.apiKeyRepository.update(updateApiKeyDto, apiKeyId, enterpriseId)
	}
}
