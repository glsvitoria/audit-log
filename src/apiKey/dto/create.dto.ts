import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class CreateApiKeyDto {
	@IsString({
		message: 'A descrição deve ser uma string',
	})
	@IsOptional()
	description: string

	@IsString({
		message: 'O ID da empresa deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O ID da empresa não pode ser vazio',
	})
	enterpriseId: string
}
