import { Injectable, NotFoundException } from '@nestjs/common'
import { CreateApiKeyDto } from './dto/create.dto'
import { ApiKeyRepository } from './repositories/api-key.repository'
import { CreateByEnterpriseApiKeyDto } from './dto/create-by-enterprise'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { FindAllPaginationApiKeyDto } from './dto/find-all-pagination.dto'
import { UpdateApiKeyDto } from './dto/update.dto'

@Injectable()
export class ApiKeyService {
	constructor(
		private apiKeyRepository: ApiKeyRepository,
		private enterpriseRepository: EnterpriseRepository
	) {}

	async create(createApiKeyDto: CreateApiKeyDto) {
		return await this.apiKeyRepository.create(createApiKeyDto)
	}

	async createByEnterprise(
		createByEnterpriseDto: CreateByEnterpriseApiKeyDto,
		user_id: string
	) {
		const enterprise = await this.enterpriseRepository.findByUserId(user_id)

		if (!enterprise) {
			throw new NotFoundException('Usuário de empresa não encontrado')
		}

		return await this.apiKeyRepository.create({
			enterpriseId: enterprise.id,
			description: createByEnterpriseDto.description,
		})
	}

	async delete(api_key_id: string) {
		const apiKey = await this.apiKeyRepository.find(api_key_id)

		if (!apiKey) {
			throw new NotFoundException('Api key não encontrada')
		}

		return await this.apiKeyRepository.delete(api_key_id)
	}

	async findAll(findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto) {
		return await this.apiKeyRepository.findAll(findAllPaginationApiKeyDto)
	}

	async findAllByEnterprise(
		findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto,
		user_id: string
	) {
		const enterprise = await this.enterpriseRepository.findByUserId(user_id)

		if (!enterprise) {
			throw new NotFoundException('Usuário de empresa não encontrado')
		}

		findAllPaginationApiKeyDto.enterpriseId = enterprise.id

		return await this.apiKeyRepository.findAll(findAllPaginationApiKeyDto)
	}

	async update(updateApiKeyDto: UpdateApiKeyDto, apiKeyId: string) {
		const apiKey = await this.apiKeyRepository.find(apiKeyId)

		if (!apiKey) {
			throw new NotFoundException('Api key não encontrada')
		}

		return this.apiKeyRepository.update(updateApiKeyDto, apiKeyId)
	}
}
