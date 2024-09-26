/**
 * Welcome to Cloudflare Workers!
 *
 * This is a template for a Queue consumer: a Worker that can consume from a
 * Queue: https://developers.cloudflare.com/queues/get-started/
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */
import R2Index, { D1Provider } from 'r2-index';

export default {
	async fetch(request: Request, env: Env): Promise<Response> {
        const r2Index = new R2Index({
            provider: new D1Provider(env.MY_DB)
        });

		// Populate the database. In production, this should only be done once
		if(request.url.endsWith('/populate')) {
			await r2Index.getProvider().populate();

			return new Response('Populated');
		}

		return new Response('Hi');
	},
	async queue(batch, env): Promise<void> {
        const r2Index = new R2Index({
            provider: new D1Provider(env.MY_DB)
        });

        for(const message of batch.messages) {
            // Wait until the message has been processed, or else retry
            try {
				console.log('Processing message', message.body);

                await r2Index.handleNotification(message.body as any);
                message.ack();
            } catch(e) {
                console.error(e);
                message.retry();
            }
        }
	},
} satisfies ExportedHandler<Env, Error>;
