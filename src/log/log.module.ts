import { Module } from '@nestjs/common'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { PrismaApiKeyRepository } from '@/apiKey/repositories/prisma-api-key.repository'
import { PrismaLogRepository } from './repositories/prisma-log.repository'

@Module({
	controllers: [LogController],
	providers: [
		LogService,
		PrismaApiKeyRepository,
		PrismaEnterpriseRepository,
		PrismaLogRepository,
	],
	exports: [LogService],
})
export class LogModule {}
