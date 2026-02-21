import { Injectable, UnauthorizedException } from '@nestjs/common'
import { AuthenticateDto } from './dto/authenticate.dto'
import { compare } from 'bcryptjs'
import { JwtService } from '@nestjs/jwt'
import { env } from '@/config/env-validation'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { UserRole } from '@/generated/prisma/enums'
import type { UserRepository } from '@/user/repositories/user.repository'
import type { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

@Injectable()
export class AuthService {
	constructor(
		private userRepository: UserRepository,
		private enterpriseRepository: EnterpriseRepository,
		private jwtService: JwtService
	) {}

	async authenticate(authenticateDto: AuthenticateDto) {
		const { email, password } = authenticateDto

		const user = await this.userRepository.findByEmail(email)

		if (!user) {
			throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
		}

		if (user.role === UserRole.ENTERPRISE) {
			const enterprise = await this.enterpriseRepository.findById(
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

		const user = await this.userRepository.findById(sub)

		if (!user) {
			throw new UnauthorizedException(ErrorMessagesHelper.INVALID_CREDENTIALS)
		}

    return true
	}
}
