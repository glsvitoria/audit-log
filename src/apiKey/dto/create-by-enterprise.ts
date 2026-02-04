import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateByEnterpriseApiKeyDto {
	@IsString({
		message: 'A descrição deve ser uma string',
	})
	@IsOptional()
	description: string
}
