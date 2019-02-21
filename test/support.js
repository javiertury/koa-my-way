'use strict';

const chai = require('chai'),
  expect = chai.expect,
  sinon = require('sinon'),
  sinonChai = require('sinon-chai');

chai.use(sinonChai);

function spyRoute (routes) {
  [].concat(routes).forEach(route => {
    if (!route.handler) {
      throw new Error('Route does not have handler');
    }

    if (Array.isArray(route.handler)) {
      route.handler = route.handler.map(h => {
        return sinon.spy(h);
      });
    } else {
      route.handler = sinon.spy(route.handler);
    }
  });
}

function checkDeclaredRoutes(origRoutes, declaredRoutes) {
  let i = 0;

  [].concat(origRoutes).forEach(route => {
    [].concat(route.method).forEach(method => {

      const declared = declaredRoutes[i];
      i = i + 1;

      // May be array, use deep.equal
      expect(declared.method).to.deep.equal(method);
      expect(declared.path).to.equal(route.path);
      if (!route.handler) {
        throw new Error('Spy was not setup');
      }

      if (Array.isArray(route.handler)) {
        route.handler.forEach(spy => {
          expect(spy).to.not.have.been.called;
        });

        declared.handler({}, () => {});

        route.handler.forEach(spy => {
          expect(spy).to.have.been.called;
          spy.resetHistory();
        });
      } else {
        const spy = route.handler;

        expect(spy).to.not.have.been.called;
        declared.handler({}, () => {});
        expect(spy).to.have.been.called;
        spy.resetHistory();
      }

      // Non-required args
      if (route.opts) {
        expect(declared.opts).to.deep.equal(route.opts);
      }
    });
  });
}

function createCtx(method, url) {
  return {
    req: {
      method: method,
      url: url,
      headers: {},
    },
    res: {
      statusCode: 404,
    },
  };
}

function checkRouteUsed(route, next) {
  route.handler.forEach(h => {
    expect(h).to.have.been.called;
    h.resetHistory();
  });

  if (next) {
    expect(next).to.have.been.called;
    next.resetHistory();
  }
}

function checkRouteNotUsed(route, next) {
  route.handler.forEach(h => {
    expect(h).to.not.have.been.called;
  });

  if (next) {
    expect(next).to.not.have.been.called;
  }
}

function checkDefaultUsed(defaultHandler, next) {
  expect(defaultHandler).to.have.been.called;
  defaultHandler.resetHistory();

  if (next) {
    expect(next).to.have.been.called;
    next.resetHistory();
  }
}

function checkDefaultNotUsed(defaultHandler, next) {
  expect(defaultHandler).to.not.have.been.called;

  if (next) {
    expect(next).to.not.have.been.called;
  }
}

module.exports = {
  spyRoute,
  checkDeclaredRoutes,
  createCtx,
  checkRouteUsed,
  checkRouteNotUsed,
  checkDefaultUsed,
  checkDefaultNotUsed,
};
