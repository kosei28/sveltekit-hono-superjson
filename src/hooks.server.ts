import type { Handle } from '@sveltejs/kit';
import { app } from '$lib/hono';
import { Hono } from 'hono';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/api')) {
        return await new Hono().route('/api', app).handleEvent(event);
    }

    return resolve(event);
};
