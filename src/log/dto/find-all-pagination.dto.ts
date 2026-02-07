import { IsDateFormat } from '@/common/decorators/is-date-format'
import { PaginationQueryDto } from '@/common/dtos/pagination-query.dto'
import { Prisma } from '@/generated/prisma/client'
import { IsEnum, IsOptional, IsString } from 'class-validator'

enum LogSortFieldEnum {
	CreatedAt = 'createdAt',
}

export class FindAllPaginationDto extends PaginationQueryDto<'createdAt'> {
	@IsEnum(LogSortFieldEnum)
	@IsOptional()
	sort: LogSortFieldEnum = LogSortFieldEnum.CreatedAt

	@IsString()
	@IsOptional()
	action?: string

	@IsString()
	@IsOptional()
	entity?: string

	@IsString()
	@IsOptional()
	entityId?: string

	@IsString()
	@IsOptional()
	actorRole?: string

	@IsString()
	@IsOptional()
	actorId?: string

	@IsDateFormat()
	@IsOptional()
	startDate?: string

	@IsDateFormat()
	@IsOptional()
	endDate?: string

	@IsString()
	@IsOptional()
	enterpriseId?: string

	where(): Prisma.LogWhereInput {
		const AND: Prisma.Enumerable<Prisma.LogWhereInput> = []

		if (this.action) {
			AND.push({
				OR: [
					{
						action: {
							contains: this.action,
							mode: 'insensitive',
						},
					},
				],
			})
		}

		if (this.entity) {
			AND.push({
				OR: [
					{
						entity: {
							contains: this.entity,
							mode: 'insensitive',
						},
					},
				],
			})
		}

		if (this.entityId) {
			AND.push({
				OR: [
					{
						entityId: {
							contains: this.entityId,
							mode: 'insensitive',
						},
					},
				],
			})
		}

		if (this.actorRole) {
			AND.push({
				OR: [
					{
						actorRole: {
							contains: this.actorRole,
							mode: 'insensitive',
						},
					},
				],
			})
		}

		if (this.actorId) {
			AND.push({
				OR: [
					{
						actorId: {
							contains: this.actorId,
							mode: 'insensitive',
						},
					},
				],
			})
		}

		if (this.enterpriseId) {
			AND.push({
				OR: [
					{
						enterpriseId: {
							equals: this.enterpriseId,
						},
					},
				],
			})
		}

		if (this.startDate) {
			AND.push({
				OR: [
					{
						createdAt: {
							gte: new Date(`${this.startDate}T00:00:00.000Z`),
						},
					},
				],
			})
		}

		if (this.endDate) {
			AND.push({
				OR: [
					{
						createdAt: {
							lte: new Date(`${this.endDate}T23:59:59.999Z`),
						},
					},
				],
			})
		}

		return {
			AND,
		}
	}
}
