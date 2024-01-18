"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);
var __async = (__this, __arguments, generator) => {
  return new Promise((resolve, reject) => {
    var fulfilled = (value) => {
      try {
        step(generator.next(value));
      } catch (e) {
        reject(e);
      }
    };
    var rejected = (value) => {
      try {
        step(generator.throw(value));
      } catch (e) {
        reject(e);
      }
    };
    var step = (x) => x.done ? resolve(x.value) : Promise.resolve(x.value).then(fulfilled, rejected);
    step((generator = generator.apply(__this, __arguments)).next());
  });
};

// lib/msw-config.ts
var msw_config_exports = {};
__export(msw_config_exports, {
  default: () => MswConfig
});
module.exports = __toCommonJS(msw_config_exports);
var import_msw = require("msw");

// lib/passthrough-registry.ts
var import_route_recognizer = __toESM(require("route-recognizer"), 1);
var noOpHandler = () => {
};
var allVerbs = ["GET", "PUT", "POST", "DELETE", "PATCH", "HEAD", "OPTIONS"];
var createPassthroughRegistry = (path, verbs) => {
  const registry = /* @__PURE__ */ new Map();
  const uppercaseUserVerbs = verbs.map((v) => v.toUpperCase());
  const matchingVerbs = allVerbs.filter((v) => {
    if (!verbs || !Array.isArray(verbs) || verbs.length === 0)
      return true;
    return uppercaseUserVerbs.includes(v);
  });
  matchingVerbs.forEach((mv) => {
    const recognizer = new import_route_recognizer.default();
    recognizer.add([{ path, handler: noOpHandler }]);
    registry.set(mv, recognizer);
  });
  return registry;
};
var PassthroughRegistry = class {
  constructor() {
    this.registries = /* @__PURE__ */ new Map();
    return this;
  }
  /**
   * Hosts#forURL - retrieve a map of HTTP verbs to RouteRecognizers
   *                for a given URL
   *
   * @param  {String} url a URL
   * @param  {String[]} verbs a list of HTTP verbs to passthrough.  Defaults to all verbs if not specified.
   * @return {Registry}   a map of HTTP verbs to RouteRecognizers
   *                      corresponding to the provided URL's
   *                      hostname and port
   */
  add(url, verbs) {
    const { host, pathname } = new URL(url);
    const registry = this.registries.get(host);
    if (registry === void 0) {
      this.registries.set(host, createPassthroughRegistry(pathname, verbs));
    } else {
      const verbsToSet = Array.isArray(verbs) && verbs.length ? verbs.map((v) => v.toUpperCase()) : allVerbs;
      verbsToSet.forEach((v) => {
        const existingRecognizer = registry.get(v);
        if (existingRecognizer) {
          existingRecognizer.add([{ path: pathname, handler: noOpHandler }]);
        } else {
          const recognizer = new import_route_recognizer.default();
          recognizer.add([{ path: pathname, handler: noOpHandler }]);
          registry.set(v, recognizer);
        }
      });
    }
  }
  retrieve(url) {
    return this.registries.get(url);
  }
};

// lib/msw-config.ts
var defaultRouteOptions = {
  coalesce: false,
  timing: void 0
};
function isOption(option) {
  if (!option || typeof option !== "object") {
    return false;
  }
  let allOptions = Object.keys(defaultRouteOptions);
  let optionKeys = Object.keys(option);
  for (let i = 0; i < optionKeys.length; i++) {
    let key = optionKeys[i];
    if (allOptions.indexOf(key) > -1) {
      return true;
    }
  }
  return false;
}
function extractRouteArguments(args) {
  let result = [void 0, void 0, {}];
  for (const arg of args) {
    if (isOption(arg)) {
      result[2] = __spreadValues(__spreadValues({}, defaultRouteOptions), arg);
    } else if (typeof arg === "number") {
      result[1] = arg;
    } else {
      result[0] = arg;
    }
  }
  return result;
}
var MswConfig = class {
  constructor() {
    this.handlers = [];
    this.passthroughChecks = [];
    this.passthroughs = new PassthroughRegistry();
  }
  create(server, mirageConfig) {
    this.mirageServer = server;
    this.mirageConfig = mirageConfig;
    this.config(mirageConfig);
    const verbs = [
      ["get"],
      ["post"],
      ["put"],
      ["delete", "del"],
      ["patch"],
      ["head"],
      ["options"]
    ];
    verbs.forEach(([verb, alias]) => {
      this[verb] = (path, ...args) => {
        let [rawHandler, customizedCode, options] = extractRouteArguments(args);
        if (!this.mirageServer) {
          throw new Error("Lost the mirageServer");
        }
        let handler = this.mirageServer.registerRouteHandler(
          verb,
          path,
          rawHandler,
          customizedCode,
          options
        );
        let fullPath = this._getFullPath(path);
        let mswHandler = import_msw.rest[verb](fullPath, (req, res, ctx) => __async(this, null, function* () {
          let queryParams = {};
          req.url.searchParams.forEach((value, key) => {
            let newValue = value;
            if (key.includes("[]")) {
              key = key.replace("[]", "");
              newValue = [...queryParams[key] || [], value];
            }
            queryParams[key] = newValue;
          });
          let request = Object.assign(req, {
            requestBody: typeof req.body === "string" ? req.body : JSON.stringify(req.body),
            queryParams
          });
          let [code, headers, response] = yield handler(request);
          if (code === 204) {
            response = void 0;
          }
          return res(ctx.status(code), ctx.delay(this.timing), (res2) => {
            res2.body = response;
            Object.entries(headers || {}).forEach(([key, value]) => {
              res2.headers.set(key, value);
            });
            return res2;
          });
        }));
        if (this.msw) {
          this.msw.use(mswHandler);
        } else {
          this.handlers.push(mswHandler);
        }
      };
      server[verb] = this[verb];
      if (alias) {
        this[alias] = this[verb];
        server[alias] = this[verb];
      }
    });
  }
  // TODO: infer models and factories
  config(mirageConfig) {
    this.urlPrefix = this.urlPrefix || mirageConfig.urlPrefix || "";
    this.namespace = this.namespace || mirageConfig.namespace || "";
  }
  /**
   * Builds a full path for Pretender to monitor based on the `path` and
   * configured options (`urlPrefix` and `namespace`).
   *
   * @private
   * @hide
   */
  _getFullPath(path) {
    path = path[0] === "/" ? path.slice(1) : path;
    let fullPath = "";
    let urlPrefix = this.urlPrefix ? this.urlPrefix.trim() : "";
    let namespace = "";
    if (this.urlPrefix && this.namespace) {
      if (this.namespace[0] === "/" && this.namespace[this.namespace.length - 1] === "/") {
        namespace = this.namespace.substring(0, this.namespace.length - 1).substring(1);
      }
      if (this.namespace[0] === "/" && this.namespace[this.namespace.length - 1] !== "/") {
        namespace = this.namespace.substring(1);
      }
      if (this.namespace[0] !== "/" && this.namespace[this.namespace.length - 1] === "/") {
        namespace = this.namespace.substring(0, this.namespace.length - 1);
      }
      if (this.namespace[0] !== "/" && this.namespace[this.namespace.length - 1] !== "/") {
        namespace = this.namespace;
      }
    }
    if (this.namespace && !this.urlPrefix) {
      if (this.namespace[0] === "/" && this.namespace[this.namespace.length - 1] === "/") {
        namespace = this.namespace.substring(0, this.namespace.length - 1);
      }
      if (this.namespace[0] === "/" && this.namespace[this.namespace.length - 1] !== "/") {
        namespace = this.namespace;
      }
      if (this.namespace[0] !== "/" && this.namespace[this.namespace.length - 1] === "/") {
        let namespaceSub = this.namespace.substring(
          0,
          this.namespace.length - 1
        );
        namespace = `/${namespaceSub}`;
      }
      if (this.namespace[0] !== "/" && this.namespace[this.namespace.length - 1] !== "/") {
        namespace = `/${this.namespace}`;
      }
    }
    if (!this.namespace) {
      namespace = "";
    }
    if (/^https?:\/\//.test(path)) {
      fullPath += path;
    } else {
      if (urlPrefix.length) {
        fullPath += urlPrefix[urlPrefix.length - 1] === "/" ? urlPrefix : `${urlPrefix}/`;
      }
      fullPath += namespace;
      if (fullPath[fullPath.length - 1] !== "/") {
        fullPath += "/";
      }
      fullPath += path;
      if (!/^https?:\/\//.test(fullPath)) {
        fullPath = `/${fullPath}`;
        fullPath = fullPath.replace(/\/+/g, "/");
      }
    }
    return fullPath;
  }
  passthrough(...args) {
    let verbs = [
      "get",
      "post",
      "put",
      "delete",
      "patch",
      "options",
      "head"
    ];
    let lastArg = args[args.length - 1];
    let paths = [];
    if (args.length === 0) {
      paths = ["/**", "/"];
    } else if (Array.isArray(lastArg)) {
      verbs = lastArg;
    }
    for (const arg of args) {
      if (typeof arg === "string") {
        paths.push(arg);
      }
    }
    paths.forEach((path) => {
      if (typeof path === "function") {
        this.passthroughChecks.push(path);
      } else {
        let fullPath = this._getFullPath(path);
        this.passthroughs.add(fullPath, verbs);
      }
    });
  }
  start() {
    var _a;
    this.msw = (0, import_msw.setupWorker)(...this.handlers);
    let logging = ((_a = this.mirageConfig) == null ? void 0 : _a.logging) || false;
    this.msw._startPromise = this.msw.start({
      quiet: !logging,
      onUnhandledRequest: (req) => {
        var _a2, _b, _c, _d;
        const verb = req.method.toUpperCase();
        const path = req.url.pathname;
        let shouldPassthrough = this.passthroughChecks.some(
          (passthroughCheck) => passthroughCheck(req)
        );
        const recognized = (_b = (_a2 = this.passthroughs.retrieve(req.url.host)) == null ? void 0 : _a2.get(verb)) == null ? void 0 : _b.recognize(path);
        const match = recognized == null ? void 0 : recognized[0];
        if (shouldPassthrough || match) {
          if ((_c = this.mirageServer) == null ? void 0 : _c.shouldLog()) {
            console.log(
              `Mirage: Passthrough request for ${verb} ${req.url.href}`
            );
          }
          req.passthrough();
        } else if (req.url.host !== window.location.host && ((_d = this.mirageServer) == null ? void 0 : _d.shouldLog())) {
          let namespaceError = "";
          if (this.namespace === "") {
            namespaceError = "There is no existing namespace defined.";
          } else {
            namespaceError = `The existing namespace is ${this.namespace}`;
          }
          console.warn(
            `Mirage: Your app tried to ${verb} '${req.url.href}', but there was no route defined to handle this request. Add a passthrough or define a route for this endpoint in your routes() config.
Did you forget to define a namespace? ${namespaceError}`
          );
        }
      }
    });
  }
  shutdown() {
    var _a;
    (_a = this.msw) == null ? void 0 : _a.stop();
  }
};
