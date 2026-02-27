import { Injectable } from '@nestjs/common'
import { ApiKeyRepository, CreateApiKeyProps } from './api-key.types'
import {
	PrismaService,
	PrismaTransactionClient,
} from '@/database/prisma/prisma.service'
import { addPrefixApiKey } from '@/utils/add-prefix-api-key'
import { hashApiKey } from '@/utils/hash-api-key'
import { FindAllPaginationApiKeyDto } from '../dto/find-all-pagination.dto'
import { Prisma } from '@/generated/prisma/client'
import { removePrefixApiKey } from '@/utils/remove-prefix-api-key'

@Injectable()
export class PrismaApiKeyRepository implements ApiKeyRepository {
	constructor(private prismaService: PrismaService) {}

	async create(props: CreateApiKeyProps, tx?: PrismaTransactionClient) {
		const prisma = tx ?? this.prismaService

		const apiKeyHashed = hashApiKey()

		await prisma.apiKey.create({
			data: {
				description: props.description,
				enterprise: {
					connect: {
						id: props.enterpriseId,
					},
				},
				keyHash: apiKeyHashed,
			},
		})

		return {
			apiKey: addPrefixApiKey(apiKeyHashed),
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
		await this.prismaService.apiKey.deleteMany({
			where: {
				enterpriseId,
			},
		})
	}

	async disable(apiKeyId: string) {
		return await this.prismaService.apiKey.update({
			data: {
				disabledAt: new Date(),
			},
			where: {
				id: apiKeyId,
			},
		})
	}

	async disableByEnterpriseId(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	) {
		const prisma = tx ?? this.prismaService

		await prisma.apiKey.updateMany({
			data: {
				disabledAt: new Date(),
			},
			where: {
				enterpriseId: enterpriseId,
			},
		})
	}

	async enable(apiKeyId: string) {
		return await this.prismaService.apiKey.update({
			data: {
				disabledAt: null,
			},
			where: {
				id: apiKeyId,
			},
		})
	}

	async enableByEnterpriseId(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	) {
		const prisma = tx ?? this.prismaService

		await prisma.apiKey.updateMany({
			data: {
				disabledAt: null,
			},
			where: {
				enterpriseId: enterpriseId,
			},
		})
	}

	async findById(apiKeyId: string, enterpriseId?: string) {
		const apiKeyFinde = await this.prismaService.apiKey.findFirst({
			where: {
				id: apiKeyId,
				enterpriseId,
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async findEnableById(apiKeyId: string, enterpriseId?: string) {
		const apiKeyFinde = await this.prismaService.apiKey.findFirst({
			where: {
				id: apiKeyId,
				enterpriseId,
				disabledAt: null,
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async findByApiKey(apiKey: string) {
		const apiKeyWithoutPrefix = removePrefixApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findFirst({
			where: {
				keyHash: apiKeyWithoutPrefix,
				deletedAt: null,
				disabledAt: null,
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

	async update(apiKey: Prisma.ApiKeyUpdateInput, apiKeyId: string) {
		return await this.prismaService.apiKey.update({
			data: apiKey,
			where: {
				id: apiKeyId,
			},
		})
	}
}
