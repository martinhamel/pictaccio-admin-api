import { registerDecorator, ValidationOptions, ValidationArguments, buildMessage } from '@loufa/class-validator';

export function ArrayIncludes(property: readonly string[], validationOptions?: ValidationOptions) {
    return function (object: any, propertyName: string): void {
        registerDecorator({
            name: 'arrayIncludes',
            target: object.constructor,
            propertyName: propertyName,
            constraints: [property],
            options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments): boolean {
                    return args.value
                        ? args.value
                          .map(value => args.constraints[0].includes(value))
                          .filter(value => value)
                          .length !== 0
                        : false;
                },
                defaultMessage: buildMessage(
                    eachPrefix => eachPrefix + '$property must contain one of $constraint1 values', validationOptions)
            }
        });
    };
}
