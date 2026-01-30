import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env-validation'
import { LogModule } from './log/log.module'
import { DatabaseModule } from './database/database.module'

@Module({
	imports: [
		ConfigModule.forRoot({
			validate,
			envFilePath: '.env',
		}),
		DatabaseModule,
		LogModule,
	],
})
export class AppModule {}
