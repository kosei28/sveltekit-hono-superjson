<script lang="ts">
    import type { AppType } from '$lib/hono';
    import { hcs } from '$lib/honoSuperjson';

    const client = hcs<AppType>('/api');

    const helloPromise = getHello();
    const currentDatePromise = getCurrentDate();

    async function getHello() {
        const res = await client.hello.$get({ query: { name: 'Hono' } });
        const data = await res.json();
        return data;
    }

    async function getCurrentDate() {
        const res = await client.currentDate.$get({});
        const data = await res.json();
        return data;
    }
</script>

<h2>/hello</h2>
{#await helloPromise}
    <p>Loading...</p>
{:then hello}
    <p>{hello.message}</p>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}

<h2>/currentDate</h2>
{#await currentDatePromise}
    <p>Loading...</p>
{:then currentDate}
    <p>{currentDate.datetime.toLocaleString()}</p>
{:catch error}
    <p style="color: red">{error.message}</p>
{/await}
