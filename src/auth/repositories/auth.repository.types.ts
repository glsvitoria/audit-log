import { User } from '@/generated/prisma/client'

export interface IAuthRepository {
	findByEmail(email: string): Promise<User | null>
	findById(id: string): Promise<User | null>
}
