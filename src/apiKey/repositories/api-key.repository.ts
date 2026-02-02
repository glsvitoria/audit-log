import { Injectable } from '@nestjs/common'
import {
	CreateApiKeyProps,
	CreateApiKeyReturn,
	IApiKeyRepository,
} from './api-key.repository.types'
import { PrismaService } from '@/database/prisma/prisma.service'
import { hash, compare } from 'bcryptjs'
import { addPrefixApiKey } from '@/utils/add-prefix-api-key'
import { randomBytes } from 'crypto'
import { ApiKey } from '@/generated/prisma/client'
import { subHours } from 'date-fns'
import { hashApiKey } from '@/utils/hash-api-key'

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
	constructor(private prismaService: PrismaService) {}

	async create(props: CreateApiKeyProps): Promise<CreateApiKeyReturn> {
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

	async find(apiKey: string): Promise<ApiKey | null> {
		const apiKeyHashed = hashApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findUnique({
			where: {
				keyHash: apiKeyHashed,
			},
		})

		if (!apiKeyFinde) {
			return null
		}

		return apiKeyFinde
	}

	async updateLastUsed(apiKeyId: string): Promise<void> {
		const now = subHours(new Date(), 3)

		await this.prismaService.apiKey.update({
			data: {
				lastUsedAt: now,
			},
			where: {
				id: apiKeyId,
			},
		})
	}
}
