import {
	BadRequestException,
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
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'

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

		const userExists = await this.userRepository.findByEmail(
			createEnterpriseDto.email
		)

		if (userExists) {
			throw new ConflictException(
				ErrorMessagesHelper.USER_WITH_SAME_EMAIL_CREATED
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
				this.apiKeyRepository.create(
					{
						enterpriseId: enterpriseCreated.id,
					},
					prisma
				),
				this.userRepository.create(
					{
						email: createEnterpriseDto.email,
						name: createEnterpriseDto.responsibleName,
						password: passwordHash,
						enterprise: {
							connect: {
								id: enterpriseCreated.id,
							},
						},
					},
					prisma
				),
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
			message: SuccessMessagesHelper.ENTERPRISE_DELETED,
		}
	}

	async disable(enterpriseId: string) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		if (enterprise.disabledAt) {
			throw new BadRequestException(
				ErrorMessagesHelper.ENTERPRISE_ALREADY_DISABLED
			)
		}

		await this.prismaService.$transaction(async (prisma) => {
			await Promise.all([
				this.enterpriseRepository.disable(enterpriseId, prisma),
				this.apiKeyRepository.disableByEnterpriseId(enterpriseId, prisma),
			])
		})

		return {
			message: SuccessMessagesHelper.ENTERPRISE_DISABLED,
		}
	}

	async enable(enterpriseId: string) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		if (!enterprise.disabledAt) {
			throw new BadRequestException(
				ErrorMessagesHelper.ENTERPRISE_ALREADY_ENABLED
			)
		}

		await this.prismaService.$transaction(async (prisma) => {
			await Promise.all([
				this.enterpriseRepository.enable(enterpriseId, prisma),
				this.apiKeyRepository.enableByEnterpriseId(enterpriseId, prisma),
			])
		})

		return {
			message: SuccessMessagesHelper.ENTERPRISE_ENABLED,
		}
	}

	async find(enterpriseId: string) {
		const enterprise = await this.enterpriseRepository.findById(enterpriseId)

		if (!enterprise) {
			throw new NotFoundException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		return enterprise
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

		if (updateEnterpriseDto.email) {
			const enterpriseWithSameEmail =
				await this.enterpriseRepository.findByEmail(updateEnterpriseDto.email)

			if (
				enterpriseWithSameEmail &&
				enterpriseWithSameEmail.id !== enterpriseId
			) {
				throw new ConflictException(
					ErrorMessagesHelper.ENTERPRISE_WITH_SAME_EMAIL_CREATED
				)
			}
		}

		const enterpriseUpdated = await this.enterpriseRepository.update(
			enterpriseId,
			updateEnterpriseDto
		)

		return enterpriseUpdated
	}
}
