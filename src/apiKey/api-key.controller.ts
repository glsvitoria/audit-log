import {
	Body,
	Controller,
	Delete,
	Get,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
	Query,
} from '@nestjs/common'
import { CreateApiKeyDto } from './dto/create.dto'
import { ApiKeyService } from './api-key.service'
import { CreateByEnterpriseApiKeyDto } from './dto/create-by-enterprise'
import { CurrentUser } from '@/common/decorators/current-user.decorator'
import type { AuthenticatedUser } from '@/common/types/authenticated-user'
import { FindAllPaginationApiKeyDto } from './dto/find-all-pagination.dto'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { UpdateApiKeyDto } from './dto/update.dto'

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
		return this.apiKeyService.createByEnterprise(
			createByEnterpriseApiKeyDto,
			user.sub
		)
	}

	@Delete(':api_key_id')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	delete(@Param('api_key_id', new ParseUUIDPipe()) api_key_id: string) {
		return this.apiKeyService.delete(api_key_id)
	}

	@Get()
	@AccessTokenAuth(UserRole.ADMIN)
	findAll(@Query() findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto) {
		return this.apiKeyService.findAll(findAllPaginationApiKeyDto)
	}

	@Get('/enterprise')
	@AccessTokenAuth(UserRole.ENTERPRISE)
	findAllByEnterprise(
		@Query() findAllPaginationApiKeyDto: FindAllPaginationApiKeyDto,
		@CurrentUser() user: AuthenticatedUser
	) {
		return this.apiKeyService.findAllByEnterprise(
			findAllPaginationApiKeyDto,
			user.sub
		)
	}

	@Put(':api_key_id')
	@AccessTokenAuth(UserRole.ADMIN, UserRole.ENTERPRISE)
	update(
		@Body() updateApiKeyDto: UpdateApiKeyDto,
		@Param('api_key_id', new ParseUUIDPipe()) api_key_id: string
	) {
		return this.apiKeyService.update(updateApiKeyDto, api_key_id)
	}
}
