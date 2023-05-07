import type { Context } from 'hono';
import type { StatusCode } from 'hono/utils/http-status';
import type { TypedResponse } from 'hono/dist/types/types';

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
