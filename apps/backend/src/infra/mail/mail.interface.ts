/**
 * Email provider abstraction. Concrete implementations (Brevo, Resend, SES, …)
 * live behind this interface so the provider can change without touching callers.
 */
export interface ISendEmailInput {
  to: string;
  subject: string;
  html: string;
  from?: string;
}

export interface IMailProvider {
  send(input: ISendEmailInput): Promise<void>;
}

export const MAIL_PROVIDER = Symbol('MAIL_PROVIDER');
