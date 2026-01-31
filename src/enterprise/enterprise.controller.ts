import { Controller, Post } from '@nestjs/common'

@Controller('/enterprise')
export class UserController {
	constructor() {}

  @Post()
  createEnterprise() {}
}
