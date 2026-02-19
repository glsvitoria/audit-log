import { Enterprise } from '@/generated/prisma/client'
import {
	EnterpriseCreateInput,
	EnterpriseUpdateInput,
} from '@/generated/prisma/models'
import { FindAllPaginationEnterpriseDto } from '../dto/find-all-pagination.dto'
import { EnterpriseRepository } from './enterprise.repository'
import { randomUUID } from 'crypto'

export class InMemoryEnterpriseRepository implements EnterpriseRepository {
	private enterprises: Enterprise[] = []

	constructor() {}

	async create(enterprise: EnterpriseCreateInput) {
		const newEnterprise: Enterprise = {
			id: randomUUID(),
			corporateReason: enterprise.corporateReason,
			email: enterprise.email,
			createdAt: new Date(),
			deletedAt: null,
			disabledAt: null,
			updatedAt: null,
		}

		this.enterprises.push(newEnterprise)

		return newEnterprise
	}

	async delete(enterpriseId: string) {
		const index = this.enterprises.findIndex(
			(enterprise) => enterprise.id === enterpriseId && !enterprise.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.enterprises[index] = {
			...this.enterprises[index],
			deletedAt: new Date(),
			updatedAt: new Date(),
		}

		return this.enterprises[index]
	}

	async disable(enterpriseId: string) {
		const index = this.enterprises.findIndex(
			(enterprise) =>
				enterprise.id === enterpriseId &&
				!enterprise.deletedAt &&
				!enterprise.disabledAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.enterprises[index] = {
			...this.enterprises[index],
			disabledAt: new Date(),
			updatedAt: new Date(),
		}

		return this.enterprises[index]
	}

	async enable(enterpriseId: string) {
		const index = this.enterprises.findIndex(
			(enterprise) =>
				enterprise.id === enterpriseId &&
				!enterprise.deletedAt &&
				!!enterprise.disabledAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.enterprises[index] = {
			...this.enterprises[index],
			disabledAt: null,
			updatedAt: new Date(),
		}

		return this.enterprises[index]
	}

	async findAll(
		findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	): Promise<{ enterprises: Enterprise[]; total: number }> {
		const { init, limit, corporateReason, email } =
			findAllPaginationEnterpriseDto

		const enterprisesSorted = [...this.enterprises].sort((a, b) => {
			if (a.createdAt > b.createdAt) return 1
			else if (a.createdAt < b.createdAt) return -1

			return 0
		})

		const enterprisesFiltered = enterprisesSorted.filter((enterprise) => {
			if (
				email &&
				!enterprise.email.toUpperCase().includes(email.toUpperCase())
			) {
				return false
			}

			if (
				corporateReason &&
				!enterprise.corporateReason
					.toUpperCase()
					.includes(corporateReason.toUpperCase())
			) {
				return false
			}

			return true
		})

		return {
			enterprises: enterprisesFiltered.slice(init, init + limit),
			total: enterprisesFiltered.length,
		}
	}

	async findByEmail(email: string) {
		const index = this.enterprises.findIndex(
			(enterprise) => enterprise.email === email
		)

		if (index === -1) {
			throw new Error()
		}

		return this.enterprises[index]
	}
	async findById(id: string) {
		const index = this.enterprises.findIndex(
			(enterprise) => enterprise.id === id
		)

		if (index === -1) {
			throw new Error()
		}

		return this.enterprises[index]
	}

	async update(
		enterpriseId: string,
		enterprise: EnterpriseUpdateInput
	): Promise<Enterprise> {
		const index = this.enterprises.findIndex(
			(enterprise) => enterprise.id === enterpriseId && !enterprise.deletedAt
		)

		this.enterprises[index] = {
			...this.enterprises[index],
			email: enterprise.email?.toString() ?? this.enterprises[index].email,
			corporateReason:
				enterprise.corporateReason?.toString() ??
				this.enterprises[index].corporateReason,
			updatedAt: new Date(),
		}

		return this.enterprises[index]
	}
}
