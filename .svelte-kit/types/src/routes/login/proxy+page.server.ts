// @ts-nocheck
import { fail, redirect } from '@sveltejs/kit';
import type { Actions, PageServerLoad } from './$types';
import fs from 'fs';
import { env } from '$env/dynamic/private';

const ADMIN_USER = env.ADMIN_USER;
const ADMIN_PASSWORD = env.ADMIN_PASSWORD;

if (!ADMIN_USER || !ADMIN_PASSWORD) {
  throw new Error('ADMIN_USER and ADMIN_PASSWORD environment variables must be set.');
}

export const load = async ({ locals }: Parameters<PageServerLoad>[0]) => {
  if (locals.user) {
    throw redirect(302, '/');
  }
};

export const actions = {
  default: async ({ cookies, request, getClientAddress }: import('./$types').RequestEvent) => {
    const data = await request.formData();
    const username = data.get('username');
    const password = data.get('password');

    if (username === ADMIN_USER && password === ADMIN_PASSWORD) {
      cookies.set('session', 'admin', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
      throw redirect(302, '/');
    }

    const ip = getClientAddress();
    const logMessage = `${new Date().toISOString()} - Failed login attempt for user "${username}" from IP ${ip}\n`;
    fs.appendFile('/var/log/dash/auth.log', logMessage, (err) => {
      if (err) {
        console.error('Failed to write to log file:', err);
      }
    });

    return fail(400, { error: 'Invalid username or password' });
  },
};
;null as any as Actions;