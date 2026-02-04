import { Global, Module } from '@nestjs/common'
import { ApiKeyRepository } from './repositories/api-key.repository'
import { ApiKeyController } from './api-key.controller'
import { ApiKeyService } from './api-key.service'

@Global()
@Module({
	controllers: [ApiKeyController],
	providers: [ApiKeyService, ApiKeyRepository],
	exports: [ApiKeyService],
})
export class ApiKeyModule {}
