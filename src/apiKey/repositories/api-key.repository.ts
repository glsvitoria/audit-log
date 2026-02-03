import { Injectable } from '@nestjs/common'
import {
	CreateApiKeyProps,
	IApiKeyRepository,
} from './api-key.repository.types'
import { PrismaService } from '@/database/prisma/prisma.service'
import { addPrefixApiKey } from '@/utils/add-prefix-api-key'
import { randomBytes } from 'crypto'
import { subHours } from 'date-fns'
import { hashApiKey } from '@/utils/hash-api-key'

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
	constructor(private prismaService: PrismaService) {}

	async create(props: CreateApiKeyProps) {
		const apiKeyGenerated = randomBytes(32).toString('hex')

		const apiKeyHashed = hashApiKey(apiKeyGenerated)

		await this.prismaService.apiKey.create({
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

	async deleteByEnterpriseId(enterprise_id: string) {
		await this.prismaService.apiKey.updateMany({
			data: {
				deletedAt: new Date(),
			},
			where: {
				enterpriseId: enterprise_id,
			},
		})

		return null
	}

	async find(apiKey: string) {
		const apiKeyHashed = hashApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findUnique({
			where: {
				keyHash: apiKeyHashed,
        deletedAt: null
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async updateLastUsed(apiKeyId: string) {
		const now = subHours(new Date(Date.now()), 6)

		await this.prismaService.apiKey.update({
			data: {
				lastUsedAt: new Date(Date.now()),
			},
			where: {
				id: apiKeyId,
			},
		})
	}
}
