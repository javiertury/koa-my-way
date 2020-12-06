'use strict';

const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  support = require('./support'),
  Router = require('../index');

chai.use(sinonChai);

describe('"middleware" method', () => {
  const route = {
    method: 'GET',
    path: '/a',
    handler: [
      function handler0 (ctx, next) { return next(); },
      function handler1 (ctx, next) { return next(); },
      function handler2 (ctx, next) { return next(); },
    ],
  };
  support.spyRoute(route);


  it('delegates to lookup', () => {
    // Check that middleware completely delegates to lookup

    const router = new Router();
    router.on(route.method, route.path, route.handler[0], route.handler[1], route.handler[2]);

    // Replace lookup with dummy function
    sinon.stub(router, 'lookup');
    const middleware = router.middleware();

    let ctx;
    const next = sinon.spy();

    // Existing route
    ctx = support.createCtx('GET', '/a');
    middleware(ctx, next);
    expect(ctx).to.equal(router.lookup.getCall(0).args[0]);
    expect(next).to.equal(router.lookup.getCall(0).args[1]);
    support.checkRouteNotUsed(route, next);

    router.lookup.resetHistory();

    // Non-existing route
    ctx = support.createCtx('HEAD', '/b');
    middleware(ctx, next);
    expect(ctx).to.equal(router.lookup.getCall(0).args[0]);
    expect(next).to.equal(router.lookup.getCall(0).args[1]);
    support.checkRouteNotUsed(route, next);

    router.lookup.resetHistory();
  });

  it('delegates to lookup, also for defaultRoute', () => {
    const defaultHandler = sinon.spy(function defaultHandler (ctx, next) { return next(); });
    const router = new Router({
      defaultRoute: defaultHandler,
    });
    router.on(route.method, route.path, route.handler[0], route.handler[1], route.handler[2]);

    // Replace lookup with dummy function
    sinon.stub(router, 'lookup');
    const middleware = router.middleware();

    let ctx;
    const next = sinon.spy();

    // Existing route
    ctx = support.createCtx('GET', '/a');
    middleware(ctx, next);
    expect(ctx).to.equal(router.lookup.getCall(0).args[0]);
    expect(next).to.equal(router.lookup.getCall(0).args[1]);
    support.checkRouteNotUsed(route, next);
    support.checkDefaultNotUsed(defaultHandler, next);

    router.lookup.resetHistory();

    // Non-existing route
    ctx = support.createCtx('HEAD', '/b');
    middleware(ctx, next);
    expect(ctx).to.equal(router.lookup.getCall(0).args[0]);
    expect(next).to.equal(router.lookup.getCall(0).args[1]);
    support.checkRouteNotUsed(route, next);
    support.checkDefaultNotUsed(defaultHandler, next);

    router.lookup.resetHistory();

  });
});
