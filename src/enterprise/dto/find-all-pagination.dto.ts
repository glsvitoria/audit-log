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
				corporateReason: this.corporateReason,
			})
		}

		if (this.email) {
			AND.push({
				email: this.email,
			})
		}

		return {
			AND,
		}
	}
}
