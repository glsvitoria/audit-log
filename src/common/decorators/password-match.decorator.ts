import {
	registerDecorator,
	ValidationArguments,
	ValidationOptions,
	ValidatorConstraint,
	ValidatorConstraintInterface,
} from 'class-validator'

@ValidatorConstraint({ async: false })
export class PasswordMatchConstraint implements ValidatorConstraintInterface {
	validate(passwordConfirmation: any, args?: ValidationArguments) {
		const password = args?.object['password']

		return passwordConfirmation === password
	}
}

export function PasswordMatch(validationOptions?: ValidationOptions) {
	return function (object: Record<string, any>, propertyName: string) {
		registerDecorator({
			target: object.constructor,
			propertyName: propertyName,
			options: validationOptions,
			constraints: [],
			validator: PasswordMatchConstraint,
		})
	}
}
