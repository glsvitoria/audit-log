import { Injectable } from '@nestjs/common'
import { IUserRepository } from './user.repository.types'
import {
	PrismaService,
	PrismaTransactionClient,
} from '@/database/prisma/prisma.service'
import { Prisma, User } from '@/generated/prisma/client'

@Injectable()
export class UserRepository implements IUserRepository {
	constructor(private prismaService: PrismaService) {}

	async create(user: Prisma.UserCreateInput, tx?: PrismaTransactionClient) {
		const prisma = tx ?? this.prismaService

		return await prisma.user.create({ data: user })
	}

	async delete(userId: string): Promise<User> {
		return await this.prismaService.user.delete({
			where: {
				id: userId,
			},
		})
	}

	async deleteByEnterpriseId(
		enterpriseId: string,
		tx?: PrismaTransactionClient
	) {
		const prisma = tx ?? this.prismaService

		await prisma.user.deleteMany({
			where: {
				enterpriseId,
			},
		})
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.prismaService.user.findFirst({
			where: {
				email,
			},
		})
	}

	async findById(userId: string) {
		return await this.prismaService.user.findFirst({
			where: {
				id: userId,
			},
		})
	}

	async profile(userId: string) {
		return await this.prismaService.user.findFirst({
			where: {
				id: userId,
			},
			select: {
				email: true,
				enterprise: true,
				id: true,
				name: true,
				role: true,
				createdAt: true,
				updatedAt: true,
			},
		})
	}

	async update(user: Prisma.UserUpdateInput, userId: string): Promise<User> {
		return await this.prismaService.user.update({
			data: {
				email: user.email,
				name: user.email,
			},
			where: {
				id: userId,
			},
		})
	}
}
