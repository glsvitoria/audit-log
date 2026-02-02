import {
	Body,
	Controller,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Post,
	Query,
} from '@nestjs/common'
import { CreateLogDto } from './dto/create.dto'
import { LogService } from './log.service'
import { FindAllPaginationDto } from './dto/find-all-pagination.dto'
import { ApiKeyAuth } from '@/common/decorators/api-key.decorator'
import { CurrentEnterprise } from '@/common/decorators/current-enterprise.decorator'
import type { AuthenticatedEnterprise } from '@/common/types/authenticated-enterprise'

@ApiKeyAuth()
@Controller('/log')
export class LogController {
	constructor(private logService: LogService) {}

	@Post()
	@HttpCode(201)
	createLog(
		@Body() body: CreateLogDto,
		@CurrentEnterprise() enterprise: AuthenticatedEnterprise
	) {
		return this.logService.create(body, enterprise.apiKey)
	}

	@Get(':log_id')
	find(@Param('log_id', new ParseUUIDPipe()) log_id: string) {
		return this.logService.find(log_id)
	}

	@Get()
	findAll(@Query() query: FindAllPaginationDto) {
		return this.logService.findAll(query)
	}
}
