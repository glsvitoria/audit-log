import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { UpdateEnterpriseDto } from './dto/update.dto'
import { EnterpriseRepository } from './repositories/enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'
import { CreateEnterpriseDto } from './dto/create.dto'
import { UserRepository } from '@/user/repositories/user.repository'
import { hash } from 'bcryptjs'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class EnterpriseService {
	constructor(
		private apiKeyRepository: ApiKeyRepository,
		private enterpriseRepository: EnterpriseRepository,
		private userRepository: UserRepository,
		private prismaService: PrismaService
	) {}

	async create(createEnterpriseDto: CreateEnterpriseDto) {
		const enterpriseExists = await this.enterpriseRepository.findByEmail(
			createEnterpriseDto.email
		)

		if (enterpriseExists) {
			throw new ConflictException('Empresa com esse e-mail já cadastrada')
		}

		const apiKey = await this.prismaService.$transaction(async (prisma) => {
			const enterpriseCreated = await this.enterpriseRepository.create(
				{
					email: createEnterpriseDto.email,
					name: createEnterpriseDto.corporateReason,
				},
				prisma
			)

			const passwordHash = await hash(createEnterpriseDto.password, 8)

			const [apiKey, _] = await Promise.all([
				await this.apiKeyRepository.create(
					{
						enterpriseId: enterpriseCreated.id,
					},
					prisma
				),
				await this.userRepository.create({
					email: createEnterpriseDto.email,
					name: createEnterpriseDto.responsibleName,
					password: passwordHash,
					enterprise: {
						connect: {
							id: enterpriseCreated.id,
						},
					},
				}),
			])

			return apiKey
		})

		return apiKey
	}

	async delete(enterprise_id: string) {
		const enterprise = await this.enterpriseRepository.findById(enterprise_id)

		if (!enterprise) {
			throw new NotFoundException('Empresa não encontrada')
		}

		await Promise.all([
			await this.apiKeyRepository.deleteByEnterpriseId(enterprise_id),
			await this.enterpriseRepository.delete(enterprise_id),
			await this.userRepository.deleteByEnterpriseId(enterprise_id),
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
