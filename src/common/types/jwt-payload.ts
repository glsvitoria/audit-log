import { UserRole } from '@/generated/prisma/enums'

export interface JWTPayload {
	enterpriseSub?: string
	role: UserRole
	sub: string
}
