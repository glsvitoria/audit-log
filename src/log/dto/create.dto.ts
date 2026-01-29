import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateLogDto {
	@IsString()
	@IsNotEmpty()
	action: string

	@IsString()
	@IsOptional()
	entity?: string

	@IsString()
	@IsNotEmpty()
	actorRole: string

	@IsString()
	@IsNotEmpty()
	actorId: string

	@IsObject()
	@IsOptional()
	oldData?: any

	@IsObject()
	@IsOptional()
	newData?: any

	@IsString()
	@IsOptional()
	message?: string
}
