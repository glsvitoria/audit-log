import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateEnterpriseDto {
	@IsString({
		message: 'O nome deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O nome não pode ser vazio',
	})
	name: string

	@IsEmail(
		{},
		{
			message: 'O e-mail informado é inválido',
		}
	)
	@IsNotEmpty({
		message: 'O email não pode ser vazio',
	})
	email: string
}
