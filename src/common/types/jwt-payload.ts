import { UserRole } from '@/generated/prisma/enums'

export interface JWTPayload {
	sub: string
	role: UserRole
}
