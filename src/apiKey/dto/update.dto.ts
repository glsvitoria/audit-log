import { IsOptional, IsString } from 'class-validator'

export class UpdateApiKeyDto {
	@IsString({
		message: 'A descrição deve ser uma string',
	})
	@IsOptional()
	description: string
}
