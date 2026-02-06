import { UserRole } from '@/generated/prisma/enums'

export interface JWTPayload {
	role: UserRole
	sub: string
}
