import { PrismaClient } from '@/generated/prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { hash } from 'bcryptjs'

const prisma = new PrismaClient({
	adapter: new PrismaPg({
		connectionString: process.env.DATABASE_URL as string,
	}),
})

async function main() {
	const passwordHash = await hash('12345678', 6)

	await prisma.user.create({
		data: {
			email: 'guivitoria2010@hotmail.com',
			name: 'Guilherme Vitória',
			password: passwordHash,
      role: 'ADMIN'
		},
	})
}

main()
	.then(async () => {
		await prisma.$disconnect()
	})
	.catch(async (e) => {
		console.error(e)
		await prisma.$disconnect()
		process.exit(1)
	})
