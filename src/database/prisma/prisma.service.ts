import { PrismaClient } from '@/generated/prisma/client'
import { Injectable } from '@nestjs/common'
import { PrismaPg } from '@prisma/adapter-pg'
import { softDeleteExtension } from './soft-delete.extension'

@Injectable()
export class PrismaService extends PrismaClient {
	constructor() {
		const adapter = new PrismaPg({
			connectionString: process.env.DATABASE_URL as string,
		})
		super({ adapter })

    const extendedClient = new PrismaClient({ adapter }).$extends(
			softDeleteExtension
		)

		Object.assign(this, extendedClient)
	}
}

export type PrismaTransactionClient = Omit<
	PrismaService,
	'$extends' | '$transaction' | '$disconnect' | '$connect' | '$on' | '$use'
>
