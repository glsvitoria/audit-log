import { ApiKeyRepository } from '@/apiKey/repositories/api-key.repository'
import {
	CanActivate,
	ExecutionContext,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'

@Injectable()
export class ApiKeyGuard implements CanActivate {
	constructor(private apiKeyRepository: ApiKeyRepository) {}

	async canActivate(context: ExecutionContext): Promise<boolean> {
		const request = context.switchToHttp().getRequest()
		const apiKey = request.headers['x-api-key']

		if (!apiKey) {
			throw new UnauthorizedException('API key não fornecida')
		}

		const isValid = await this.apiKeyRepository.find(apiKey)

		if (!isValid) {
			throw new UnauthorizedException('API key inválida')
		}

		return true
	}
}
