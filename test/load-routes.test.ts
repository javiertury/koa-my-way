'use strict';

const chai = require('chai'),
  expect = chai.expect,
  support = require('./support'),
  Router = require('../index');

describe('"load" method', () => {
  const findMyWayRoutes = [{
    method: 'GET',
    path: '/',
    handler: [
      function handler0 (ctx, next) { return next(); },
    ],
  }, {
    method: 'POST',
    path: '/asdf/alsdf',
    handler: [
      function handler0 (ctx, next) { return next(); },
      function handler1 (ctx, next) { return next(); },
      function handler2 (ctx, next) { return next(); },
    ],
  }];
  support.spyRoute(findMyWayRoutes);

  const imperatorRoutes = [{
    method: 'GET',
    path: '/',
    handlers: findMyWayRoutes[0].handler,
  }, {
    method: 'POST',
    path: '/asdf/alsdf',
    handlers: findMyWayRoutes[1].handler,
  }];
 
  it('Can load find-my-way routes', () => {
    const importRoutes = {
      routes: findMyWayRoutes.map(r => {
        return  {
          method: r.method,
          path: r.path,
          handlers: [].concat(r.handler),
        };
      }),
    };
    const router = new Router();
    router.load(importRoutes);

    support.checkDeclaredRoutes(findMyWayRoutes, router.routes);
  });

  it('Can load find-my-way routes from router', () => {
    const router1 = new Router();
    findMyWayRoutes.forEach(r => {
      router1.on(r.method, r.path, ...r.handler);
    });

    const router2 = new Router();
    router2.load(router1);

    support.checkDeclaredRoutes(findMyWayRoutes, router1.routes);
    support.checkDeclaredRoutes(findMyWayRoutes, router2.routes);
  });

  it('Can load route-imperator routes', () => {
    const router = new Router();
    router.load(imperatorRoutes);

    support.checkDeclaredRoutes(findMyWayRoutes, router.routes);
  });

  it('Can load route-imperator routes from instance', () => {
    const router = new Router();
    router.load({ routes: imperatorRoutes });

    support.checkDeclaredRoutes(findMyWayRoutes, router.routes);
  });

  it('Is chainable', () => {
    const routes = {
      routes: [{
        method: 'GET',
        path: '/a',
        handlers: [() => {}],
      }],
    };

    const router = new Router();
    const result = router.load(routes);
    expect(result).to.equal(router);
  });
});

