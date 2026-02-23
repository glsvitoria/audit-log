import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { hash } from 'bcryptjs'
import { UserRole } from '@/generated/prisma/enums'

interface MakeUserOverride {
	email?: string
	name?: string
	password?: string
	enterpriseId?: string | null
	role?: UserRole
}

export async function makeUser(
	repository: InMemoryUserRepository,
	params: MakeUserOverride = {}
) {
	const password = params.password ?? '123456'

	return repository.create({
		email: params.email ?? 'johndoe@example.com',
		name: params.name ?? 'John Doe',
		password: await hash(password, 6),
		enterprise: params.enterpriseId
			? { connect: { id: params.enterpriseId } }
			: undefined,
		role: params.role ?? UserRole.ENTERPRISE,
	} as any)
}
