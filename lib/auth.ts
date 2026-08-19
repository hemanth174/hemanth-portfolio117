import { NextRequest } from 'next/server';
import crypto from 'crypto';

const AUTH_SECRET = process.env.AUTH_SECRET || 'hemanth_super_secret_auth_token_key_2026_jwt_sig';
const ADMIN_ALLOWED_EMAIL = (process.env.ADMIN_ALLOWED_EMAIL || 'ramasaiahemanth@gmail.com').toLowerCase();
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'hemanth_admin_2026';

export interface AdminUser {
  email: string;
  name?: string;
  picture?: string;
  loginAt: number;
}

export function isAllowedEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return email.trim().toLowerCase() === ADMIN_ALLOWED_EMAIL;
}

// Generate signed token using HMAC-SHA256
export function createSessionToken(user: AdminUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', AUTH_SECRET)
    .update(payload)
    .digest('base64url');
  return `${payload}.${signature}`;
}

// Verify signed session token
export function verifySessionToken(token: string | null | undefined): AdminUser | null {
  if (!token || !token.includes('.')) return null;

  try {
    const [payload, signature] = token.split('.');
    const expectedSig = crypto
      .createHmac('sha256', AUTH_SECRET)
      .update(payload)
      .digest('base64url');

    // Constant-time signature comparison to prevent timing attacks
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSig))) {
      return null;
    }

    const data: AdminUser = JSON.parse(Buffer.from(payload, 'base64url').toString('utf-8'));
    
    // Check email permission
    if (!isAllowedEmail(data.email)) {
      return null;
    }

    // Token expires after 7 days
    const maxAge = 7 * 24 * 60 * 60 * 1000;
    if (Date.now() - data.loginAt > maxAge) {
      return null;
    }

    return data;
  } catch {
    return null;
  }
}

// Authenticate request from either session cookie or header
export function verifyAdminRequest(request: NextRequest): boolean {
  // 1. Check custom admin key header (backward compatibility)
  const authKey = request.headers.get('x-admin-key');
  if (authKey && authKey === ADMIN_SECRET) {
    return true;
  }

  // 2. Check Authorization Bearer header
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.slice(7).trim();
    if (verifySessionToken(token)) return true;
    if (token === ADMIN_SECRET) return true;
  }

  // 3. Check session cookie
  const cookieToken = request.cookies.get('admin_token')?.value;
  if (cookieToken && verifySessionToken(cookieToken)) {
    return true;
  }

  return false;
}
