import { Module } from '@nestjs/common'
import { LogController } from './log.controller'
import { LogService } from './log.service'
import { LogRepository } from './repositories/log.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

@Module({
	controllers: [LogController],
	providers: [EnterpriseRepository, LogService, LogRepository],
	exports: [LogService],
})
export class LogModule {}
