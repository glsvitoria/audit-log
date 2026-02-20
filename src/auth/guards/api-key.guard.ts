import type { ApiKeyRepository } from '@/apiKey/repositories/api-key.types'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
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
			throw new UnauthorizedException(ErrorMessagesHelper.API_KEY_EMPTY)
		}

		const apiKeyFinde = await this.apiKeyRepository.findByApiKey(apiKey)

		if (!apiKeyFinde) {
			throw new UnauthorizedException(ErrorMessagesHelper.API_KEY_INVALID)
		}

		await this.apiKeyRepository.updateLastUsed(apiKeyFinde.id)

		return true
	}
}
