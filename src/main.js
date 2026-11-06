const Koa = require('koa');
const Router = require('@koa/router');
const bodyParser = require('koa-bodyparser');

const app = new Koa();
// Trust X-Forwarded-* from nginx / the platform's edge (same as howard's APIService).
app.proxy = true;

// In-memory data, like howard's in-memory sessions: lost on every restart/redeploy.
const items = [
	{ id: 1, name: 'Flex-Pro A3 pump' },
	{ id: 2, name: 'Chem-Feed tubing kit' },
];

const router = new Router({ prefix: '/v1' });

router.get('/health', (ctx) => {
	ctx.body = {
		status: 'ok',
		uptime: Math.round(process.uptime()),
		node: process.version,
		// Railway sets these; handy for confirming which service answered.
		service: process.env.RAILWAY_SERVICE_NAME || 'local',
		environment: process.env.RAILWAY_ENVIRONMENT_NAME || process.env.NODE_ENV,
	};
});

router.get('/items', (ctx) => {
	ctx.body = items;
});

router.post('/items', (ctx) => {
	const name = String(ctx.request.body?.name || '').trim();
	if (!name) {
		ctx.status = 400;
		ctx.body = { error: 'name is required' };
		return;
	}
	const item = { id: items.length ? items[items.length - 1].id + 1 : 1, name };
	items.push(item);
	ctx.status = 201;
	ctx.body = item;
});

app.use(async (ctx, next) => {
	const start = Date.now();
	await next();
	console.log(`${ctx.method} ${ctx.url} ${ctx.status} ${Date.now() - start}ms`);
});
app.use(bodyParser({ jsonLimit: '10mb' }));
app.use(router.routes()).use(router.allowedMethods());

const port = Number(process.env.PORT) || 4000;
// '::' accepts IPv4 and IPv6. Railway's private network can be IPv6-only,
// so binding 0.0.0.0 would make the backend unreachable from the frontend there.
app.listen(port, '::', () => {
	console.log(`API listening on port ${port}`);
});
