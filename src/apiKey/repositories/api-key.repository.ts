import { Injectable } from '@nestjs/common'
import {
	CreateApiKeyProps,
	CreateApiKeyReturn,
	IApiKeyRepository,
} from './api-key.repository.types'
import { PrismaService } from '@/database/prisma/prisma.service'
import { generateApiKey } from '@/utils/generate-api-key'

@Injectable()
export class ApiKeyRepository implements IApiKeyRepository {
	constructor(private prismaService: PrismaService) {}

	async create(props: CreateApiKeyProps): Promise<CreateApiKeyReturn> {
		const { value, hash } = generateApiKey()

		await this.prismaService.apiKey.create({
			data: {
				keyHash: hash,
				enterprise: {
					connect: {
						id: props.enterpriseId,
					},
				},
				description: props.description,
			},
		})

		return {
			apiKey: value,
		}
	}
}
