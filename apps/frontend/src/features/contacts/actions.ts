// Deep links for one-tap outreach from a contact row/drawer.

export function telHref(mobile: string | null | undefined): string | null {
  const v = mobile?.trim();
  return v ? `tel:${v.replace(/\s+/g, '')}` : null;
}

export function whatsappHref(number: string | null | undefined): string | null {
  const digits = number?.replace(/[^\d]/g, '');
  return digits ? `https://wa.me/${digits}` : null;
}

export function mailtoHref(email: string | null | undefined): string | null {
  const v = email?.trim();
  return v ? `mailto:${v}` : null;
}
