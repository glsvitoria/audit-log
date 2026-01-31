import { IsNotEmpty, IsString } from 'class-validator'

export class CreateEnterpriseDto {
	@IsString({
		message: 'O nome deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O nome não pode ser vazio',
	})
	name: string

	@IsString({
		message: 'O email deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O email não pode ser vazio',
	})
	email: string
}
