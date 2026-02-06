import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { CreateApiKeyDto } from './dto/create.dto'
import { FindAllPaginationApiKeyDto } from './dto/find-all-pagination.dto'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { UpdateApiKeyDto } from './dto/update.dto'
import { ApiKeyService } from './api-key.service'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/common/types/authenticated-user'
import { CreateByEnterpriseApiKeyDto } from './dto/create-by-enterprise'

@Controller('/api-key')
export class ApiKeyController {
	constructor(private apiKeyService: ApiKeyService) {}

	@Post()
	@AccessTokenAuth(UserRole.ADMIN)
	create(@Body() createApiKeyDto: CreateApiKeyDto) {
		return this.apiKeyService.create(createApiKeyDto)
	}

	@Post('/enterprise')
	@AccessTokenAuth(UserRole.ENTERPRISE)
	createByEnterprise(
		@Body() createByEnterpriseApiKeyDto: CreateByEnterpriseApiKeyDto,
		@CurrentUser() user: AuthenticatedUser
	) {
		return this.apiKeyService.create({
			...createByEnterpriseApiKeyDto,
			enterpriseId: user.enterpriseSub as string,
		})
	}

	@Delete(':apiKeyId')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	delete(
		@CurrentUser() user: AuthenticatedUser,
		@Param('apiKeyId', new ParseUUIDPipe()) apiKeyId: string
	) {
		return this.apiKeyService.delete(apiKeyId, user.enterpriseSub)
	}

	@Patch('/disable/:apiKeyId')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	disable(
		@CurrentUser() user: AuthenticatedUser,
		@Param('apiKeyId', new ParseUUIDPipe()) apiKeyId: string
	) {
		return this.apiKeyService.disable(apiKeyId, user.enterpriseSub)
	}
	
  @Patch('/enable/:apiKeyId')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	enable(
		@CurrentUser() user: AuthenticatedUser,
		@Param('apiKeyId', new ParseUUIDPipe()) apiKeyId: string
	) {
		return this.apiKeyService.enable(apiKeyId, user.enterpriseSub)
	}

	@Get()
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	findAll(
		@CurrentUser() user: AuthenticatedUser,
		@Query() findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto
	) {
		return this.apiKeyService.findAll(
			findAllPaginationApiKeyDto,
			user.enterpriseSub
		)
	}

	@Put(':apiKeyId')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	update(
		@Body() updateApiKeyDto: UpdateApiKeyDto,
		@CurrentUser() user: AuthenticatedUser,
		@Param('apiKeyId', new ParseUUIDPipe()) apiKeyId: string
	) {
		return this.apiKeyService.update(
			updateApiKeyDto,
			apiKeyId,
			user.enterpriseSub
		)
	}
}
