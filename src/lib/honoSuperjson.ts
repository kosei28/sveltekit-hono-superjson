import { hc } from 'hono/client';
import type { Context, Hono } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import type { UnionToIntersection } from 'hono/utils/types';
import type { TypedResponse } from 'hono/dist/types/types';
import type { Callback, Client, RequestOptions } from 'hono/dist/types/client/types';

import superjson from 'superjson';
import type { SuperJSONValue } from 'superjson/dist/types';

type HeaderRecord = Record<string, string | string[]>;

const getSuperjsonResponse = <T = object>(
    c: Context,
    object: T,
    arg?: StatusCode | RequestInit,
    headers?: HeaderRecord
) => {
    const body = superjson.stringify(object);
    c.header('content-type', 'application/json; charset=UTF-8');
    c.header('x-superjson', 'true');
    return typeof arg === 'number' ? c.newResponse(body, arg, headers) : c.newResponse(body, arg);
};

export const jsonS = <T>(
    c: Context,
    object: T extends SuperJSONValue ? T : SuperJSONValue,
    arg?: StatusCode | RequestInit,
    headers?: HeaderRecord
): TypedResponse<T extends SuperJSONValue ? (SuperJSONValue extends T ? never : T) : never> => {
    return {
        response:
            typeof arg === 'number'
                ? getSuperjsonResponse(c, object, arg, headers)
                : getSuperjsonResponse(c, object, arg),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        data: object as any,
        format: 'json'
    };
};

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
