import { ConsoleEmailAdapter } from "./adapters/console-email-adapter";
import { ResendEmailAdapter } from "./adapters/resend-email-adapter";
import type { EmailPort } from "./ports";

let cachedEmailPort: EmailPort | null = null;

export function getEmailPort(): EmailPort {
    if (cachedEmailPort) return cachedEmailPort;

    const apiKey = process.env.RESEND_API_KEY;
    const from = process.env.RESEND_FROM;

    if (apiKey && from) {
        cachedEmailPort = new ResendEmailAdapter(apiKey, from);
        return cachedEmailPort;
    }

    cachedEmailPort = new ConsoleEmailAdapter();
    return cachedEmailPort;
}

export * from "./ports";


