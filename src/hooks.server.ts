import type { Handle } from '@sveltejs/kit';
import { app } from '$lib/hono';
import { Hono } from 'hono';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/api')) {
        if (event.url.pathname.endsWith('/')) {
            event.url.pathname = event.url.pathname.slice(0, -1);
            const req = new Request(event.url.toString(), event.request);
            event.request = req;
        }

        return await new Hono().route('/api', app).handleEvent(event);
    }

    return resolve(event);
};
