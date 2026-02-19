import { Module } from '@nestjs/common'
import { EnterpriseController } from './enterprise.controller'
import { EnterpriseService } from './enterprise.service'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'
import { PrismaEnterpriseRepository } from './repositories/prisma-enterprise.repository'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'

@Module({
	controllers: [EnterpriseController],
	providers: [
		ApiKeyRepository,
		EnterpriseService,
		PrismaEnterpriseRepository,
		PrismaUserRepository,
	],
	exports: [EnterpriseService],
})
export class EnterpriseModule {}
