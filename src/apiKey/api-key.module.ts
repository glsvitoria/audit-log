import { Global, Module } from '@nestjs/common'
import { ApiKeyRepository } from './repositories/api-key.repository'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'

@Global()
@Module({
	controllers: [ApiKeyController],
	providers: [ApiKeyService, ApiKeyRepository, PrismaEnterpriseRepository],
	exports: [ApiKeyService],
})
export class ApiKeyModule {}
