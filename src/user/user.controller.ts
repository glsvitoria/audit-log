import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { CreateUserDto } from './dto/create.dto'

@Controller('/user')
@AccessTokenAuth(UserRole.ADMIN)
export class UserController {
	constructor() {}

	@Post()
	@HttpCode(201)
	create(@Body() createUserDto: CreateUserDto) {
		return this.create(createUserDto)
	}
}
