import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { AuthRepository } from './repositories/auth.repository'

@Module({
	controllers: [AuthController],
	providers: [AccessTokenStrategy, AuthRepository, AuthService],
	exports: [AuthService],
})
export class AuthModule {}
