import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { UpdateEnterpriseDto } from './dto/update.dto'
import { EnterpriseRepository } from './repositories/enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'
import { CreateEnterpriseDto } from './dto/create.dto'

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

	async delete(enterprise_id: string) {
		const enterprise = await this.enterpriseRepository.findById(enterprise_id)

		if (!enterprise) {
			throw new NotFoundException('Empresa não encontrada')
		}

		await Promise.all([
			await this.enterpriseRepository.delete(enterprise_id),
			await this.apiKeyRepository.deleteByEnterpriseId(enterprise_id),
		])

		return {
			message: 'Empresa deletada com sucesso!',
		}
	}

	async update(
		enterprise_id: string,
		updateEnterpriseDto: UpdateEnterpriseDto
	) {
		const enterprise = await this.enterpriseRepository.findById(enterprise_id)

		if (!enterprise) {
			throw new NotFoundException('Empresa não encontrada')
		}

		const enterpriseUpdated = await this.enterpriseRepository.update(
			enterprise_id,
			updateEnterpriseDto
		)

		return enterpriseUpdated
	}
}
