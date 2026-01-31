import { plainToInstance } from 'class-transformer'
import {
	IsEnum,
	IsNotEmpty,
	IsNumber,
	IsString,
	validateSync,
} from 'class-validator'
import * as dotenv from 'dotenv'

dotenv.config()

export enum Environment {
	DEVELOPMENT = 'development',
	PRODUCTION = 'production',
	TEST = 'test',
}

class EnvironmentVariables {
	@IsEnum(Environment)
	@IsNotEmpty()
	NODE_ENV: Environment

	@IsNumber()
	@IsNotEmpty()
	PORT: number

	@IsString()
	@IsNotEmpty()
	DATABASE_URL: string

	@IsString()
	@IsNotEmpty()
	ACCESS_TOKEN_SECRET: string

	@IsString()
	@IsNotEmpty()
	API_KEY_SECRET: string
}

export function validate(config: Record<string, unknown>) {
	const validatedConfig = plainToInstance(EnvironmentVariables, config, {
		enableImplicitConversion: true,
	})

	const errors = validateSync(validatedConfig, {
		skipMissingProperties: false,
	})

	if (errors.length > 0) {
		throw new Error(errors.toString())
	}

	return validatedConfig
}

export const env: EnvironmentVariables = validate(process.env)
