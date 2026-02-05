import {
	BadRequestException,
	Injectable,
	UnauthorizedException,
} from '@nestjs/common'
import { AuthenticateDto } from './dto/authenticate.dto'
import { AuthRepository } from './repositories/auth.repository'
import { compare } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { env } from '@/config/env-validation'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'
import { UserRole } from '@/generated/prisma/enums'

@Injectable()
export class AuthService {
	constructor(
		private authRepository: AuthRepository,
		private enterpriseRepository: EnterpriseRepository,
		private jwtService: JwtService
	) {}

	async authenticate(authenticateDto: AuthenticateDto) {
		const { email, password } = authenticateDto

		const user = await this.authRepository.findByEmail(email)

		if (!user) {
			throw new BadRequestException(
				'Não foi encontrado nenhum usuário com esse e-mail'
			)
		}

		if (user.role === UserRole.ENTERPRISE) {
			const enterprise = await this.enterpriseRepository.findActiveById(
				user.enterpriseId as string
			)

			if (!enterprise) {
				throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
			}
		}

		const isPasswordValid = await compare(password, user.password)

		if (!isPasswordValid) {
			throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
		}

		const accessToken = await this.jwtService.signAsync(
			{
				sub: user.id,
				role: user.role,
				enterpriseSub: user.enterpriseId ?? undefined,
			},
			{
				secret: env.ACCESS_TOKEN_SECRET,
			}
		)

		return {
			access_token: accessToken,
		}
	}

	async validate(authorization: string) {
		const accessToken = authorization.replace('Bearer ', '')

		const { sub } = this.jwtService.decode(accessToken)

		const user = await this.authRepository.findById(sub)

		if (!user) {
			throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
		}
	}
}
