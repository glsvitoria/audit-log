import { Module } from '@nestjs/common'
import { ConfigModule } from '@nestjs/config'
import { validate } from './config/env-validation'
import { LogModule } from './log/log.module'
import { DatabaseModule } from './database/database.module'
import { JwtModule } from '@nestjs/jwt'
import { EnterpriseModule } from './enterprise/enterprise.module'
import { ApiKeyModule } from './apiKey/api-key.module'
import { AuthModule } from './auth/auth.module'
import { UserModule } from './user/user.module'

@Module({
	imports: [
		ApiKeyModule,
		AuthModule,
		ConfigModule.forRoot({
			validate,
			envFilePath: '.env',
		}),
		DatabaseModule,
		EnterpriseModule,
		JwtModule.register({ global: true }),
		LogModule,
		UserModule,
	],
})
export class AppModule {}
