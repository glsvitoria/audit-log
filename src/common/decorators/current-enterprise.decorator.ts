import { createParamDecorator, ExecutionContext } from '@nestjs/common'
import { Request } from 'express'

export const CurrentEnterprise = createParamDecorator(
	(_: never, context: ExecutionContext) => {
		const request = context.switchToHttp().getRequest<Request>()

		return {
			apiKey: request.headers['x-api-key'] as string,
		}
	}
)
