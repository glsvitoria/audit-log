import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Put,
} from '@nestjs/common'
import { UpdateEnterpriseDto } from './dto/update.dto'
import { EnterpriseService } from './enterprise.service'
import { CreateEnterpriseDto } from './dto/create.dto'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'
import { UserRole } from '@/generated/prisma/enums'
import { FindAllPaginationEnterpriseDto } from './dto/find-all-pagination.dto'

@Controller('/enterprise')
@AccessTokenAuth(UserRole.ADMIN)
export class EnterpriseController {
	constructor(private enterpriseService: EnterpriseService) {}

	@Post()
	@HttpCode(201)
	create(@Body() createEnterpriseDto: CreateEnterpriseDto) {
		return this.enterpriseService.create(createEnterpriseDto)
	}

	@Delete(':enterpriseId')
	delete(@Param('enterpriseId', new ParseUUIDPipe()) enterpriseId: string) {
		return this.enterpriseService.delete(enterpriseId)
	}

	@Patch(':enterpriseId')
	disable(@Param('enterpriseId', new ParseUUIDPipe()) enterpriseId: string) {
		return this.enterpriseService.disable(enterpriseId)
	}

	@Get()
	findAll(
		@Body() findAllPaginationEnterpriseDto: FindAllPaginationEnterpriseDto
	) {
		return this.enterpriseService.findAll(findAllPaginationEnterpriseDto)
	}

	@Put(':enterpriseId')
	update(
		@Body() updateEnterpriseDto: UpdateEnterpriseDto,
		@Param('enterpriseId', new ParseUUIDPipe()) enterpriseId: string
	) {
		return this.enterpriseService.update(enterpriseId, updateEnterpriseDto)
	}
}
