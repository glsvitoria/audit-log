import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common'
import { Reflector } from '@nestjs/core'
import { ROLES_KEY } from '@/common/decorators/roles.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { AuthenticatedUser } from '@/common/types/authenticated-user'

@Injectable()
export class RolesGuard implements CanActivate {
  // O reflector é utilizado para poder ler os metadados
	constructor(private reflector: Reflector) {}

	canActivate(context: ExecutionContext): boolean {
		const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
			ROLES_KEY,
			[context.getHandler(), context.getClass()]
		)

		if (!requiredRoles) {
			return true
		}

		const request = context.switchToHttp().getRequest()
		const user: AuthenticatedUser = request.user

		return requiredRoles.some((role) => user.role === role)
	}
}
