import { Injectable } from '@nestjs/common'
import { IEnterpriseRepository } from './enterprise.repository.types'
import { Enterprise } from '@/generated/prisma/client'
import { EnterpriseCreateInput } from '@/generated/prisma/models'
import { PrismaService } from '@/database/prisma/prisma.service'

@Injectable()
export class EnterpriseRepository implements IEnterpriseRepository {
	constructor(private prismaService: PrismaService) {}

	create(enterprise: EnterpriseCreateInput): Promise<Enterprise> {
		return this.prismaService.enterprise.create({ data: enterprise })
	}
	findByEmail(email: string): Promise<Enterprise | null> {
		return this.prismaService.enterprise.findUnique({ where: { email } })
	}
}
