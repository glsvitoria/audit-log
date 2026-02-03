import { IsOptional, IsString } from 'class-validator'

export class UpdateEnterpriseDto {
	@IsString({
		message: 'O nome deve ser uma string',
	})
	@IsOptional()
	name: string

	@IsString({
		message: 'O email deve ser uma string',
	})
	@IsOptional()
	email: string
}
