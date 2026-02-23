import { IsEmail, IsOptional, IsString } from 'class-validator'

export class UpdateUserDto {
	@IsString({
		message: 'O nome deve ser uma string',
	})
	@IsOptional()
	name?: string

	@IsEmail(
		{},
		{
			message: 'O e-mail informado é inválido',
		}
	)
	@IsOptional()
	email?: string
}
