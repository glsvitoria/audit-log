import { hash } from 'bcryptjs'
import { UserRole } from '@/generated/prisma/enums'
import { randomUUID } from 'crypto'
import { UserRepository } from '@/user/repositories/user.repository'

interface MakeUserOverride {
	email?: string
	name?: string
	password?: string
	enterpriseId?: string
	role: UserRole
}

export async function makeUser(
	repository: UserRepository,
	override: MakeUserOverride
) {
	const password = override.password ?? '123456'
	const enterprise =
		override.role === UserRole.ENTERPRISE
			? { connect: { id: override.enterpriseId ?? randomUUID() } }
			: undefined

	return repository.create({
		email: override.email ?? 'johndoe@example.com',
		name: override.name ?? 'John Doe',
		password: await hash(password, 6),
		enterprise,
		role: override.role,
	} as any)
}
