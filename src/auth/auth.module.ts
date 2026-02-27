import { Module } from '@nestjs/common'
import { AuthController } from './auth.controller'
import { AuthService } from './auth.service'
import { AccessTokenStrategy } from './strategies/access-token.strategy'
import { PrismaUserRepository } from '@/user/repositories/prisma-user.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { UserRepository } from '@/user/repositories/user.repository'

@Module({
	controllers: [AuthController],
	providers: [
		AccessTokenStrategy,
		AuthService,
		{
			provide: EnterpriseRepository,
			useClass: PrismaEnterpriseRepository,
		},
		{
			provide: UserRepository,
			useClass: PrismaUserRepository,
		},
	],
	exports: [AuthService],
})
export class AuthModule {}
