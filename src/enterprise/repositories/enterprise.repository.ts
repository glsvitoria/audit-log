import { Injectable } from '@nestjs/common'
import { IEnterpriseRepository } from './enterprise.repository.types'
import { Enterprise } from '@/generated/prisma/client'
import { EnterpriseCreateInput } from '@/generated/prisma/models'
import { PrismaService } from '@/database/prisma/prisma.service'
import { hashApiKey } from '@/utils/hash-api-key'

@Injectable()
export class EnterpriseRepository implements IEnterpriseRepository {
	constructor(private prismaService: PrismaService) {}

	async create(enterprise: EnterpriseCreateInput): Promise<Enterprise> {
		return this.prismaService.enterprise.create({ data: enterprise })
	}

	async findByApiKey(apiKey: string): Promise<Enterprise | null> {
    const apiKeyHashed = hashApiKey(apiKey)

		const apiKeyFinde = await this.prismaService.apiKey.findUnique({
			where: {
				keyHash: apiKeyHashed,
			},
		})

		if (!apiKeyFinde) return null

		return this.prismaService.enterprise.findUnique({
			where: {
				id: apiKeyFinde.enterpriseId,
			},
		})
	}

	async findByEmail(email: string): Promise<Enterprise | null> {
		return this.prismaService.enterprise.findUnique({ where: { email } })
	}
}
