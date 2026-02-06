import { PasswordMatch } from '@/common/decorators/password-match.decorator'
import { IsEmail, IsNotEmpty, IsString, IsUUID } from 'class-validator'

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
	@PasswordMatch({
		message: 'A confirmação de senha deve ser igual a senha',
	})
	confirmPassword: string

	@IsUUID(4, {
		message: 'O enterpriseId deve ser um UUID',
	})
	@IsNotEmpty({
		message: 'O enterpriseId não pode ser vazio',
	})
	enterpriseId: string
}
