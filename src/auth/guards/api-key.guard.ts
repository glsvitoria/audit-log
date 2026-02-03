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

		const apiKeyFinde = await this.apiKeyRepository.find(apiKey)

		if (!apiKeyFinde) {
			throw new UnauthorizedException('API key inválida')
		}

		await this.apiKeyRepository.updateLastUsed(apiKeyFinde.id)

		return true
	}
}
