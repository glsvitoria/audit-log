import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'

@Module({
	controllers: [AuthController],
	providers: [AuthService, AccessTokenStrategy],
	exports: [AuthService],
})
export class AuthModule {}
