import { createHash, randomUUID, randomBytes } from 'crypto';

export const hashToken = (token: string) => createHash('sha256').update(token).digest('hex');

export const normalizePhone = (phone: string) => {
  const digits = phone.replace(/\D/g, '');
  return phone.trim().startsWith('+') ? `+${digits}` : `+91${digits}`;
};

export const newId = () => randomUUID();
export const secureRandom = (bytes = 16) => randomBytes(bytes).toString('hex');
