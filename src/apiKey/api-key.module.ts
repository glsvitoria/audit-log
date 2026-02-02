import { Global, Module } from '@nestjs/common'
import { ApiKeyRepository } from './repositories/api-key.repository'

@Global()
@Module({
	providers: [ApiKeyRepository],
	exports: [ApiKeyRepository],
})
export class ApiKeyModule {}
