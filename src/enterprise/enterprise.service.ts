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
import { FindAllPaginationEnterpriseDto } from './dto/find-all-pagination.dto'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'

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
			throw new ConflictException(
				ErrorMessagesHelper.ENTERPRISE_WITH_SAME_EMAIL_CREATED
			)
		}

		const apiKey = await this.prismaService.$transaction(async (prisma) => {
			const enterpriseCreated = await this.enterpriseRepository.create(
				{
					email: createEnterpriseDto.email,
					corporateReason: createEnterpriseDto.corporateReason,
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

	async delete(enterpriseId: string) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		await Promise.all([
			await this.apiKeyRepository.deleteByEnterpriseId(enterpriseId),
			await this.enterpriseRepository.delete(enterpriseId),
			await this.userRepository.deleteByEnterpriseId(enterpriseId),
		])

		return {
			message: 'Empresa deletada com sucesso!',
		}
	}

	async disable(enterpriseId: string) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		await this.enterpriseRepository.disable(enterpriseId)

		return {
			message: 'Empresa desabilitada com sucesso!',
		}
	}

	async findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	) {
		return await this.enterpriseRepository.findAll(
			findAllPaginationEnterpriseDto
		)
	}

	async update(enterpriseId: string, updateEnterpriseDto: UpdateEnterpriseDto) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		const enterpriseUpdated = await this.enterpriseRepository.update(
			enterpriseId,
			updateEnterpriseDto
		)

		return enterpriseUpdated
	}
}
