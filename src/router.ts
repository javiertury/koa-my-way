import Router, {
  HTTPMethod,
  HTTPVersion,
  RouteOptions,
  Handler
} from 'find-my-way';
import compose, { Middleware } from 'koa-compose';
import http, { IncomingMessage } from 'http';

import type { ExtendableContext, ParameterizedContext, Next } from 'koa';

export {
  HTTPMethod
};

export const httpMethods = http.METHODS as HTTPMethod[];

type ExtendedHTTPMethod = HTTPMethod | 'ALL';

type WithParams <T> = T & {
  params: Record<string, string | undefined>
}

export interface InstanceRoute <
  C extends WithParams<ExtendableContext> = WithParams<ExtendableContext>
> {
  method: HTTPMethod
  path: string
  opts: RouteOptions | {}
  handler: Middleware<C>
}

export interface KoaRoute <
  C extends WithParams<ExtendableContext> = WithParams<ExtendableContext>
> {
  method: ExtendedHTTPMethod
  path: string
  handler?: Middleware<C>
  handlers?: Middleware<C>[]
}

interface KoaShortHandRoute <C extends ExtendableContext> {
  (path: string, handler: Middleware<WithParams<C>>): KoaRouter<C>
  (path: string, opts: RouteOptions, handler: Middleware<WithParams<C>>): KoaRouter<C>
}

interface KoaFindResult <C> {
  handler: Middleware<C>
  params: Record<string, string | undefined>
}

interface Instance extends Router.Instance<HTTPVersion.V1> {
  versioning: {
    deriveVersion<Context>(req: IncomingMessage, ctx?: Context): string,
  }
  routes: readonly InstanceRoute[]
}

const getRouteHandler = <C extends WithParams<ExtendableContext>> (r: KoaRoute<C>): Middleware<C> => {
  if (r.handler) {
    return r.handler;
  }

  const handler = r.handlers == null
    ? undefined
    : (r.handlers?.length > 1
      ? compose(r.handlers)
      : r.handlers[0]
    );

  if (!handler) {
    throw new Error(`Route ${r.method} ${r.path} does not have a handler`);
  }

  return handler;
};

// Untouched find-my-way function for compatibility
const sanitizeUrl = (url: string): string => {
  for (var i = 0, len = url.length; i < len; i++) {
    var charCode = url.charCodeAt(i);
    if (charCode === 63 || charCode === 59 || charCode === 35) {
      return url.slice(0, i);
    }
  }
  return url;
};

class ShortHandMethods <C extends ExtendableContext> {}

interface ShortHandMethods <C extends ExtendableContext> {
  acl: KoaShortHandRoute<C>;
  bind: KoaShortHandRoute<C>;
  checkout: KoaShortHandRoute<C>;
  connect: KoaShortHandRoute<C>;
  copy: KoaShortHandRoute<C>;
  delete: KoaShortHandRoute<C>;
  get: KoaShortHandRoute<C>;
  head: KoaShortHandRoute<C>;
  link: KoaShortHandRoute<C>;
  lock: KoaShortHandRoute<C>;
  'm-search': KoaShortHandRoute<C>;
  merge: KoaShortHandRoute<C>;
  mkactivity: KoaShortHandRoute<C>;
  mkcalendar: KoaShortHandRoute<C>;
  mkcol: KoaShortHandRoute<C>;
  move: KoaShortHandRoute<C>;
  notify: KoaShortHandRoute<C>;
  options: KoaShortHandRoute<C>;
  patch: KoaShortHandRoute<C>;
  post: KoaShortHandRoute<C>;
  propfind: KoaShortHandRoute<C>;
  proppatch: KoaShortHandRoute<C>;
  purge: KoaShortHandRoute<C>;
  put: KoaShortHandRoute<C>;
  rebind: KoaShortHandRoute<C>;
  report: KoaShortHandRoute<C>;
  search: KoaShortHandRoute<C>;
  source: KoaShortHandRoute<C>;
  subscribe: KoaShortHandRoute<C>;
  trace: KoaShortHandRoute<C>;
  unbind: KoaShortHandRoute<C>;
  unlink: KoaShortHandRoute<C>;
  unlock: KoaShortHandRoute<C>;
  unsubscribe: KoaShortHandRoute<C>;
}

export type ShortHandMethodName =
  | 'acl'
  | 'bind'
  | 'checkout'
  | 'connect'
  | 'copy'
  | 'delete'
  | 'get'
  | 'head'
  | 'link'
  | 'lock'
  | 'm-search'
  | 'merge'
  | 'mkactivity'
  | 'mkcalendar'
  | 'mkcol'
  | 'move'
  | 'notify'
  | 'options'
  | 'patch'
  | 'post'
  | 'propfind'
  | 'proppatch'
  | 'purge'
  | 'put'
  | 'rebind'
  | 'report'
  | 'search'
  | 'source'
  | 'subscribe'
  | 'trace'
  | 'unbind'
  | 'unlink'
  | 'unlock'
  | 'unsubscribe';

for (const m of httpMethods) {
  ShortHandMethods.prototype[m.toLowerCase() as ShortHandMethodName] = function <C extends ExtendableContext> (
    this: KoaRouter<C>,
    path: string,
    opts: RouteOptions | Middleware<WithParams<C>>,
    ...handlers: Middleware<WithParams<C>>[]
  ) {
    return this.on(m, path, opts, ...handlers);
  };
}

export interface Config <
  C extends ExtendableContext
> {
  ignoreTrailingSlash?: boolean;
  allowUnsafeRegex?: boolean;
  caseSensitive?: boolean;
  maxParamLength?: number;

  defaultRoute?: Middleware<C>;

  // It's impossible make it use a middleware
  onBadUrl?: (
    path: string,
    req: Req<V>,
    res: Res<V>
  ) => void

  versioning?: {
    storage: () => {
      // It's impossible make them use a middleware
      get: (version: string) => Handler<V> | null
      set: (version: string, store: Handler<V>) => void
      del: (version: string) => void
      empty: () => void
    }
    deriveVersion: <Context> (req: Req<V>, ctx?: Context) => string
  }
}

export default class KoaRouter <
  C extends ExtendableContext = ParameterizedContext
> extends ShortHandMethods<C> {
  findMyWay: Instance;
  defaultRoute?: Middleware<WithParams<C>>;

  constructor (config?: Router.Config<HTTPVersion.V1>) {
    super();
    this.findMyWay = Router(config) as Instance;
    this.defaultRoute = config?.defaultRoute;
  }

  // Instance methods

  // Get rid of "store" (useless since koa has ctx) and allow multiple middlewares
  // Make this method chainable
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    ...handlers: Middleware<WithParams<C>>[]
  ): KoaRouter<C>;
  on(
    method: HTTPMethod | HTTPMethod[],
    path: string,
    opts: RouteOptions,
    ...handlers: Middleware<WithParams<C>>[]
  ): KoaRouter<C>;
  on (
    method: HTTPMethod | HTTPMethod[],
    path: string,
    opts: RouteOptions | Middleware<WithParams<C>>,
    ...handlers: Middleware<WithParams<C>>[]
  ): KoaRouter<C>;
  on (
    method: HTTPMethod | HTTPMethod[],
    path: string,
    opts: RouteOptions | Middleware<WithParams<C>>,
    ...handlers: Middleware<WithParams<C>>[]
  ): KoaRouter<C> {
    if (typeof opts === 'function') {
      const handler = handlers.length > 0 ? compose([opts, ...handlers]) : opts;

      this.findMyWay.on(method, path, handler as unknown as Handler<HTTPVersion.V1>);
    } else {
      const handler = handlers.length > 1 ? compose(handlers) : handlers[0];

      if (!handler) {
        throw new Error(`A handler must be defined for ${method} - ${path}`);
      }

      this.findMyWay.on(method, path, opts, handler as unknown as Handler<HTTPVersion.V1>);
    }

    return this;
  };

  off (method: HTTPMethod | HTTPMethod[], path: string): void {
    return this.findMyWay.off(method, path);
  }

  reset (): void {
    return this.findMyWay.reset();
  }

  prettyPrint (): string {
    return this.findMyWay.prettyPrint();
  }

  find(
    method: HTTPMethod,
    path: string,
    version?: string
  ): KoaFindResult<WithParams<C>> | null {
    const result = this.findMyWay.find(method, path, version);
    return result
      ? {
        handler: result.handler as unknown as Middleware<C>,
        params: result.params
      }
      : null;
  }

  lookup (ctx: C, next: Next) {
    const handle = this.find(
      ctx.req.method as HTTPMethod,
      sanitizeUrl(ctx.req.url ?? ''),
      this.findMyWay.versioning.deriveVersion(ctx.req, ctx)
    );

    if (handle != null) {
      (ctx as WithParams<C>).params = handle.params;
      return handle.handler(ctx as WithParams<C>, next);
    }

    if (this.defaultRoute != null) {
      return this.defaultRoute(ctx as WithParams<C>, next);
    }
  };

  get routes (): readonly InstanceRoute[] {
    return this.findMyWay.routes;
  }

  load (obj: { routes: KoaRoute<WithParams<C>>[] } | readonly KoaRoute<WithParams<C>>[]): KoaRouter<C> {
    const routes = typeof obj === 'object' && 'routes' in obj ? obj.routes : obj;

    if (!Array.isArray(routes)) {
      throw new Error('Invalid routes object');
    }

    for (const r of routes) {
      const handler = getRouteHandler(r);

      if (r.method === 'ALL') {
        return this.on(httpMethods, r.path, handler);
      }
      this.on(r.method, r.path, handler);
    }

    return this;
  };

  // Export router middleware
  // Cannot name it "routes", that keyword is already used in find-my-way
  middleware (): Middleware<C> {
    return this.lookup.bind(this);
  };

  // Change method signature for multiple handlers, ...handlers
  all (path: string, ...handlers: Middleware<C>[]): KoaRouter<C>
  all (path: string, opts: RouteOptions, ...handlers: Middleware<C>[]): KoaRouter<C>
  all (path: string, opts: RouteOptions | Middleware<C>, ...handlers: Middleware<C>[]): KoaRouter<C> {
    return this.on(httpMethods, path, opts, ...handlers);
  }
}
