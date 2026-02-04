import { ConflictException, Injectable } from '@nestjs/common'
import { CreateUserDto } from './dto/create.dto'
import { UserRepository } from './repositories/user.repository'
import { hash } from 'bcryptjs'

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
}
