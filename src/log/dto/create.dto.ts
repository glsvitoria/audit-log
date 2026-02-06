import { IsNotEmpty, IsObject, IsOptional, IsString } from 'class-validator'

export class CreateLogDto {
	@IsString({
		message: 'A ação deve ser uma string',
	})
	@IsNotEmpty({
		message: 'A ação não pode ser vazia',
	})
	action: string

	@IsString({
		message: 'A entidade deve ser uma string',
	})
	@IsOptional()
	entity?: string

	@IsString({
		message: 'O ID da entidade deve ser uma string',
	})
	@IsOptional()
	entityId: string

	@IsString({
		message: 'O cargo do autor deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O cargo do autor não pode ser vazio',
	})
	actorRole: string

	@IsString({
		message: 'O ID do autor deve ser uma string',
	})
	@IsNotEmpty({
		message: 'O ID do autor não pode ser vazio',
	})
	actorId: string

	@IsObject({
		message: 'Os dados antigos devem ser um objeto',
	})
	@IsOptional()
	oldData?: any

	@IsObject({
		message: 'Os dados novos devem ser um objeto',
	})
	@IsOptional()
	newData?: any

	@IsString({
		message: 'A mensagem deve ser uma string',
	})
	@IsOptional()
	message?: string
}
