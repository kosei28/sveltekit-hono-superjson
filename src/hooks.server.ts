import type { Handle } from '@sveltejs/kit';
import { app } from '$lib/hono';

export const handle: Handle = async ({ event, resolve }) => {
    if (event.url.pathname.startsWith('/api')) {
        return await app.handleEvent(event);
    }

    return resolve(event);
};
