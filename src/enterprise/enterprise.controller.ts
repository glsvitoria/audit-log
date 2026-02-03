import {
	Body,
	Controller,
	Delete,
	Get,
	HttpCode,
	Param,
	ParseUUIDPipe,
	Post,
	Put,
} from '@nestjs/common'
import { UpdateEnterpriseDto } from './dto/update.dto'
import { EnterpriseService } from './enterprise.service'
import { CreateEnterpriseDto } from './dto/create.dto'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'

@Controller('/enterprise')
@AccessTokenAuth()
export class EnterpriseController {
	constructor(private enterpriseService: EnterpriseService) {}

	@Post()
	@HttpCode(201)
	createEnterprise(@Body() createEnterpriseDto: CreateEnterpriseDto) {
		return this.enterpriseService.create(createEnterpriseDto)
	}

	@Delete(':enterprise_id')
	delete(@Param('enterprise_id', new ParseUUIDPipe()) enterprise_id: string) {
		return this.enterpriseService.delete(enterprise_id)
	}

	@Put(':enterprise_id')
	updateEnterprise(
		@Body() updateEnterpriseDto: UpdateEnterpriseDto,
		@Param('enterprise_id', new ParseUUIDPipe()) enterprise_id: string
	) {
		return this.enterpriseService.update(enterprise_id, updateEnterpriseDto)
	}
}
