import { Transporter, createTransport } from 'nodemailer';
import { User } from 'app/entities';

export class Mail {

    private options: object;
    private message: object;
    private transporter: Transporter;

    constructor() {
        this.transporter = createTransport(this.getOptions());
    }

    public async sendEmail(): Promise<void> {
        await this.transporter.verify();
        await this.transporter.sendMail(this.message)
            .catch(err => console.error(err));
    }

    public setMessage(user: User, subject?: string): void {
        this.message = {
            from: 'Yitocode;',
            to: user.email,
            subject: subject,
            text: `Hi! ${user.nickname} is a pleassure.`
        }
    }

    private getOptions(): object {
        this.options = {
            host: 'localhost',
            port: 1025,
            secure: false,
            auth: {
                user: 'project.1',
                pass: 'secret.1'
            }
        }
        return this.options;
    }
}
