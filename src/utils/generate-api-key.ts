import { env, Environment } from '@/config/env-validation'
import { createHmac, randomBytes } from 'crypto'

export function generateApiKey() {
	const prefix =
		env.NODE_ENV === Environment.PRODUCTION ? 'sk_live_' : 'sk_test_'

	const apiKey = `${prefix}${randomBytes(32).toString('hex')}`

	const hash = createHmac('sha256', env.API_KEY_SECRET)
		.update(apiKey)
		.digest('hex')

	return {
		value: apiKey,
		hash,
	}
}
