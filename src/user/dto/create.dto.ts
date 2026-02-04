import { PasswordMatch } from '@/common/decorators/password-match.decorator'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateUserDto {
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

	@IsString({
		message: 'A senha deve ser uma string',
	})
	@IsNotEmpty({
		message: 'A senha não pode ser vazia',
	})
	password: string

	@IsString({
		message: 'A confirmação de senha deve ser uma string',
	})
	@IsNotEmpty({
		message: 'A confirmação de senha não pode ser vazia',
	})
	@PasswordMatch()
	confirmPassword: string

	@IsString({
		message: 'O ID da empresa deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O ID da empresa não pode ser vazio',
	})
	enterpriseId: string
}
