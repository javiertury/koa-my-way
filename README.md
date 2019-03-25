# koa-my-way

Adaptation of [find-my-way](https://github.com/delvedor/find-my-way) that uses koa middlewares. Also, it can import routes defined by [route-imperator](https://github.com/javiertury/route-imperator).

## Installation

```javascript
npm install --save koa-my-way
```

## Example

```javascript
const koa = require('koa')
const router = require('koa-my-way')()

router.on('GET', '/', (ctx, next) => {
  ctx.body = '{"message":"hello world"}'
})

koa.use(router.middleware());
```

## Modified API

### router.on(method, path, [opts,] ...handlers[, store])

Defines a route, there are also shorthand methods available. Since koa already provides state management using `ctx`, using `store` is discouraged.

```javascript

router.on('GET', '/', searchPhotos);
router.on('GET', '/:id', findPhoto);
router.on('POST', '/d', verifyLoggedIn, uploadPhoto);

// Equivalent calls using shorthand methods
router
.get('/', searchPhotos)
.get('/:id', findPhoto)
.post('/', verifyLoggedIn, uploadPhoto)

```

### router.load(routes)

Load routes declared with `route-imperator` or from another instance of `koa-my-way`.

```javascript

// routes/messages.js

const routes = require('route-imperator')()

routes.use(verifyLoggedIn)

routes
.get('/', )
.get('/:id', )

module.exports = routes


// routes/index.js

const routes = require('route-imperator')()

const users = require('./users');
const messages = require('./messages');

// Nest routes using a path prefix
routes.load('/users', users)
routes.load('/messages', messages)

module.exports = routes


// router.js

const router = require('koa-my-way')()
const routes = require('./routes')

router.load(routes);

module.exports = router;
```

### router.lookup(ctx, next)

Finds a route and executes handlers.

```javascript
koa.use((ctx, next) => {
  return router.lookup(ctx, next)
});
```

### router.middleware()

Creates a koa middleware. It's a wrapper for lookup.

```javascript
koa.use(router.middleware());
```

### Remaining methods

The remaining methods are untouched, go to [find-my-way](https://github.com/delvedor/find-my-way) for more information.
