import {
	ConflictException,
	Injectable,
	NotFoundException,
} from '@nestjs/common'
import { CreateUserDto } from './dto/create.dto'
import { UserRepository } from './repositories/user.repository'
import { hash } from 'bcryptjs'
import { UpdateUserDto } from './dto/update.dto'

@Injectable()
export class UserService {
	constructor(private userRepository: UserRepository) {}

	async create(createUserDto: CreateUserDto) {
		const userExists = await this.userRepository.findByEmail(
			createUserDto.email
		)

		if (userExists) {
			throw new ConflictException('Usuário com esse e-mail já cadastrado')
		}

		const passwordHash = await hash(createUserDto.password, 8)

		const user = await this.userRepository.create({
			email: createUserDto.email,
			name: createUserDto.name,
			password: passwordHash,
		})

		return user
	}

	async delete(user_id: string) {
		const userExists = await this.userRepository.findById(user_id)

		if (!userExists) {
			throw new NotFoundException('Usuário não encontrado')
		}

		return await this.userRepository.delete(user_id)
	}

	async update(updateUserDto: UpdateUserDto, user_id: string) {
		const userExists = await this.userRepository.findById(user_id)

		if (!userExists) {
			throw new NotFoundException('Usuário não encontrado')
		}

		return this.userRepository.update(updateUserDto, user_id)
	}

	async profile(user_id: string) {
		const user = await this.userRepository.findById(user_id)

		if (!user) {
			throw new NotFoundException('Usuário não encontrado')
		}

		return {}
	}
}
