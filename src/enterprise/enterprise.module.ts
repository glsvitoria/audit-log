import { Module } from '@nestjs/common'
import { EnterpriseController } from './enterprise.controller'
import { EnterpriseService } from './enterprise.service'
import { EnterpriseRepository } from './repositories/enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'
import { UserRepository } from '@/user/repositories/user.repository'

@Module({
	controllers: [EnterpriseController],
	providers: [
		ApiKeyRepository,
		EnterpriseService,
		EnterpriseRepository,
		UserRepository,
	],
	exports: [EnterpriseService],
})
export class EnterpriseModule {}
