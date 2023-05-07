import type { Handle } from '@sveltejs/kit';
import { app } from '$lib/hono';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/api')) {
        event.url.pathname = event.url.pathname.slice(4);
        event.request = new Request(event.url.toString(), event.request);

        return await app.handleEvent(event);
    }

    return resolve(event);
};
