import { PasswordMatch } from '@/common/decorators/password-match.decorator'
import { IsEmail, IsNotEmpty, IsString } from 'class-validator'

export class CreateEnterpriseDto {
	@IsString({
		message: 'A razão social deve ser uma string',
	})
	@IsNotEmpty({
		message: 'A razão social não pode ser vazia',
	})
	corporateReason: string

	@IsEmail(
		{},
		{
			message: 'O email informado é inválido',
		}
	)
	@IsNotEmpty({
		message: 'O email é obrigatório e não pode ser vazio',
	})
	email: string

	@IsString({
		message: 'O nome do responsável deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O nome do responsável é obrigatório e não pode ser vazio',
	})
	responsibleName: string

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
}
