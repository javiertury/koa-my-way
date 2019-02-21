'use strict';

const chai = require('chai'),
  sinon = require('sinon'),
  sinonChai = require('sinon-chai'),
  support = require('./support'),
  Router = require('../index');

chai.use(sinonChai);

describe('"lookup" method', () => {

  it('finds correct route handler', () => {
    const routeA = {
      method: 'GET',
      path: '/a',
      handler: [
        function handlerA0 (ctx, next) { return next(); },
        function handlerA1 (ctx, next) { return next(); },
        function handlerA2 (ctx, next) { return next(); },
      ],
    };

    const routeB = {
      method: ['HEAD', 'POST'],
      path: '/b',
      handler: [
        function handlerB0 (ctx, next) { return next(); },
        function handlerB1 (ctx, next) { return next(); },
        function handlerB2 (ctx, next) { return next(); },
      ],
    };

    support.spyRoute(routeA);
    support.spyRoute(routeB);

    const router = new Router();
    router.on(routeA.method, routeA.path, routeA.handler[0], routeA.handler[1], routeA.handler[2]);
    router.on(routeB.method, routeB.path, routeB.handler[0], routeB.handler[1], routeB.handler[2]);

    const next = sinon.spy();

    // Find GET /a
    router.lookup(support.createCtx('GET', '/a'), next);
    support.checkRouteUsed(routeA, next);
    support.checkRouteNotUsed(routeB);

    // Find HEAD /b
    router.lookup(support.createCtx('HEAD', '/b'), next);
    support.checkRouteNotUsed(routeA);
    support.checkRouteUsed(routeB, next);

    // Find POST /b
    router.lookup(support.createCtx('POST', '/b'), next);
    support.checkRouteNotUsed(routeA);
    support.checkRouteUsed(routeB, next);

    // Miss POST /a
    router.lookup(support.createCtx('POST', '/a'), next);
    support.checkRouteNotUsed(routeA, next);
    support.checkRouteNotUsed(routeB, next);

    // Miss GET /b
    router.lookup(support.createCtx('GET', '/b'), next);
    support.checkRouteNotUsed(routeA, next);
    support.checkRouteNotUsed(routeB, next);

    // Miss GET /c
    router.lookup(support.createCtx('GET', '/c'), next);
    support.checkRouteNotUsed(routeA, next);
    support.checkRouteNotUsed(routeB, next);

    // Miss POST /c
    router.lookup(support.createCtx('POST', '/c'), next);
    support.checkRouteNotUsed(routeA, next);
    support.checkRouteNotUsed(routeB, next);
  });

  it('can use default route', () => {
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

    const defaultHandler = sinon.spy(function defaultHandler (ctx, next) { return next(); });

    const router = new Router({
      defaultRoute: defaultHandler,
    });
    router.on(route.method, route.path, route.handler[0], route.handler[1], route.handler[2]);

    const next = sinon.spy();

    // Find GET /a
    router.lookup(support.createCtx('GET', '/a'), next);
    support.checkRouteUsed(route, next);
    support.checkDefaultNotUsed(defaultHandler);

    // Default on HEAD /b
    router.lookup(support.createCtx('HEAD', '/b'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);

    // Default on POST /b
    router.lookup(support.createCtx('POST', '/b'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);

    // Default on POST /a
    router.lookup(support.createCtx('POST', '/a'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);

    // Default on GET /b
    router.lookup(support.createCtx('GET', '/b'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);

    // Default on GET /c
    router.lookup(support.createCtx('GET', '/c'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);

    // Default on POST /c
    router.lookup(support.createCtx('POST', '/c'), next);
    support.checkRouteNotUsed(route);
    support.checkDefaultUsed(defaultHandler, next);
  });
});
