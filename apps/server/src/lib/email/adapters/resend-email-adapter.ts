import type { EmailPort, ResetPasswordEmailParams } from "../ports";

type ResendSendEmailPayload = {
    from: string;
    to: string[];
    subject: string;
    html?: string;
    text?: string;
};

export class ResendEmailAdapter implements EmailPort {
    private readonly apiKey: string;
    private readonly fromAddress: string;

    constructor(apiKey: string, fromAddress: string) {
        this.apiKey = apiKey;
        this.fromAddress = fromAddress;
    }

    async sendResetPasswordEmail(params: ResetPasswordEmailParams): Promise<void> {
        const subject = "Reset your password";
        const html = this.buildResetHtml(params);
        const text = this.buildResetText(params);

        const payload: ResendSendEmailPayload = {
            from: this.fromAddress,
            to: [params.toEmail],
            subject,
            html,
            text,
        };

        const res = await fetch("https://api.resend.com/emails", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${this.apiKey}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(payload),
        });

        if (!res.ok) {
            const body = await safeReadBody(res);
            throw new Error(
                `Resend send email failed: ${res.status} ${res.statusText} ${body ?? ""}`,
            );
        }
    }

    private buildResetHtml(params: ResetPasswordEmailParams): string {
        const safeName = params.toName || "";
        const safeUrl = params.resetUrl;
        return (
            `<div style="font-family: Arial, sans-serif; font-size: 14px; color: #0f172a;">` +
            `<p>${safeName ? `Bonjour ${escapeHtml(safeName)},` : "Bonjour,"}</p>` +
            `<p>Vous avez demandé la réinitialisation de votre mot de passe.</p>` +
            `<p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe:</p>` +
            `<p><a href="${safeUrl}" target="_blank" rel="noopener noreferrer">Réinitialiser mon mot de passe</a></p>` +
            `<p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.</p>` +
            `</div>`
        );
    }

    private buildResetText(params: ResetPasswordEmailParams): string {
        const name = params.toName || "";
        return (
            `${name ? `Bonjour ${name},\n\n` : "Bonjour,\n\n"}` +
            `Vous avez demandé la réinitialisation de votre mot de passe.\n` +
            `Lien de réinitialisation: ${params.resetUrl}\n\n` +
            `Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail.`
        );
    }
}

async function safeReadBody(res: Response): Promise<string | null> {
    try {
        return await res.text();
    } catch {
        return null;
    }
}

function escapeHtml(input: string): string {
    return input
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


