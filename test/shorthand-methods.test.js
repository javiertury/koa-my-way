'use strict';

const chai = require('chai'),
  expect = chai.expect,
  support = require('./support'),
  httpMethods = require('http').METHODS,
  Router = require('../index');

describe('Shorthand methods', () => {

  it('includes minimal set', () => {
    expect(httpMethods).to.include('GET');
    expect(httpMethods).to.include('HEAD');
    expect(httpMethods).to.include('POST');
  });

  it('should process routes', () => {
    httpMethods.forEach(method => {
      const router = new Router();
      const route = {
        method: method,
        path: '/',
        handler: function handler0 (ctx, next) { return next(); },
      };
      support.spyRoute(route);

      router[method.toLowerCase()](route.path, route.handler);
      support.checkDeclaredRoutes(route, router.routes);
    });
  });

  it('should process routes with options', () => {
    httpMethods.forEach(method => {
      const router = new Router();
      const route = {
        method: method,
        path: '/',
        opts: {
          version: '1.2.3',
        },
        handler: function handler0 (ctx, next) { return next(); },
      };
      support.spyRoute(route);

      router[method.toLowerCase()](route.path, route.opts, route.handler);
      support.checkDeclaredRoutes(route, router.routes);
    });
  });

  it('should process routes with multiple handlers', () => {
    httpMethods.forEach(method => {
      const router = new Router();
      const route = {
        method: method,
        path: '/',
        handler: [
          function handler0 (ctx, next) { return next(); },
          function handler1 (ctx, next) { return next(); },
          function handler2 (ctx, next) { return next(); },
        ],
      };
      support.spyRoute(route);

      router[method.toLowerCase()](route.path, route.handler[0], route.handler[1], route.handler[2]);
      support.checkDeclaredRoutes(route, router.routes);
    });
  });

  it('should process routes with options and multiple handlers', () => {
    httpMethods.forEach(method => {
      const router = new Router();
      const route = {
        method: method,
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

      router[method.toLowerCase()](route.path, route.opts, route.handler[0], route.handler[1], route.handler[2]);
      support.checkDeclaredRoutes(route, router.routes);
    });
  });

  it('Is chainable', () => {
    httpMethods.forEach(method => {
      // One handler
      const router = new Router();
      const result = router[method.toLowerCase()]('/a', () => {});
      expect(result).to.equal(router);

      // Multiple handlers
      const router2 = new Router();
      const result2 = router2[method.toLowerCase()]('/a', () => {}, () => {}, () => {});
      expect(result2).to.equal(router2);
    });
  });

});


describe('"all" shorthand method', () => {
  it('should process routes', () => {
    const router = new Router();
    const route = {
      method: httpMethods,
      path: '/',
      handler: function handler0 (ctx, next) { return next(); },
    };
    support.spyRoute(route);

    router.all(route.path, route.handler);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with options', () => {
    const router = new Router();
    const route = {
      method: httpMethods,
      path: '/',
      opts: {
        version: '1.2.3',
      },
      handler: function handler0 (ctx, next) { return next(); },
    };
    support.spyRoute(route);

    router.all(route.path, route.opts, route.handler);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with multiple handlers', () => {
    const router = new Router();
    const route = {
      method: httpMethods,
      path: '/',
      handler: [
        function handler0 (ctx, next) { return next(); },
        function handler1 (ctx, next) { return next(); },
        function handler2 (ctx, next) { return next(); },
      ],
    };
    support.spyRoute(route);

    router.all(route.path, route.handler[0], route.handler[1], route.handler[2]);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('should process routes with options and multiple handlers', () => {
    const router = new Router();
    const route = {
      method: httpMethods,
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

    router.all(route.path, route.opts, route.handler[0], route.handler[1], route.handler[2]);
    support.checkDeclaredRoutes(route, router.routes);
  });

  it('Is chainable', () => {
    // One handler
    const router = new Router();
    const result = router.all('/a', () => {});
    expect(result).to.equal(router);

    // Multiple handlers
    const router2 = new Router();
    const result2 = router2.all('/a', () => {}, () => {}, () => {});
    expect(result2).to.equal(router2);
  });

});
