import { Prisma } from '@/generated/prisma/client'

export const softDeleteExtension = Prisma.defineExtension({
  name: 'soft-delete',

  query: {
    $allModels: {
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
        const client = Prisma.getExtensionContext(this) as any

        return client[model].update({
          where: args.where,
          data: {
            deletedAt: new Date(),
          },
        })
      },

      async deleteMany({ model, args }) {
        const client = Prisma.getExtensionContext(this) as any

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
