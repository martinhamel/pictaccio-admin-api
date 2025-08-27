export class InvalidResetCodeError extends Error {
    private email: string;

    constructor(email?: string) {
        super(`Invalid reset code submitted. ${email}`);
        Object.setPrototypeOf(this, new.target.prototype);
        this.name = InvalidResetCodeError.name;
        this.email = email;
    }
}