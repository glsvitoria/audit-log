import { Prisma } from '@/generated/prisma/client'

export const softDeleteExtension = Prisma.defineExtension((client) => {
	return client.$extends({
		query: {
			$allModels: {
				async count({ args, query }) {
					args.where = {
						...(args.where ?? {}),
						deletedAt: null,
					}

					return query(args)
				},

				async findMany({ args, query }) {
					args.where = {
						...(args.where ?? {}),
						deletedAt: null,
					}

					return query(args)
				},

				async findFirst({ args, query }) {
					args.where = {
						...(args.where ?? {}),
						deletedAt: null,
					}

					return query(args)
				},

				async delete({ model, args }) {
					return client[model].update({
						where: args.where,
						data: {
							deletedAt: new Date(),
						},
					})
				},

				async deleteMany({ model, args }) {
					return client[model].updateMany({
						where: args.where,
						data: {
							deletedAt: new Date(),
						},
					})
				},
			},
		},
	})
})
