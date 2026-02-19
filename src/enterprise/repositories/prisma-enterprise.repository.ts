import { Injectable } from '@nestjs/common'
import { Enterprise } from '@/generated/prisma/client'
import {
	EnterpriseCreateInput,
	EnterpriseUpdateInput,
} from '@/generated/prisma/models'
import {
	PrismaService,
	PrismaTransactionClient,
} from '@/database/prisma/prisma.service'
import { hashApiKey } from '@/utils/hash-api-key'
import { FindAllPaginationEnterpriseDto } from '../dto/find-all-pagination.dto'
import { EnterpriseRepository } from './enterprise.repository'

@Injectable()
export class PrismaEnterpriseRepository implements EnterpriseRepository {
	constructor(private prismaService: PrismaService) {}

	async create(
		enterprise: EnterpriseCreateInput,
		tx?: PrismaTransactionClient
	): Promise<Enterprise> {
		const prisma = tx ?? this.prismaService

		return prisma.enterprise.create({ data: enterprise })
	}

	async delete(enterpriseId: string): Promise<Enterprise> {
		return this.prismaService.enterprise.delete({
			where: {
				id: enterpriseId,
			},
		})
	}

	async disable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise> {
		const prisma = tx ?? this.prismaService

		return prisma.enterprise.update({
			data: {
				disabledAt: new Date(),
			},
			where: {
				id: enterpriseId,
			},
		})
	}

	async enable(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	): Promise<Enterprise> {
		const prisma = tx ?? this.prismaService

		return prisma.enterprise.update({
			data: {
				disabledAt: null,
			},
			where: {
				id: enterpriseId,
			},
		})
	}

	async findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	) {
		const [enterprises, total] = await Promise.all([
			await this.prismaService.enterprise.findMany({
				...findAllPaginationEnterpriseDto.pagination(),
				where: {
					...findAllPaginationEnterpriseDto.where(),
				},
				orderBy: {
					[findAllPaginationEnterpriseDto.sort]: 'desc',
				},
			}),
			await this.prismaService.enterprise.count({
				where: {
					...findAllPaginationEnterpriseDto.where(),
				},
			}),
		])

		return {
			enterprises,
			total,
		}
	}

	async findByEmail(email: string): Promise<Enterprise | null> {
		return this.prismaService.enterprise.findFirst({ where: { email } })
	}

	async findById(id: string): Promise<Enterprise | null> {
		return this.prismaService.enterprise.findFirst({ where: { id } })
	}

	async update(
		enterpriseId: string,
		enterprise: EnterpriseUpdateInput
	): Promise<Enterprise> {
		return this.prismaService.enterprise.update({
			data: enterprise,
			where: {
				id: enterpriseId,
			},
		})
	}
}
