import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'

@Module({
	controllers: [AuthController],
	providers: [
		AccessTokenStrategy,
		AuthService,
		PrismaEnterpriseRepository,
		PrismaUserRepository,
	],
	exports: [AuthService],
})
export class AuthModule {}
