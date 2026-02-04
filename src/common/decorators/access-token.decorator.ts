import { applyDecorators, UseGuards } from '@nestjs/common'
import { AccessTokenGuard } from '@/auth/guards/access-token.guard'
import { RolesGuard } from '@/auth/guards/roles.guard'
import { Roles } from './roles.decorator'
import { UserRole } from '@/generated/prisma/enums'

export function AccessTokenAuth(...roles: UserRole[]) {
	return applyDecorators(
		Roles(...roles),
		UseGuards(AccessTokenGuard, RolesGuard),
	)
}
