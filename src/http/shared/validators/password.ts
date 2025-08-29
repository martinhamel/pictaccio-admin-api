import { registerDecorator, ValidationArguments, buildMessage } from 'class-validator';
import { Container } from 'typedi';
import { ConfigSchema } from '../../../core/config_schema';

export function Password() {
    return function (object: any, propertyName: string): void {
        registerDecorator({
            name: 'password',
            target: object.constructor,
            propertyName: propertyName,
            //constraints: [property],
            //options: validationOptions,
            validator: {
                validate(value: any, args: ValidationArguments): boolean {
                    const config = Container.get<ConfigSchema>('config');
                    let valid = true;

                    valid &&= value.length >= config.app.password.policy.minLength ||
                        value.length <= config.app.password.policy.maxLength;
                    // valid &&= value.match(/[a-z]/)?.length >= config.app.password.policy.lowercase;
                    // valid &&= value.match(/[A-Z]/)?.length >= config.app.password.policy.uppercase;
                    // valid &&= value.match(/[^a-z0-9]/i)?.length >= config.app.password.policy.symbols;
                    // valid &&= value.match(/[0-9]/)?.length >= config.app.password.policy.numbers;

                    return valid;
                },
                defaultMessage: buildMessage(
                    eachPrefix => eachPrefix + '$property must comply with the app password policy', null)
            }
        });
    };
}
