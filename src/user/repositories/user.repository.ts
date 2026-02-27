import { PrismaTransactionClient } from '@/database/prisma/prisma.service'
import { Enterprise, Prisma, User, UserRole } from '@/generated/prisma/client'

export abstract class UserRepository {
	abstract create(
		user: Prisma.UserCreateInput,
		tx?: PrismaTransactionClient
	): Promise<User>
	abstract delete(userId: string): Promise<User | null>
	abstract deleteByEnterpriseId(enterpriseId: string): Promise<void>
	abstract findByEmail(email: string): Promise<User | null>
	abstract findById(userId: string): Promise<User | null>
	abstract update(user: Prisma.UserUpdateInput, userId: string): Promise<User>
}

export interface ProfileReturn {
	email: string
	id: string
	name: string
	role: UserRole
	createdAt: Date
	updatedAt: Date | null
	enterprise: Enterprise | null
}
