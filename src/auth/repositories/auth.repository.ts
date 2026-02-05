import { Injectable } from '@nestjs/common'
import { IAuthRepository } from './auth.repository.types'
import { PrismaService } from '@/database/prisma/prisma.service'
import { User } from '@/generated/prisma/client'

@Injectable()
export class AuthRepository implements IAuthRepository {
	constructor(private prismaService: PrismaService) {}

	findByEmail(email: string): Promise<User | null> {
		return this.prismaService.user.findFirst({ where: { email } })
	}

	findById(id: string): Promise<User | null> {
		return this.prismaService.user.findFirst({ where: { id } })
	}
}
