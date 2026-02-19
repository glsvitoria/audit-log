import { Module } from '@nestjs/common'
import { UserController } from './user.controller'
import { UserService } from './user.service'
import { PrismaUserRepository } from './repositories/prisma-user.repository'
import { PrismaEnterpriseRepository } from '@/enterprise/repositories/prisma-enterprise.repository'

@Module({
	controllers: [UserController],
	providers: [PrismaEnterpriseRepository, PrismaUserRepository, UserService],
	exports: [UserService],
})
export class UserModule {}
