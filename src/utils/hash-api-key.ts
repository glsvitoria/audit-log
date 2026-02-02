import { env, Environment } from '@/config/env-validation'
import { createHmac } from 'crypto'

export function hashApiKey(apiKey: string): string {
	const prefix =
		env.NODE_ENV === Environment.PRODUCTION ? 'sk_live_' : 'sk_test_'

	const apiKeyWithoutPrefix = apiKey.replace(prefix, '')

	return createHmac('sha256', env.API_KEY_SECRET)
		.update(apiKeyWithoutPrefix)
		.digest('hex')
}
