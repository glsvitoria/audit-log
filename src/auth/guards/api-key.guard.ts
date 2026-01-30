import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class ApiKeyGuard implements CanActivate {
	constructor() {}

	canActivate(context: ExecutionContext): boolean {
		const request = context.switchToHttp().getRequest()
		const apiKey = request.headers['x-api-key']

		if (!apiKey) {
			throw new UnauthorizedException('API key não fornecida')
		}

		const validApiKey = 'api-key'

		if (apiKey !== validApiKey) {
			throw new UnauthorizedException('API key inválida')
		}

		return true
	}
}
