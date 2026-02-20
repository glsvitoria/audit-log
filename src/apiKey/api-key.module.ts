import { Global, Module } from '@nestjs/common'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { PrismaApiKeyRepository } from './repositories/prisma-api-key.repository'

@Global()
@Module({
	controllers: [ApiKeyController],
	providers: [
		ApiKeyService,
		PrismaApiKeyRepository,
		PrismaEnterpriseRepository,
	],
	exports: [ApiKeyService],
})
export class ApiKeyModule {}
