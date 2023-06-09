import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { jsonS } from '$lib/honoSuperjson/response';

export const app = new Hono().basePath('/api');

const route = app
    .get('/', (c) => c.jsonT('Hono!'))
    .get(
        '/hello',
        zValidator(
            'query',
            z.object({
                name: z.string()
            })
        ),
        (c) => {
            const { name } = c.req.valid('query');
            return c.jsonT({
                message: `Hello! ${name}`
            });
        }
    )
    .get('/currentDate', (c) => {
        return jsonS(c, {
            datetime: new Date()
        });
    });

export type AppType = typeof route;
