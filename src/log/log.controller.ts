import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	Post,
	Query,
} from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogService } from './log.service'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'
import { ApiKeyAuth } from '@/common/decorators/api-key.decorator'
import { CurrentEnterprise } from '@/common/decorators/current-enterprise.decorator'
import type { AuthenticatedEnterprise } from '@/common/types/authenticated-enterprise'
import { ValidationUUID } from '@/common/pipes/validation-uuid.pipe'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/common/types/authenticated-user'

@Controller('/log')
export class LogController {
	constructor(private logService: LogService) {}

	@Post()
	@HttpCode(201)
	@ApiKeyAuth()
	createLog(
		@Body() body: CreateLogDto,
		@CurrentEnterprise() enterprise: AuthenticatedEnterprise
	) {
		return this.logService.create(body, enterprise.apiKey)
	}

	@Get(':logId')
	@ApiKeyAuth()
	find(@Param('logId', new ValidationUUID()) logId: string) {
		return this.logService.find(logId)
	}

	@Delete(':logId')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	delete(
		@CurrentUser() user: AuthenticatedUser,
		@Param('logId', new ValidationUUID()) logId: string
	) {
		return this.logService.delete(logId, user.sub)
	}

	@Get()
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	findAll(
		@CurrentUser() user: AuthenticatedUser,
		@Query() query: FindAllPaginationDto
	) {
		return this.logService.findAll(query, user.sub)
	}
}
