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
	@IsNotEmpty()
	@Min(0)
	@Type(() => Number)
	init: number

	@IsNumber()
	@IsNotEmpty()
	@Min(1)
	@Max(100)
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
