import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create.dto'
import { hash } from 'bcryptjs'
import { UpdateUserDto } from './dto/update.dto'
import { ErrorMessagesHelper } from '@/common/helpers/error-messages.helper'
import { SuccessMessagesHelper } from '@/common/helpers/success-messages.helper'
import type { UserRepository } from './repositories/user.repository'
import { Enterprise } from '@/generated/prisma/client'
import type { EnterpriseRepository } from '@/enterprise/repositories/enterprise.repository'

@Injectable()
export class UserService {
	constructor(
		private enterpriseRepository: EnterpriseRepository,
		private userRepository: UserRepository
	) {}

	async create(createUserDto: CreateUserDto) {
		const enterprise = await this.enterpriseRepository.findById(
			createUserDto.enterpriseId
		)

		if (!enterprise) {
			throw new BadRequestException(ErrorMessagesHelper.ENTERPRISE_NOT_FOUND)
		}

		const user = await this.userRepository.findByEmail(createUserDto.email)

		if (user) {
			throw new ConflictException(
				ErrorMessagesHelper.USER_WITH_SAME_EMAIL_CREATED
			)
		}

		const passwordHash = await hash(createUserDto.password, 6)

		await this.userRepository.create({
			email: createUserDto.email,
			name: createUserDto.name,
			password: passwordHash,
			enterprise: {
				connect: {
					id: createUserDto.enterpriseId,
				},
			},
		})

		return {
			message: SuccessMessagesHelper.USER_CREATED,
		}
	}

	async delete(userId: string) {
		const userExists = await this.userRepository.findById(userId)

		if (!userExists) {
			throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND)
		}

		await this.userRepository.delete(userId)

		return {
			message: SuccessMessagesHelper.USER_DELETED,
		}
	}

	async update(updateUserDto: UpdateUserDto, userId: string) {
		const userExists = await this.userRepository.findById(userId)

		if (!userExists) {
			throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND)
		}

		if (updateUserDto.email) {
			const userWithSameEmail = await this.userRepository.findByEmail(
				updateUserDto.email
			)

			if (userWithSameEmail) {
				throw new ConflictException(
					ErrorMessagesHelper.USER_WITH_SAME_EMAIL_CREATED
				)
			}
		}

		await this.userRepository.update(updateUserDto, userId)

		return {
			message: SuccessMessagesHelper.USER_UPDATED,
		}
	}

	async profile(userId: string) {
		const user = await this.userRepository.findById(userId)

		if (!user) {
			throw new NotFoundException(ErrorMessagesHelper.USER_NOT_FOUND)
		}

		let enterprise: Enterprise | null = null

		if (user.enterpriseId) {
			enterprise = await this.enterpriseRepository.findById(user.enterpriseId)
		}

		const { password, enterpriseId, ...userData } = user

		return {
			...userData,
			enterprise,
		}
	}
}
