import {
	PostgreSqlContainer,
	StartedPostgreSqlContainer,
} from '@testcontainers/postgresql'
import { execSync } from 'node:child_process'
import { beforeEach, afterEach } from 'vitest'

let container: StartedPostgreSqlContainer

beforeEach(async () => {
	container = await new PostgreSqlContainer('postgres:alpine').start()

	const url = container.getConnectionUri()
	process.env.DATABASE_URL = url

	execSync('npx prisma migrate deploy')
}, 60000)

afterEach(async () => {
	// 4. Mata o container ao fim de todos os arquivos de teste
	if (container) {
		await container.stop()
	}
})
