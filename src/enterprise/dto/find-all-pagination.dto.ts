import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto'
import { Prisma } from '@/generated/prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

enum EnterpriseSortFieldEnum {
	CreatedAt = 'createdAt',
}

export class FindAllPaginationEnterpriseDto extends PaginationQueryDto<'createdAt'> {
	@IsEnum(EnterpriseSortFieldEnum)
	@IsOptional()
	sort: EnterpriseSortFieldEnum = EnterpriseSortFieldEnum.CreatedAt

	@IsString()
	@IsOptional()
	corporateReason?: string

	@IsString()
	@IsOptional()
	email?: string

	where(): Prisma.EnterpriseWhereInput {
		const AND: Prisma.Enumerable<Prisma.EnterpriseWhereInput> = []

		if (this.corporateReason) {
			AND.push({
				corporateReason: {
					contains: this.corporateReason,
					mode: 'insensitive',
				},
			})
		}

		if (this.email) {
			AND.push({
				email: {
					contains: this.email,
					mode: 'insensitive',
				},
			})
		}

		return {
			AND,
		}
	}
}
