import { Module } from '@nestjs/common'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { LogRepository } from './repositories/log.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'

@Module({
	controllers: [LogController],
	providers: [
		ApiKeyRepository,
		LogService,
		LogRepository,
		PrismaEnterpriseRepository,
	],
	exports: [LogService],
})
export class LogModule {}
