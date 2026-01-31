import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { CreateEnterpriseDto } from './dto/create.dto'
import { EnterpriseService } from './enterprise.service'
import { AccessTokenAuth } from '@/common/decorators/access-token.decorator'

@Controller('/enterprise')
@AccessTokenAuth()
export class EnterpriseController {
	constructor(private enterpriseService: EnterpriseService) {}

	@Post()
	@HttpCode(204)
	createEnterprise(@Body() createEnterpriseDto: CreateEnterpriseDto) {
		return this.enterpriseService.create(createEnterpriseDto)
	}
}
