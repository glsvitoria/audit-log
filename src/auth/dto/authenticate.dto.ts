import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class AuthenticateDto {
	@IsEmail(
		{},
		{
			message: 'O e-mail informado é inválido',
		}
	)
	@IsNotEmpty({
		message: 'O e-mail não poder ser vazio',
	})
	email: string

	@IsString({
		message: 'A senha deve ser uma string',
	})
	@IsNotEmpty({
		message: 'A senha não poder ser vazia',
	})
	password: string
}
