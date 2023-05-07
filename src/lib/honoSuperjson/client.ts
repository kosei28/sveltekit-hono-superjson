import { hc } from 'hono/client';
import type { Hono } from 'hono';
import type { UnionToIntersection } from 'hono/utils/types';
import type { Callback, Client, RequestOptions } from 'hono/dist/types/client/types';

import superjson from 'superjson';

const createProxy = (callback: Callback, path: string[]) => {
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    const proxy: unknown = new Proxy(() => {}, {
        get(_obj, key) {
            if (typeof key !== 'string') return undefined;
            return createProxy(callback, [...path, key]);
        },
        apply(_1, _2, args) {
            return callback({
                path,
                args
            });
        }
    });
    return proxy;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const hcs = <T extends Hono<any, any, any>>(baseUrl: string, options?: RequestOptions) =>
    createProxy(async ({ path, args }) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let client: any = hc(baseUrl, options);

        for (const part of path) {
            client = client[part];
        }

        const res: Response = await client(...args);

        if (res.headers.get('x-superjson') === 'true') {
            res.json = async () => {
                const text = await res.text();
                return superjson.parse(text);
            };
        }

        return res;
    }, []) as UnionToIntersection<Client<T>>;
