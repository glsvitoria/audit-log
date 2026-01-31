import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthenticateDto } from './dto/authenticate.dto';

@Controller('/auth')
export class AuthController {
	constructor() {}

  @Post()
  @HttpCode(201)
  authenticate(@Body() authenticateDto: AuthenticateDto) {

  }
}
