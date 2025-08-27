import { ValidationOptions, ValidateIf } from '@loufa/class-validator';

export function IsNullable(validationOptions?: ValidationOptions) {
    return ValidateIf((_object, value) => value !== null, validationOptions);
}
