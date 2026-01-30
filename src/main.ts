import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module'
import { env } from './config/env-validation'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
	const app = await NestFactory.create(AppModule)

	app.enableCors({
		origin: '*',
		methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
		preflightContinue: false,
		optionsSuccessStatus: 204,
		credentials: true,
	})

	app.useGlobalPipes(
		new ValidationPipe({
			transform: true,
			whitelist: true,
			forbidNonWhitelisted: true,
			disableErrorMessages: false,
		})
	)

	const port = env.PORT

	await app.listen(port)
}

void bootstrap()
