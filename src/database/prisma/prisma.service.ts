import { Prisma, PrismaClient } from '@/generated/prisma/client'
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

		return this.$extends(softDeleteExtension) as unknown as PrismaService
	}
}

export type PrismaTransactionClient = Prisma.TransactionClient
