import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto'
import { Prisma } from '@/generated/prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

enum ApiKeySortFieldEnum {
	CreatedAt = 'createdAt',
}

export class FindAllPaginationApiKeyDto extends PaginationQueryDto<'createdAt'> {
	@IsEnum(ApiKeySortFieldEnum)
	@IsOptional()
	sort: ApiKeySortFieldEnum = ApiKeySortFieldEnum.CreatedAt

	@IsString()
	@IsOptional()
	enterpriseId?: string

	where(): Prisma.ApiKeyWhereInput {
		const AND: Prisma.Enumerable<Prisma.ApiKeyWhereInput> = []

		if (this.enterpriseId) {
			AND.push({
				enterpriseId: this.enterpriseId,
			})
		}

		return {
			AND,
		}
	}
}
