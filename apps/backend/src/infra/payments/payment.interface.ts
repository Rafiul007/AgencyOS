/**
 * Payment gateway abstraction. Concrete implementation (e.g. Stripe) lives behind
 * this interface so the gateway can change without touching billing/event code.
 */
export interface ICreatePaymentInput {
  amountMinor: number; // money is stored/handled in integer minor units, never floats
  currency: string;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ICreatePaymentResult {
  id: string;
  clientSecret?: string;
}

export interface IPaymentGateway {
  createPayment(input: ICreatePaymentInput): Promise<ICreatePaymentResult>;
}

export const PAYMENT_GATEWAY = Symbol('PAYMENT_GATEWAY');
