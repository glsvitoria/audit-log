import { LogRepository } from '@/log/repositories/log.repository'
import { randomUUID } from 'crypto'

interface MakeLogOverride {
	action: string
	entity: string
	entityId: string
	actorRole: string
	actorId: string
	enterpriseId: string
	message: string
	oldData: any
	newData: any
}

export async function makeLog(
	repository: LogRepository,
	override: Partial<MakeLogOverride> = {}
) {
	const enterpriseId = override.enterpriseId ?? randomUUID()

	return repository.create({
		action: override.action ?? 'CREATE_USER',
		entity: override.entity ?? 'USER',
		entityId: override.entityId ?? randomUUID(),
		actorRole: override.actorRole ?? 'ADMIN',
		actorId: override.actorId ?? randomUUID(),
		message: override.message ?? 'Log message example',
		oldData: override.oldData ?? null,
		newData: override.newData ?? { name: 'New Name' },
		enterprise: {
			connect: {
				id: enterpriseId,
			},
		},
	})
}
