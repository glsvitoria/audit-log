import { Injectable } from '@nestjs/common'
import { IUserRepository } from './user.repository.types'
import { PrismaService } from '@/database/prisma/prisma.service'
import { Prisma, User } from '@/generated/prisma/client'

@Injectable()
export class UserRepository implements IUserRepository {
	constructor(private prismaService: PrismaService) {}

	async create(user: Prisma.UserCreateInput) {
		return await this.prismaService.user.create({ data: user })
	}

	async findByEmail(email: string): Promise<User | null> {
		return await this.prismaService.user.findUnique({
			where: {
				email,
			},
		})
	}
}
