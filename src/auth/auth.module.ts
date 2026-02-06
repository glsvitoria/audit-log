import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { AuthRepository } from './repositories/auth.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

@Module({
	controllers: [AuthController],
	providers: [
		AccessTokenStrategy,
		AuthRepository,
		AuthService,
		EnterpriseRepository,
	],
	exports: [AuthService],
})
export class AuthModule {}
