import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { execSync } from 'node:child_process'
import { beforeEach, beforeAll, afterAll } from 'vitest'

let container: StartedPostgreSqlContainer

beforeAll(async () => {
	container = await new PostgreSqlContainer('postgres:alpine').start()

	const url = container.getConnectionUri()
	process.env.DATABASE_URL = url

	execSync('npx prisma migrate deploy')
})

beforeEach(() => {
	execSync('npx prisma migrate reset --force')
})

afterAll(async () => {
	if (container) {
		await container.stop()
	}
})
