'use strict';

const chai = require('chai'),
  expect = chai.expect,
  support = require('./support'),
  Router = require('../index');

describe('"on" method', () => {
  it('should process routes', () => {
    const router = new Router();
    const route = {
      method: 'GET',
      path: '/',
      handler: function handler0 (ctx, next) { return next(); },
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.handler);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with options', () => {
    const router = new Router();
    const route = {
      method: 'GET',
      path: '/',
      opts: {
        version: '1.2.3',
      },
      handler: function handler0 (ctx, next) { return next(); },
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.opts, route.handler);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with multiple handlers', () => {
    const router = new Router();
    const route = {
      method: 'GET',
      path: '/',
      handler: [
        function handler0 (ctx, next) { return next(); },
        function handler1 (ctx, next) { return next(); },
        function handler2 (ctx, next) { return next(); },
      ],
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.handler[0], route.handler[1], route.handler[2]);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with options and multiple handlers', () => {
    const router = new Router();
    const route = {
      method: 'GET',
      path: '/',
      opts: {
        version: '1.2.3',
      },
      handler: [
        function handler0 (ctx, next) { return next(); },
        function handler1 (ctx, next) { return next(); },
        function handler2 (ctx, next) { return next(); },
      ],
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.opts, route.handler[0], route.handler[1], route.handler[2]);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with multiple methods', () => {
    const router = new Router();
    const route = {
      method: ['GET', 'HEAD', 'POST'],
      path: '/',
      handler: function handler0 (ctx, next) { return next(); },
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.handler);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with multiple methods and handlers', () => {
    const router = new Router();
    const route = {
      method: ['GET', 'HEAD', 'POST'],
      path: '/',
      handler: [
        function handler0 (ctx, next) { return next(); },
        function handler1 (ctx, next) { return next(); },
        function handler2 (ctx, next) { return next(); },
      ],
    };
    support.spyRoute(route);

    router.on(route.method, route.path, route.handler[0], route.handler[1], route.handler[2]);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('Is chainable', () => {
    // One handler
    const router = new Router();
    const result = router.on('GET', '/a', () => {});
    expect(result).to.equal(router);

    // Multiple handlers
    const router2 = new Router();
    const result2 = router2.on('GET', '/a', () => {}, () => {}, () => {});
    expect(result2).to.equal(router2);
  });
});
