import {
	PipeTransform,
	Injectable,
	BadRequestException,
	ArgumentMetadata,
} from '@nestjs/common'

@Injectable()
export class ValidationUUID implements PipeTransform<string, string> {
	constructor() {}

	transform(value: string, metadata: ArgumentMetadata): string {
		if (!value) {
			throw new BadRequestException(
				`O ${metadata.data} é obrigatório e não pode ser vazio`
			)
		}

		if (typeof value !== 'string') {
			throw new BadRequestException(`O ${metadata.data} deve ser uma string válida`)
		}

		const uuidV4Regex =
			/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

		if (!uuidV4Regex.test(value)) {
			throw new BadRequestException(`O ${metadata.data} deve ser um UUID válido`)
		}

		return value
	}
}
