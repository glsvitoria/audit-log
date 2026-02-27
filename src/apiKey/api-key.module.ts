import { Global, Module } from '@nestjs/common'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { PrismaApiKeyRepository } from './repositories/prisma-api-key.repository'
import { ApiKeyRepository } from './repositories/api-key.types'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { UserRepository } from '@/user/repositories/user.repository'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'

@Global()
@Module({
	controllers: [ApiKeyController],
	providers: [
		ApiKeyService,
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
	exports: [ApiKeyService],
})
export class ApiKeyModule {}
