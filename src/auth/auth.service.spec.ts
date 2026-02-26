import { JwtService } from '@nestjs/jwt'
import { hash } from 'bcryptjs'
import { AuthService } from './auth.service'
import { InMemoryUserRepository } from '@/user/repositories/in-memory-user.repository'
import { InMemoryEnterpriseRepository } from '@/enterprise/repositories/in-memory-enterprise.repository'
import { env } from '@/config/env-validation'
import { UnauthorizedException } from '@nestjs/common'

let userRepository: InMemoryUserRepository
let enterpriseRepository: InMemoryEnterpriseRepository
let jwtService: JwtService
let sut: AuthService

describe('Auth Service', () => {
	beforeEach(async () => {
		userRepository = new InMemoryUserRepository()
		enterpriseRepository = new InMemoryEnterpriseRepository()
		jwtService = new JwtService()
		sut = new AuthService(enterpriseRepository, jwtService, userRepository)
	})

	it('should be able to authenticate', async () => {
		const enterprise = await enterpriseRepository.create({
			corporateReason: 'John Doe Entertainment',
			email: 'johndoeentertainment@example.com',
		})

		const user = await userRepository.create({
			email: 'johndoe@example.com',
			name: 'John Doe',
			password: await hash('123456', 6),
			enterprise: {
				connect: {
					id: enterprise.id,
				},
			},
		})

		const { access_token } = await sut.authenticate({
			email: 'johndoe@example.com',
			password: '123456',
		})

		const payload = await jwtService.verifyAsync(access_token, {
			secret: env.ACCESS_TOKEN_SECRET,
		})

		expect(payload.sub).toBe(user.id)
		expect(payload.role).toBe(user.role)
	})

	describe('Authenticate', () => {
		it('should not be able to authenticate with wrong email', async () => {
			await expect(
				sut.authenticate({
					email: 'johndoe@example.com',
					password: '123456',
				})
			).rejects.toBeInstanceOf(UnauthorizedException)
		})

		it('should not be able to authenticate with wrong password', async () => {
			const enterprise = await enterpriseRepository.create({
				corporateReason: 'John Doe Entertainment',
				email: 'johndoeentertainment@example.com',
			})

			await userRepository.create({
				name: 'John Doe',
				email: 'johndoe@example.com',
				password: await hash('123456', 6),
				enterprise: {
					connect: {
						id: enterprise.id,
					},
				},
			})

			await expect(
				sut.authenticate({
					email: 'johndoe@example.com',
					password: '123123',
				})
			).rejects.toBeInstanceOf(UnauthorizedException)
		})
	})

	describe('Validate Token', () => {
		it('should be able to validate access_token', async () => {
			const enterprise = await enterpriseRepository.create({
				corporateReason: 'John Doe Entertainment',
				email: 'johndoeentertainment@example.com',
			})

			await userRepository.create({
				email: 'johndoe@example.com',
				name: 'John Doe',
				password: await hash('123456', 6),
				enterprise: {
					connect: {
						id: enterprise.id,
					},
				},
			})

			const { access_token } = await sut.authenticate({
				email: 'johndoe@example.com',
				password: '123456',
			})

			await expect(sut.validate(access_token)).resolves.toBeTruthy()
		})

		it('should not be able to validate incorrect access_token', async () => {
			const randomAccessToken = await jwtService.signAsync(
				{
					sub: 9999,
					role: 'random',
				},
				{
					secret: env.ACCESS_TOKEN_SECRET,
				}
			)

			await expect(sut.validate(randomAccessToken)).rejects.toBeInstanceOf(
				UnauthorizedException
			)
		})
	})
})
