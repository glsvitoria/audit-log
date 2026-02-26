import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { hash } from 'bcryptjs'
import { UserRole } from '@/generated/prisma/enums'
import { randomUUID } from 'crypto'

interface MakeUserOverride {
	email?: string
	name?: string
	password?: string
	enterpriseId?: string
	role?: UserRole
}

export async function makeUser(
	repository: InMemoryUserRepository,
	override: MakeUserOverride = {}
) {
	const password = override.password ?? '123456'
	const enterpriseId = override.enterpriseId ?? randomUUID()

	return repository.create({
		email: override.email ?? 'johndoe@example.com',
		name: override.name ?? 'John Doe',
		password: await hash(password, 6),
		enterprise: { connect: { id: enterpriseId } },
		role: override.role ?? UserRole.ENTERPRISE,
	} as any)
}
