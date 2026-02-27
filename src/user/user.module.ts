import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { PrismaUserRepository } from './repositories/prisma-user.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'
import { UserRepository } from './repositories/user.repository'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

@Module({
	controllers: [UserController],
	providers: [
		UserService,
		{
			provide: UserRepository,
			useClass: PrismaUserRepository,
		},
		{
			provide: EnterpriseRepository,
			useClass: PrismaEnterpriseRepository,
		},
	],
	exports: [UserService],
})
export class UserModule {}
