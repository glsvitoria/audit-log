import { Enterprise, Prisma, User, UserRole } from '@/generated/prisma/client'

export interface IUserRepository {
	create(user: Prisma.UserCreateInput): Promise<User>
	delete(user_id: string): Promise<User>
	deleteByEnterpriseId(enterpriseId: string): Promise<void>
	findByEmail(email: string): Promise<User | null>
	findById(user_id: string): Promise<User | null>
	profile(user_id: string): Promise<ProfileReturn | null>
	update(user: Prisma.UserUpdateInput, user_id: string): Promise<User>
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
