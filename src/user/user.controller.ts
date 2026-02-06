import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Put,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create.dto'
import { UserService } from './user.service'
import { UpdateUserDto } from './dto/update.dto'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/common/types/authenticated-user'
import { ValidationUUID } from '@/common/pipes/validation-uuid.pipe'

@Controller('/user')
export class UserController {
	constructor(private userService: UserService) {}

	@Post()
	@HttpCode(201)
	@AccessTokenAuth(UserRole.ADMIN)
	create(@Body() createUserDto: CreateUserDto) {
		return this.userService.create(createUserDto)
	}

	@Put('/profile')
	@AccessTokenAuth(UserRole.ENTERPRISE)
	updateProfile(
		@Body() updateUserDto: UpdateUserDto,
		@CurrentUser() user: AuthenticatedUser
	) {
		return this.userService.update(updateUserDto, user.sub)
	}

	@Get('/profile')
	@AccessTokenAuth(UserRole.ENTERPRISE)
	profile(@CurrentUser() user: AuthenticatedUser) {
		return this.userService.profile(user.sub)
	}

	@Delete(':userId')
	@AccessTokenAuth(UserRole.ADMIN)
	delete(@Param('userId', new ValidationUUID()) userId: string) {
		return this.userService.delete(userId)
	}

	@Put(':userId')
	@AccessTokenAuth(UserRole.ADMIN)
	update(
		@Body() updateUserDto: UpdateUserDto,
		@Param('userId', new ValidationUUID()) userId: string
	) {
		return this.userService.update(updateUserDto, userId)
	}
}
