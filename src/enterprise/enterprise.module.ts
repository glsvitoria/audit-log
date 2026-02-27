import { Module } from '@nestjs/common'
import { EnterpriseController } from './enterprise.controller'
import { EnterpriseService } from './enterprise.service'
import { PrismaEnterpriseRepository } from './repositories/prisma-enterprise.repository'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'
import { PrismaApiKeyRepository } from '@/apiKey/repositories/prisma-api-key.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import { EnterpriseRepository } from './repositories/enterprise.repository'
import { UserRepository } from '@/user/repositories/user.repository'

@Module({
	controllers: [EnterpriseController],
	providers: [
		EnterpriseService,
		{
			provide: ApiKeyRepository,
			useClass: PrismaApiKeyRepository,
		},
		{
			provide: EnterpriseRepository,
			useClass: PrismaEnterpriseRepository,
		},
		{
			provide: UserRepository,
			useClass: PrismaUserRepository,
		},
	],
	exports: [EnterpriseService],
})
export class EnterpriseModule {}
