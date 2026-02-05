import { UserRole } from '@/generated/prisma/enums'

export interface AuthenticatedUser {
	enterpriseSub?: string
	role: UserRole
	sub: string
}
