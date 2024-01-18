import { RestHandler, RestRequest, SetupWorkerApi } from 'msw';
import { StartReturnType } from 'msw/lib/types/setupWorker/glossary';
import { ServerConfig, HTTPVerb, RouteHandler } from 'miragejs/server';
import { AnyModels, AnyFactories, AnyRegistry } from 'miragejs/-types';

type RawHandler = RouteHandler<AnyRegistry> | {};
type ResponseCode = number;
/** code, headers, serialized response */
type ResponseData = [ResponseCode, {
    [k: string]: string;
}, string | undefined];
/** e.g. "/movies/:id" */
type Shorthand = string;
type RouteArgs = [RouteOptions] | [Record<string, unknown>, ResponseCode] | [Function, ResponseCode] | [Shorthand, RouteOptions] | [Shorthand, ResponseCode, RouteOptions];
type BaseHandler = (path: string, ...args: RouteArgs) => void;
type MirageServer = {
    registerRouteHandler: (verb: HTTPVerb, path: string, rawHandler?: RawHandler, customizedCode?: ResponseCode, options?: unknown) => (request: RestRequest) => ResponseData | PromiseLike<ResponseData>;
    shouldLog: () => boolean;
    get?: BaseHandler;
    post?: BaseHandler;
    put?: BaseHandler;
    delete?: BaseHandler;
    del?: BaseHandler;
    patch?: BaseHandler;
    head?: BaseHandler;
    options?: BaseHandler;
};
type RouteOptions = {
    /** JSON-api option */
    coalesce?: boolean;
    /**
     * Pretender treats a boolean timing option as "async", number as ms delay.
     * TODO: Not sure what MSW does yet.
     */
    timing?: boolean | number;
};
type SetupWorkerApiWithStartPromise = SetupWorkerApi & {
    _startPromise: StartReturnType;
};
declare class MswConfig {
    urlPrefix?: string;
    namespace?: string;
    timing?: number;
    msw?: SetupWorkerApiWithStartPromise;
    mirageServer?: MirageServer;
    mirageConfig?: ServerConfig<AnyModels, AnyFactories>;
    handlers: RestHandler[];
    private passthroughs;
    private passthroughChecks;
    get?: BaseHandler;
    post?: BaseHandler;
    put?: BaseHandler;
    delete?: BaseHandler;
    del?: BaseHandler;
    patch?: BaseHandler;
    head?: BaseHandler;
    options?: BaseHandler;
    constructor();
    create(server: MirageServer, mirageConfig: ServerConfig<AnyModels, AnyFactories>): void;
    config(mirageConfig: ServerConfig<AnyModels, AnyFactories>): void;
    /**
     * Builds a full path for Pretender to monitor based on the `path` and
     * configured options (`urlPrefix` and `namespace`).
     *
     * @private
     * @hide
     */
    _getFullPath(path: string): string;
    passthrough(...args: (string | HTTPVerb[])[]): void;
    start(): void;
    shutdown(): void;
}

export { MswConfig as default };
