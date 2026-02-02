import { env, Environment } from '@/config/env-validation'

export const addPrefixApiKey = (apiKey: string) => {
	const prefix =
		env.NODE_ENV === Environment.PRODUCTION ? 'sk_live_' : 'sk_test_'

	return `${prefix}${apiKey}`
}
