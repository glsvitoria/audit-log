import { SetMetadata } from '@nestjs/common'
import { UserRole } from '@/generated/prisma/enums'

export const ROLES_KEY = 'roles'
// Salvar as roles em uma KEY que pode ser acessada por guards ou interceptors
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles)
