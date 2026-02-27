import { env } from '@/config/env-validation'
import { createHmac, randomBytes } from 'crypto'

export function hashApiKey(): string {
	const apiKeyGenerated = randomBytes(32).toString('hex')

	return createHmac('sha256', env.API_KEY_SECRET)
		.update(apiKeyGenerated)
		.digest('hex')
}
