import { Injectable } from '@nestjs/common'
import {
	CreateApiKeyProps,
	IApiKeyRepository,
} from './api-key.repository.types'
import {
	PrismaService,
	PrismaTransactionClient,
} from '@/database/prisma/prisma.service'
import { addPrefixApiKey } from '@/utils/add-prefix-api-key'
import { randomBytes } from 'crypto'
import { hashApiKey } from '@/utils/hash-api-key'
import { FindAllPaginationApiKeyDto } from '../dto/find-all-pagination.dto'
import { Prisma } from '@/generated/prisma/client'

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
	constructor(private prismaService: PrismaService) {}

	async create(props: CreateApiKeyProps, tx?: PrismaTransactionClient) {
		const prisma = tx ?? this.prismaService
		const apiKeyGenerated = randomBytes(32).toString('hex')

		const apiKeyHashed = hashApiKey(apiKeyGenerated)

		await prisma.apiKey.create({
			data: {
				keyHash: apiKeyHashed,
				enterprise: {
					connect: {
						id: props.enterpriseId,
					},
				},
				description: props.description,
			},
		})

		return {
			apiKey: addPrefixApiKey(apiKeyGenerated),
		}
	}

	async delete(apiKeyId: string) {
		return await this.prismaService.apiKey.delete({
			where: {
				id: apiKeyId,
			},
		})
	}

	async deleteByEnterpriseId(enterpriseId: string) {
		await this.prismaService.apiKey.updateMany({
			data: {
				deletedAt: new Date(),
			},
			where: {
				enterpriseId,
			},
		})

		return null
	}

	async disable(apiKey_id: string) {
		return await this.prismaService.apiKey.update({
			data: {
				disabledAt: new Date(),
			},
			where: {
				id: apiKey_id,
			},
		})
	}

	async find(apiKey: string, enterpriseId?: string) {
		const apiKeyHashed = hashApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findUnique({
			where: {
				keyHash: apiKeyHashed,
				deletedAt: null,
				enterpriseId,
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async findWithEnableEnterprise(apiKey: string) {
		const apiKeyHashed = hashApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findUnique({
			where: {
				keyHash: apiKeyHashed,
				deletedAt: null,
				enterprise: {
					disabledAt: null,
				},
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async findAll(findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto) {
		const [apiKeys, total] = await Promise.all([
			await this.prismaService.apiKey.findMany({
				...findAllPaginationApiKeyDto.pagination(),
				where: {
					...findAllPaginationApiKeyDto.where(),
				},
				orderBy: {
					[findAllPaginationApiKeyDto.sort]: 'desc',
				},
			}),
			await this.prismaService.apiKey.count({
				where: {
					...findAllPaginationApiKeyDto.where(),
				},
			}),
		])

		return {
			apiKeys,
			total,
		}
	}

	async updateLastUsed(apiKeyId: string) {
		await this.prismaService.apiKey.update({
			data: {
				lastUsedAt: new Date(Date.now()),
			},
			where: {
				id: apiKeyId,
			},
		})
	}

	async update(
		apiKey: Prisma.ApiKeyUpdateInput,
		apiKeyId: string,
		enterpriseId?: string
	) {
		return await this.prismaService.apiKey.update({
			data: apiKey,
			where: {
				id: apiKeyId,
				enterpriseId,
			},
		})
	}
}
