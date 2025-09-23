export type ResetPasswordEmailParams = {
    toEmail: string;
    toName?: string | null;
    resetUrl: string;
    token: string;
};

export interface EmailPort {
    sendResetPasswordEmail(params: ResetPasswordEmailParams): Promise<void>;
}


