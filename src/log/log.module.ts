import { Module } from '@nestjs/common'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { PrismaApiKeyRepository } from '@/apiKey/repositories/prisma-api-key.repository'
import { PrismaLogRepository } from './repositories/prisma-log.repository'
import { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import { UserRepository } from '@/user/repositories/user.repository'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'
import { LogRepository } from './repositories/log.repository'

@Module({
	controllers: [LogController],
	providers: [
		LogService,
		{
			provide: ApiKeyRepository,
			useClass: PrismaApiKeyRepository,
		},
		{
			provide: UserRepository,
			useClass: PrismaUserRepository,
		},
		{
			provide: LogRepository,
			useClass: PrismaLogRepository,
		},
	],
	exports: [LogService],
})
export class LogModule {}
