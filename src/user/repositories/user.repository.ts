import { PrismaTransactionClient } from '@/database/prisma/prisma.service'
import { Enterprise, Prisma, User, UserRole } from '@/generated/prisma/client'

export interface UserRepository {
	create(
		user: Prisma.UserCreateInput,
		tx?: PrismaTransactionClient
	): Promise<User>
	delete(userId: string): Promise<User | null>
	deleteByEnterpriseId(enterpriseId: string): Promise<void>
	findByEmail(email: string): Promise<User | null>
	findById(userId: string): Promise<User | null>
	update(user: Prisma.UserUpdateInput, userId: string): Promise<User>
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
