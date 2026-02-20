import { Log } from '@/generated/prisma/client'
import { LogCreateInput } from '@/generated/prisma/models'
import { FindAllPaginationDto } from '../dto/find-all-pagination.dto'
import { LogRepository } from './log.repository'
import { randomUUID } from 'crypto'
import { isAfter, isBefore } from 'date-fns'

export class InMemoryLogRepository implements LogRepository {
	private logs: Log[] = []

	constructor() {}

	async create(log: LogCreateInput) {
		const newLog: Log = {
			id: randomUUID(),
			action: log.action,
			actorId: log.actorId,
			actorRole: log.actorRole,
			enterpriseId: log.enterprise.connect?.id!,
			entity: log.entity ?? null,
			entityId: log.entityId ?? null,
			message: log.message ?? null,
			newData: log.newData ?? Object(),
			oldData: log.oldData ?? Object(),
			createdAt: new Date(),
			deletedAt: null,
		}

		this.logs.push(newLog)

		return newLog
	}

	async delete(logId: string) {
		const index = this.logs.findIndex(
			(log) => log.id === logId && !log.deletedAt
		)

		if (index === -1) {
			throw new Error()
		}

		this.logs[index].deletedAt = new Date()

		return this.logs[index]
	}

	async findById(logId: string, enterpriseId?: string) {
		const index = this.logs.findIndex(
			(log) =>
				log.id === logId &&
				!log.deletedAt &&
				(enterpriseId ? log.enterpriseId === enterpriseId : true)
		)

		if (index === -1) {
			throw new Error()
		}

		return this.logs[index]
	}

	async findAll(
		findAllPaginationDto: FindAllPaginationDto
	): Promise<{ logs: Log[]; total: number }> {
		const {
			init,
			limit,
			action,
			actorId,
			actorRole,
			endDate,
			enterpriseId,
			entity,
			entityId,
			startDate,
		} = findAllPaginationDto

		const logsSorted = [...this.logs].sort((a, b) => {
			if (a.createdAt > b.createdAt) return 1
			else if (a.createdAt < b.createdAt) return -1

			return 0
		})

		const logsFiltered = logsSorted.filter((log) => {
			if (action && !log.action.toUpperCase().includes(action.toUpperCase())) {
				return false
			}

			if (
				actorId &&
				!log.actorId.toUpperCase().includes(actorId.toUpperCase())
			) {
				return false
			}

			if (
				actorRole &&
				!log.actorRole.toUpperCase().includes(actorRole.toUpperCase())
			) {
				return false
			}

			if (
				enterpriseId &&
				!log.enterpriseId.toUpperCase().includes(enterpriseId.toUpperCase())
			) {
				return false
			}

			if (
				entity &&
				!!log.entity &&
				!log.entity.toUpperCase().includes(entity.toUpperCase())
			) {
				return false
			}

			if (
				entityId &&
				!!log.entityId &&
				!log.entityId.toUpperCase().includes(entityId.toUpperCase())
			) {
				return false
			}

			if (startDate && isBefore(log.createdAt, new Date(startDate))) {
				return false
			}

			if (endDate && isAfter(log.createdAt, new Date(endDate))) {
				return false
			}

			return true
		})

		return {
			logs: logsFiltered.slice(init, init + limit),
			total: logsFiltered.length,
		}
	}
}
