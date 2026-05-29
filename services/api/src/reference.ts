import { randomBytes } from 'node:crypto';

const PREFIX = 'HBK-';
const ALPHABET = '0123456789ABCDEF';

export function generateBookingReference(existingReferences: Iterable<string>): string {
  const taken = new Set(existingReferences);

  for (let attempt = 0; attempt < 100; attempt++) {
    const bytes = randomBytes(4);
    let suffix = '';
    for (const byte of bytes) {
      suffix += ALPHABET[byte % ALPHABET.length];
    }
    const reference = `${PREFIX}${suffix}`;
    if (!taken.has(reference)) return reference;
  }

  throw new Error('Failed to generate unique booking reference');
}

export function isBookingReference(value: string): boolean {
  return /^HBK-[0-9A-F]{4}$/.test(value);
}
