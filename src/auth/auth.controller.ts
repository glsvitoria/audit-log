import { Body, Controller, HttpCode, Post } from '@nestjs/common'
import { AuthenticateDto } from './dto/authenticate.dto'
import { AuthService } from './auth.service'

@Controller('/auth')
export class AuthController {
	constructor(private authService: AuthService) {}

	@Post()
	@HttpCode(201)
	authenticate(@Body() authenticateDto: AuthenticateDto) {
		return this.authService.authenticate(authenticateDto)
	}
}
