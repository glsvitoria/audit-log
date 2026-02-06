import { IsOptional, IsString } from 'class-validator'

export class UpdateEnterpriseDto {
	@IsString({
		message: 'A razão social deve ser uma string',
	})
	@IsOptional()
	corporateReason?: string

	@IsString({
		message: 'O email deve ser uma string',
	})
	@IsOptional()
	email?: string
}
