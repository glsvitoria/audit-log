import { Module } from '@nestjs/common'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { LogRepository } from './repositories/log.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'

@Module({
	controllers: [LogController],
	providers: [
		ApiKeyRepository,
		EnterpriseRepository,
		LogService,
		LogRepository,
	],
	exports: [LogService],
})
export class LogModule {}
