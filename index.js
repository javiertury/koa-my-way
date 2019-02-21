'use strict';

const Router = require('find-my-way');
const compose = require('koa-compose');
const httpMethods = require('http').METHODS;

function getRouteHandler(r) {
  if (r.handler) {
    return r.handler;
  }

  if (!r.handlers) {
    throw new Error(`Route ${r.method} ${r.path} does not have a handler`);
  }

  return r.handlers.length > 1 ? compose(r.handlers) : r.handlers[0];
}

function KoaRouter() {
  if (!(this instanceof KoaRouter)) {
    return new KoaRouter();
  }

  return Router.apply(this, arguments);
}

KoaRouter.prototype = Object.create(Router.prototype);
KoaRouter.prototype.constructor = KoaRouter;

// Static methods

// Untouched find-my-way function for compatibility
KoaRouter._sanitizeUrl = function _sanitizeUrl (url) {
  for (var i = 0, len = url.length; i < len; i++) {
    var charCode = url.charCodeAt(i);
    if (charCode === 63 || charCode === 59 || charCode === 35) {
      return url.slice(0, i);
    }
  }
  return url;
};

// Instance methods

// Get rid of "store" (useless since koa has ctx) and allow multiple middlewares
// Make this method chainable
KoaRouter.prototype.on = function on (method, path, opts, ...handlers) {
  if (typeof opts === 'function') {
    handlers.unshift(opts);
    opts = {};
  }
  if (!handlers.length) {
    throw new Error(`A handler must be defined for ${method} - ${path}`);
  }

  const handler = handlers.length > 1 ? compose(handlers) : handlers[0];

  Router.prototype.on.call(this, method, path, opts, handler);

  return this;
};

KoaRouter.prototype.lookup = function lookup (ctx, next) {
  const handle = this.find(ctx.req.method, this.constructor._sanitizeUrl(ctx.req.url), this.versioning.deriveVersion(ctx.req, ctx));

  if (handle !== null) {
    ctx.params = handle.params;
    return handle.handler(ctx, next);
  }

  if (this.defaultRoute !== null) {
    return this.defaultRoute(ctx, next);
  }
};

KoaRouter.prototype.load = function load(obj) {
  const routes = typeof obj === 'object' && 'routes' in obj ? obj.routes : obj;

  if (!Array.isArray(routes)) {
    throw new Error('Invalid routes object');
  }

  routes.forEach(r => {
    const handler = getRouteHandler(r);

    if (r.method === 'ALL') {
      return this.on(httpMethods, r.path, handler);
    }
    this.on(r.method, r.path, handler);
  });

  return this;
};

// Export router middleware
// Cannot name it "routes", that keyword is already used in find-my-way
KoaRouter.prototype.middleware = function middleware () {
  return this.lookup.bind(this);
};

// Change method signature for multiple handlers, ...handlers
KoaRouter.prototype.all = function all (path, ...handlers) {
  this.on(httpMethods, path, ...handlers);

  return this;
};
httpMethods.forEach(m => {
  KoaRouter.prototype[m.toLowerCase()] = function (path, ...handlers) {
    return this.on(m, path, ...handlers);
  };
});

module.exports = KoaRouter;
