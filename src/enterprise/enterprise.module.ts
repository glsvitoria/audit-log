import { Module } from '@nestjs/common'
import { EnterpriseController } from './enterprise.controller'
import { EnterpriseService } from './enterprise.service'
import { PrismaEnterpriseRepository } from './repositories/prisma-enterprise.repository'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'
import { PrismaApiKeyRepository } from '@/apiKey/repositories/prisma-api-key.repository'

@Module({
	controllers: [EnterpriseController],
	providers: [
    EnterpriseService,
		PrismaApiKeyRepository,
		PrismaEnterpriseRepository,
		PrismaUserRepository,
	],
	exports: [EnterpriseService],
})
export class EnterpriseModule {}
