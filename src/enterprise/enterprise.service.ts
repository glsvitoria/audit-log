import { ConflictException, Injectable } from '@nestjs/common'
import { CreateEnterpriseDto } from './dto/create.dto'
import { EnterpriseRepository } from './repositories/enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'

@Injectable()
export class EnterpriseService {
	constructor(
		private apiKeyRepository: ApiKeyRepository,
		private enterpriseRepository: EnterpriseRepository
	) {}

	async create(createEnterpriseDto: CreateEnterpriseDto) {
		const enterpriseExists = await this.enterpriseRepository.findByEmail(
			createEnterpriseDto.email
		)

		if (enterpriseExists) {
			throw new ConflictException('Empresa com esse e-mail já cadastrada')
		}

		const enterpriseCreated =
			await this.enterpriseRepository.create(createEnterpriseDto)

		const apiKey = await this.apiKeyRepository.create({
			enterpriseId: enterpriseCreated.id,
		})

		return apiKey
	}
}
