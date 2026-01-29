import { IsArray, IsInt, IsNotEmpty } from 'class-validator'

export class PaginationResultDto<T> {
	@IsArray()
	readonly results: T[]

	@IsInt()
	@IsNotEmpty()
	total: number
}
