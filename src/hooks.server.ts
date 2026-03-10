import { redirect } from '@sveltejs/kit';
import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
  const session = event.cookies.get('session');

  if (!session && event.url.pathname !== '/login') {
    throw redirect(302, '/login');
  }

  if (session) {
    // You could do a database lookup here to get user info
    event.locals.user = { name: 'Admin' };
  }
  
  if (session && event.url.pathname === '/login') {
    throw redirect(302, '/');
  }

  const response = await resolve(event);
  return response;
};
