import { UserRole } from '@/generated/prisma/enums'

export interface AuthenticatedUser {
	sub: string
	role: UserRole
}
