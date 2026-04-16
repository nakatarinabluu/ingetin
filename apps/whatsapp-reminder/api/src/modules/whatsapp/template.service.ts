export enum TemplateType {
    OTP = 'OTP',
    REMINDER = 'REMINDER'
}

export interface OTPTemplateData { otp: string; }
export interface ReminderTemplateData { title: string; message: string; }
export type TemplateData = OTPTemplateData | ReminderTemplateData | { message?: string };

export class TemplateService {
    private BRAND_NAME = 'INGETIN';

    /**
     * Format a high-fidelity WhatsApp message for a given template type
     */
    format(type: TemplateType, data: TemplateData): string {
        switch (type) {
            case TemplateType.OTP:
                return this.getOTPTemplate((data as OTPTemplateData).otp);
            case TemplateType.REMINDER:
                return this.getReminderTemplate(
                    (data as ReminderTemplateData).title,
                    (data as ReminderTemplateData).message
                );
            default:
                return (data as { message?: string }).message || '';
        }
    }

    private getOTPTemplate(otp: string): string {
        return `🛡️ *${this.BRAND_NAME} SECURITY*\n\nYour verification code is: *${otp}*\n\nThis code will expire in 5 minutes.\n\n_If you did not request this, please ignore this message._`;
    }

    private getReminderTemplate(title: string, body: string): string {
        return `🔔 *REMINDER: ${title}*\n\n${body}`;
    }
}
