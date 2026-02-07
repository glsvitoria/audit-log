import { Type } from 'class-transformer'
import { IsNotEmpty, IsNumber, Max, Min } from 'class-validator'
import { PaginationResultDto } from './pagination-result.dto'

export interface IPaginationOptions {
	take: number
	skip: number
}

export abstract class PaginationQueryDto<T extends string = 'createdAt'> {
	abstract sort: T

	@IsNumber()
	@IsNotEmpty({
		message: 'O init é obrigatório e não pode ser vazio',
	})
	@Min(0, {
		message: 'O init deve ser maior ou igual a 0',
	})
	@Type(() => Number)
	init: number

	@IsNumber()
	@IsNotEmpty({
		message: 'O limit é obrigatório e não pode ser vazio',
	})
	@Min(1, {
		message: 'O limit deve ser maior ou igual a 1',
	})
	@Max(100, {
		message: 'O limit deve ser menor ou igual a 100',
	})
	@Type(() => Number)
	limit: number

	pagination(): IPaginationOptions {
		return {
			take: this.limit,
			skip: this.init,
		}
	}

	createMetadata<T>(results: T[], total: number): PaginationResultDto<T> {
		return {
			results,
			total,
		}
	}
}
