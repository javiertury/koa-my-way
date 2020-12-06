import { HTTPMethod, KoaRoute, InstanceRoute } from '../src/router';

export const spyRoute = (routes: InstanceRoute | InstanceRoute[]) => {
  routes.forEach(route => {
    if (!route.handler) {
      throw new Error('Route does not have handler');
    }

    route.handler = sinon.spy(route.handler);
  });
};

export const checkDeclaredRoutes = (origRoutes: KoaRoute[], declaredRoutes: KoaRoute[]) => {
  let i = 0;

  origRoutes.forEach(route => {
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

export const createCtx = (method: HTTPMethod, url: string) => {
  return {
    req: {
      method: method,
      url: url,
      headers: {},
    },
    res: {
      statusCode: 404
    },
  };
};

export const checkRouteUsed = (route, next) => {
  route.handler.forEach(h => {
    expect(h).to.have.been.called;
    h.resetHistory();
  });

  if (next) {
    expect(next).to.have.been.called;
    next.resetHistory();
  }
};

export const checkRouteNotUsed = (route, next) => {
  route.handler.forEach(h => {
    expect(h).to.not.have.been.called;
  });

  if (next) {
    expect(next).to.not.have.been.called;
  }
};

export const checkDefaultUsed = (defaultHandler, next) => {
  expect(defaultHandler).to.have.been.called;
  defaultHandler.resetHistory();

  if (next) {
    expect(next).to.have.been.called;
    next.resetHistory();
  }
};

export const checkDefaultNotUsed = (defaultHandler, next) => {
  expect(defaultHandler).to.not.have.been.called;

  if (next) {
    expect(next).to.not.have.been.called;
  }
};
