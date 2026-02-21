import { User } from '@/generated/prisma/client'
import { UserCreateInput, UserUpdateInput } from '@/generated/prisma/models'
import { UserRepository } from './user.repository'
import { randomUUID } from 'crypto'

export class InMemoryUserRepository implements UserRepository {
	private users: User[] = []

	constructor() {}

	async create(user: UserCreateInput) {
		const newUser: User = {
			id: randomUUID(),
			email: user.email,
			name: user.name,
			password: user.password,
			enterpriseId: user.enterprise?.connect?.id ?? null,
			role: 'ENTERPRISE',
			createdAt: new Date(),
			updatedAt: null,
			deletedAt: null,
		}

		this.users.push(newUser)

		return newUser
	}

	async delete(userId: string) {
		const index = this.users.findIndex(
			(user) => user.id === userId && !user.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.users[index] = {
			...this.users[index],
			deletedAt: new Date(),
			updatedAt: new Date(),
		}

		return this.users[index]
	}

	async deleteByEnterpriseId(enterpriseId: string) {
		for (const user of this.users) {
			if (user.enterpriseId === enterpriseId && !user.deletedAt) {
				user.deletedAt = new Date()
				user.updatedAt = new Date()
			}
		}
	}

	async findByEmail(email: string) {
		const user = this.users.find(
			(user) => user.email === email && !user.deletedAt
		)

		return user ?? null
	}
	async findById(userId: string) {
		const user = this.users.find(
			(user) => user.id === userId && !user.deletedAt
		)

		return user ?? null
	}

	async update(user: UserUpdateInput, userId: string) {
		const index = this.users.findIndex(
			(user) => user.id === userId && !user.deletedAt
		)

		this.users[index] = {
			...this.users[index],
			email: user.email?.toString() ?? this.users[index].email,
			name: user.name?.toString() ?? this.users[index].name,
			updatedAt: new Date(),
		}

		return this.users[index]
	}
}
