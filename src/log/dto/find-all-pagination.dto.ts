import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto'
import { IsEnum, IsOptional } from 'class-validator'

enum LogSortFieldEnum {
	CreatedAt = 'createdAt',
}

export class FindAllPaginationDto extends PaginationQueryDto<'createdAt'> {
	@IsEnum(LogSortFieldEnum)
	@IsOptional()
	sort: LogSortFieldEnum = LogSortFieldEnum.CreatedAt
}
