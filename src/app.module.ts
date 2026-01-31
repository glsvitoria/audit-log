import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env-validation'
import { LogModule } from './log/log.module'
import { DatabaseModule } from './database/database.module'
import { JwtModule } from '@nestjs/jwt'

@Module({
	imports: [
		ConfigModule.forRoot({
			validate,
			envFilePath: '.env',
		}),
		DatabaseModule,
		JwtModule.register({ global: true }),
		LogModule,
	],
})
export class AppModule {}
