import { UserRole } from '@/generated/prisma/enums'

export interface AuthenticatedUser {
	role: UserRole
	sub: string
}
