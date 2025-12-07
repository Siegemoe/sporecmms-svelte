var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __esm = (fn, res) => function __init() {
  return fn && (res = (0, fn[__getOwnPropNames(fn)[0]])(fn = 0)), res;
};
var __commonJS = (cb, mod) => function __require() {
  return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
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

// .svelte-kit/output/server/chunks/ssr.js
function noop() {
}
function run(fn) {
  return fn();
}
function blank_object() {
  return /* @__PURE__ */ Object.create(null);
}
function run_all(fns) {
  fns.forEach(run);
}
function safe_not_equal(a, b2) {
  return a != a ? b2 == b2 : a !== b2 || a && typeof a === "object" || typeof a === "function";
}
function subscribe(store, ...callbacks) {
  if (store == null) {
    for (const callback of callbacks) {
      callback(void 0);
    }
    return noop;
  }
  const unsub = store.subscribe(...callbacks);
  return unsub.unsubscribe ? () => unsub.unsubscribe() : unsub;
}
function custom_event(type, detail, { bubbles = false, cancelable = false } = {}) {
  return new CustomEvent(type, { detail, bubbles, cancelable });
}
function set_current_component(component16) {
  current_component = component16;
}
function get_current_component() {
  if (!current_component)
    throw new Error("Function called outside component initialization");
  return current_component;
}
function onDestroy(fn) {
  get_current_component().$$.on_destroy.push(fn);
}
function createEventDispatcher() {
  const component16 = get_current_component();
  return (type, detail, { cancelable = false } = {}) => {
    const callbacks = component16.$$.callbacks[type];
    if (callbacks) {
      const event = custom_event(
        /** @type {string} */
        type,
        detail,
        { cancelable }
      );
      callbacks.slice().forEach((fn) => {
        fn.call(component16, event);
      });
      return !event.defaultPrevented;
    }
    return true;
  };
}
function setContext(key2, context) {
  get_current_component().$$.context.set(key2, context);
  return context;
}
function getContext(key2) {
  return get_current_component().$$.context.get(key2);
}
function ensure_array_like(array_like_or_iterator) {
  return array_like_or_iterator?.length !== void 0 ? array_like_or_iterator : Array.from(array_like_or_iterator);
}
function escape(value, is_attr = false) {
  const str = String(value);
  const pattern2 = is_attr ? ATTR_REGEX : CONTENT_REGEX;
  pattern2.lastIndex = 0;
  let escaped2 = "";
  let last = 0;
  while (pattern2.test(str)) {
    const i = pattern2.lastIndex - 1;
    const ch = str[i];
    escaped2 += str.substring(last, i) + (ch === "&" ? "&amp;" : ch === '"' ? "&quot;" : "&lt;");
    last = i + 1;
  }
  return escaped2 + str.substring(last);
}
function each(items, fn) {
  items = ensure_array_like(items);
  let str = "";
  for (let i = 0; i < items.length; i += 1) {
    str += fn(items[i], i);
  }
  return str;
}
function validate_component(component16, name) {
  if (!component16 || !component16.$$render) {
    if (name === "svelte:component")
      name += " this={...}";
    throw new Error(
      `<${name}> is not a valid SSR component. You may need to review your build config to ensure that dependencies are compiled, rather than imported as pre-compiled modules. Otherwise you may need to fix a <${name}>.`
    );
  }
  return component16;
}
function create_ssr_component(fn) {
  function $$render(result, props, bindings, slots, context) {
    const parent_component = current_component;
    const $$ = {
      on_destroy,
      context: new Map(context || (parent_component ? parent_component.$$.context : [])),
      // these will be immediately discarded
      on_mount: [],
      before_update: [],
      after_update: [],
      callbacks: blank_object()
    };
    set_current_component({ $$ });
    const html = fn(result, props, bindings, slots);
    set_current_component(parent_component);
    return html;
  }
  return {
    render: (props = {}, { $$slots = {}, context = /* @__PURE__ */ new Map() } = {}) => {
      on_destroy = [];
      const result = { title: "", head: "", css: /* @__PURE__ */ new Set() };
      const html = $$render(result, props, {}, $$slots, context);
      run_all(on_destroy);
      return {
        html,
        css: {
          code: Array.from(result.css).map((css) => css.code).join("\n"),
          map: null
          // TODO
        },
        head: result.title + result.head
      };
    },
    $$render
  };
}
function add_attribute(name, value, boolean) {
  if (value == null || boolean && !value)
    return "";
  const assignment = boolean && value === true ? "" : `="${escape(value, true)}"`;
  return ` ${name}${assignment}`;
}
var current_component, ATTR_REGEX, CONTENT_REGEX, missing_component, on_destroy;
var init_ssr = __esm({
  ".svelte-kit/output/server/chunks/ssr.js"() {
    ATTR_REGEX = /[&"<]/g;
    CONTENT_REGEX = /[&<]/g;
    missing_component = {
      $$render: () => ""
    };
  }
});

// .svelte-kit/output/server/chunks/environment.js
var building;
var init_environment = __esm({
  ".svelte-kit/output/server/chunks/environment.js"() {
    building = false;
  }
});

// .svelte-kit/output/server/chunks/index.js
function error(status, body) {
  if (isNaN(status) || status < 400 || status > 599) {
    throw new Error(`HTTP error status codes must be between 400 and 599 \u2014 ${status} is invalid`);
  }
  return new HttpError(status, body);
}
function redirect(status, location) {
  if (isNaN(status) || status < 300 || status > 308) {
    throw new Error("Invalid status code");
  }
  return new Redirect(status, location.toString());
}
function json(data, init2) {
  const body = JSON.stringify(data);
  const headers = new Headers(init2?.headers);
  if (!headers.has("content-length")) {
    headers.set("content-length", encoder.encode(body).byteLength.toString());
  }
  if (!headers.has("content-type")) {
    headers.set("content-type", "application/json");
  }
  return new Response(body, {
    ...init2,
    headers
  });
}
function text(body, init2) {
  const headers = new Headers(init2?.headers);
  if (!headers.has("content-length")) {
    const encoded = encoder.encode(body);
    headers.set("content-length", encoded.byteLength.toString());
    return new Response(encoded, {
      ...init2,
      headers
    });
  }
  return new Response(body, {
    ...init2,
    headers
  });
}
function fail(status, data) {
  return new ActionFailure(status, data);
}
var HttpError, Redirect, NotFound, ActionFailure, encoder;
var init_chunks = __esm({
  ".svelte-kit/output/server/chunks/index.js"() {
    HttpError = class {
      /**
       * @param {number} status
       * @param {{message: string} extends App.Error ? (App.Error | string | undefined) : App.Error} body
       */
      constructor(status, body) {
        this.status = status;
        if (typeof body === "string") {
          this.body = { message: body };
        } else if (body) {
          this.body = body;
        } else {
          this.body = { message: `Error: ${status}` };
        }
      }
      toString() {
        return JSON.stringify(this.body);
      }
    };
    Redirect = class {
      /**
       * @param {300 | 301 | 302 | 303 | 304 | 305 | 306 | 307 | 308} status
       * @param {string} location
       */
      constructor(status, location) {
        this.status = status;
        this.location = location;
      }
    };
    NotFound = class extends Error {
      /**
       * @param {string} pathname
       */
      constructor(pathname) {
        super();
        this.status = 404;
        this.message = `Not found: ${pathname}`;
      }
    };
    ActionFailure = class {
      /**
       * @param {number} status
       * @param {T} [data]
       */
      constructor(status, data) {
        this.status = status;
        this.data = data;
      }
    };
    encoder = new TextEncoder();
  }
});

// (disabled):crypto
var require_crypto = __commonJS({
  "(disabled):crypto"() {
  }
});

// node_modules/bcryptjs/index.js
function randomBytes(len) {
  try {
    return crypto.getRandomValues(new Uint8Array(len));
  } catch {
  }
  try {
    return import_crypto.default.randomBytes(len);
  } catch {
  }
  if (!randomFallback) {
    throw Error(
      "Neither WebCryptoAPI nor a crypto module is available. Use bcrypt.setRandomFallback to set an alternative"
    );
  }
  return randomFallback(len);
}
function setRandomFallback(random) {
  randomFallback = random;
}
function genSaltSync(rounds, seed_length) {
  rounds = rounds || GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof rounds !== "number")
    throw Error(
      "Illegal arguments: " + typeof rounds + ", " + typeof seed_length
    );
  if (rounds < 4)
    rounds = 4;
  else if (rounds > 31)
    rounds = 31;
  var salt = [];
  salt.push("$2b$");
  if (rounds < 10)
    salt.push("0");
  salt.push(rounds.toString());
  salt.push("$");
  salt.push(base64_encode(randomBytes(BCRYPT_SALT_LEN), BCRYPT_SALT_LEN));
  return salt.join("");
}
function genSalt(rounds, seed_length, callback) {
  if (typeof seed_length === "function")
    callback = seed_length, seed_length = void 0;
  if (typeof rounds === "function")
    callback = rounds, rounds = void 0;
  if (typeof rounds === "undefined")
    rounds = GENSALT_DEFAULT_LOG2_ROUNDS;
  else if (typeof rounds !== "number")
    throw Error("illegal arguments: " + typeof rounds);
  function _async(callback2) {
    nextTick(function() {
      try {
        callback2(null, genSaltSync(rounds));
      } catch (err) {
        callback2(err);
      }
    });
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function hashSync(password, salt) {
  if (typeof salt === "undefined")
    salt = GENSALT_DEFAULT_LOG2_ROUNDS;
  if (typeof salt === "number")
    salt = genSaltSync(salt);
  if (typeof password !== "string" || typeof salt !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof salt);
  return _hash(password, salt);
}
function hash(password, salt, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password === "string" && typeof salt === "number")
      genSalt(salt, function(err, salt2) {
        _hash(password, salt2, callback2, progressCallback);
      });
    else if (typeof password === "string" && typeof salt === "string")
      _hash(password, salt, callback2, progressCallback);
    else
      nextTick(
        callback2.bind(
          this,
          Error("Illegal arguments: " + typeof password + ", " + typeof salt)
        )
      );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function safeStringCompare(known, unknown) {
  var diff = known.length ^ unknown.length;
  for (var i = 0; i < known.length; ++i) {
    diff |= known.charCodeAt(i) ^ unknown.charCodeAt(i);
  }
  return diff === 0;
}
function compareSync(password, hash3) {
  if (typeof password !== "string" || typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof password + ", " + typeof hash3);
  if (hash3.length !== 60)
    return false;
  return safeStringCompare(
    hashSync(password, hash3.substring(0, hash3.length - 31)),
    hash3
  );
}
function compare(password, hashValue, callback, progressCallback) {
  function _async(callback2) {
    if (typeof password !== "string" || typeof hashValue !== "string") {
      nextTick(
        callback2.bind(
          this,
          Error(
            "Illegal arguments: " + typeof password + ", " + typeof hashValue
          )
        )
      );
      return;
    }
    if (hashValue.length !== 60) {
      nextTick(callback2.bind(this, null, false));
      return;
    }
    hash(
      password,
      hashValue.substring(0, 29),
      function(err, comp) {
        if (err)
          callback2(err);
        else
          callback2(null, safeStringCompare(comp, hashValue));
      },
      progressCallback
    );
  }
  if (callback) {
    if (typeof callback !== "function")
      throw Error("Illegal callback: " + typeof callback);
    _async(callback);
  } else
    return new Promise(function(resolve2, reject) {
      _async(function(err, res) {
        if (err) {
          reject(err);
          return;
        }
        resolve2(res);
      });
    });
}
function getRounds(hash3) {
  if (typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof hash3);
  return parseInt(hash3.split("$")[2], 10);
}
function getSalt(hash3) {
  if (typeof hash3 !== "string")
    throw Error("Illegal arguments: " + typeof hash3);
  if (hash3.length !== 60)
    throw Error("Illegal hash length: " + hash3.length + " != 60");
  return hash3.substring(0, 29);
}
function truncates(password) {
  if (typeof password !== "string")
    throw Error("Illegal arguments: " + typeof password);
  return utf8Length(password) > 72;
}
function utf8Length(string) {
  var len = 0, c2 = 0;
  for (var i = 0; i < string.length; ++i) {
    c2 = string.charCodeAt(i);
    if (c2 < 128)
      len += 1;
    else if (c2 < 2048)
      len += 2;
    else if ((c2 & 64512) === 55296 && (string.charCodeAt(i + 1) & 64512) === 56320) {
      ++i;
      len += 4;
    } else
      len += 3;
  }
  return len;
}
function utf8Array(string) {
  var offset = 0, c1, c2;
  var buffer = new Array(utf8Length(string));
  for (var i = 0, k2 = string.length; i < k2; ++i) {
    c1 = string.charCodeAt(i);
    if (c1 < 128) {
      buffer[offset++] = c1;
    } else if (c1 < 2048) {
      buffer[offset++] = c1 >> 6 | 192;
      buffer[offset++] = c1 & 63 | 128;
    } else if ((c1 & 64512) === 55296 && ((c2 = string.charCodeAt(i + 1)) & 64512) === 56320) {
      c1 = 65536 + ((c1 & 1023) << 10) + (c2 & 1023);
      ++i;
      buffer[offset++] = c1 >> 18 | 240;
      buffer[offset++] = c1 >> 12 & 63 | 128;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    } else {
      buffer[offset++] = c1 >> 12 | 224;
      buffer[offset++] = c1 >> 6 & 63 | 128;
      buffer[offset++] = c1 & 63 | 128;
    }
  }
  return buffer;
}
function base64_encode(b2, len) {
  var off = 0, rs = [], c1, c2;
  if (len <= 0 || len > b2.length)
    throw Error("Illegal len: " + len);
  while (off < len) {
    c1 = b2[off++] & 255;
    rs.push(BASE64_CODE[c1 >> 2 & 63]);
    c1 = (c1 & 3) << 4;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b2[off++] & 255;
    c1 |= c2 >> 4 & 15;
    rs.push(BASE64_CODE[c1 & 63]);
    c1 = (c2 & 15) << 2;
    if (off >= len) {
      rs.push(BASE64_CODE[c1 & 63]);
      break;
    }
    c2 = b2[off++] & 255;
    c1 |= c2 >> 6 & 3;
    rs.push(BASE64_CODE[c1 & 63]);
    rs.push(BASE64_CODE[c2 & 63]);
  }
  return rs.join("");
}
function base64_decode(s3, len) {
  var off = 0, slen = s3.length, olen = 0, rs = [], c1, c2, c3, c4, o2, code;
  if (len <= 0)
    throw Error("Illegal len: " + len);
  while (off < slen - 1 && olen < len) {
    code = s3.charCodeAt(off++);
    c1 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    code = s3.charCodeAt(off++);
    c2 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c1 == -1 || c2 == -1)
      break;
    o2 = c1 << 2 >>> 0;
    o2 |= (c2 & 48) >> 4;
    rs.push(String.fromCharCode(o2));
    if (++olen >= len || off >= slen)
      break;
    code = s3.charCodeAt(off++);
    c3 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    if (c3 == -1)
      break;
    o2 = (c2 & 15) << 4 >>> 0;
    o2 |= (c3 & 60) >> 2;
    rs.push(String.fromCharCode(o2));
    if (++olen >= len || off >= slen)
      break;
    code = s3.charCodeAt(off++);
    c4 = code < BASE64_INDEX.length ? BASE64_INDEX[code] : -1;
    o2 = (c3 & 3) << 6 >>> 0;
    o2 |= c4;
    rs.push(String.fromCharCode(o2));
    ++olen;
  }
  var res = [];
  for (off = 0; off < olen; off++)
    res.push(rs[off].charCodeAt(0));
  return res;
}
function _encipher(lr, off, P2, S2) {
  var n2, l2 = lr[off], r3 = lr[off + 1];
  l2 ^= P2[0];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[1];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[2];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[3];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[4];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[5];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[6];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[7];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[8];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[9];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[10];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[11];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[12];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[13];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[14];
  n2 = S2[l2 >>> 24];
  n2 += S2[256 | l2 >> 16 & 255];
  n2 ^= S2[512 | l2 >> 8 & 255];
  n2 += S2[768 | l2 & 255];
  r3 ^= n2 ^ P2[15];
  n2 = S2[r3 >>> 24];
  n2 += S2[256 | r3 >> 16 & 255];
  n2 ^= S2[512 | r3 >> 8 & 255];
  n2 += S2[768 | r3 & 255];
  l2 ^= n2 ^ P2[16];
  lr[off] = r3 ^ P2[BLOWFISH_NUM_ROUNDS + 1];
  lr[off + 1] = l2;
  return lr;
}
function _streamtoword(data, offp) {
  for (var i = 0, word = 0; i < 4; ++i)
    word = word << 8 | data[offp] & 255, offp = (offp + 1) % data.length;
  return { key: word, offp };
}
function _key(key2, P2, S2) {
  var offset = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key2, offset), offset = sw.offp, P2[i] = P2[i] ^ sw.key;
  for (i = 0; i < plen; i += 2)
    lr = _encipher(lr, 0, P2, S2), P2[i] = lr[0], P2[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    lr = _encipher(lr, 0, P2, S2), S2[i] = lr[0], S2[i + 1] = lr[1];
}
function _ekskey(data, key2, P2, S2) {
  var offp = 0, lr = [0, 0], plen = P2.length, slen = S2.length, sw;
  for (var i = 0; i < plen; i++)
    sw = _streamtoword(key2, offp), offp = sw.offp, P2[i] = P2[i] ^ sw.key;
  offp = 0;
  for (i = 0; i < plen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), P2[i] = lr[0], P2[i + 1] = lr[1];
  for (i = 0; i < slen; i += 2)
    sw = _streamtoword(data, offp), offp = sw.offp, lr[0] ^= sw.key, sw = _streamtoword(data, offp), offp = sw.offp, lr[1] ^= sw.key, lr = _encipher(lr, 0, P2, S2), S2[i] = lr[0], S2[i + 1] = lr[1];
}
function _crypt(b2, salt, rounds, callback, progressCallback) {
  var cdata = C_ORIG.slice(), clen = cdata.length, err;
  if (rounds < 4 || rounds > 31) {
    err = Error("Illegal number of rounds (4-31): " + rounds);
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else
      throw err;
  }
  if (salt.length !== BCRYPT_SALT_LEN) {
    err = Error(
      "Illegal salt length: " + salt.length + " != " + BCRYPT_SALT_LEN
    );
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else
      throw err;
  }
  rounds = 1 << rounds >>> 0;
  var P2, S2, i = 0, j;
  if (typeof Int32Array === "function") {
    P2 = new Int32Array(P_ORIG);
    S2 = new Int32Array(S_ORIG);
  } else {
    P2 = P_ORIG.slice();
    S2 = S_ORIG.slice();
  }
  _ekskey(salt, b2, P2, S2);
  function next() {
    if (progressCallback)
      progressCallback(i / rounds);
    if (i < rounds) {
      var start = Date.now();
      for (; i < rounds; ) {
        i = i + 1;
        _key(b2, P2, S2);
        _key(salt, P2, S2);
        if (Date.now() - start > MAX_EXECUTION_TIME)
          break;
      }
    } else {
      for (i = 0; i < 64; i++)
        for (j = 0; j < clen >> 1; j++)
          _encipher(cdata, j << 1, P2, S2);
      var ret = [];
      for (i = 0; i < clen; i++)
        ret.push((cdata[i] >> 24 & 255) >>> 0), ret.push((cdata[i] >> 16 & 255) >>> 0), ret.push((cdata[i] >> 8 & 255) >>> 0), ret.push((cdata[i] & 255) >>> 0);
      if (callback) {
        callback(null, ret);
        return;
      } else
        return ret;
    }
    if (callback)
      nextTick(next);
  }
  if (typeof callback !== "undefined") {
    next();
  } else {
    var res;
    while (true)
      if (typeof (res = next()) !== "undefined")
        return res || [];
  }
}
function _hash(password, salt, callback, progressCallback) {
  var err;
  if (typeof password !== "string" || typeof salt !== "string") {
    err = Error("Invalid string / salt: Not a string");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else
      throw err;
  }
  var minor, offset;
  if (salt.charAt(0) !== "$" || salt.charAt(1) !== "2") {
    err = Error("Invalid salt version: " + salt.substring(0, 2));
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else
      throw err;
  }
  if (salt.charAt(2) === "$")
    minor = String.fromCharCode(0), offset = 3;
  else {
    minor = salt.charAt(2);
    if (minor !== "a" && minor !== "b" && minor !== "y" || salt.charAt(3) !== "$") {
      err = Error("Invalid salt revision: " + salt.substring(2, 4));
      if (callback) {
        nextTick(callback.bind(this, err));
        return;
      } else
        throw err;
    }
    offset = 4;
  }
  if (salt.charAt(offset + 2) > "$") {
    err = Error("Missing salt rounds");
    if (callback) {
      nextTick(callback.bind(this, err));
      return;
    } else
      throw err;
  }
  var r1 = parseInt(salt.substring(offset, offset + 1), 10) * 10, r22 = parseInt(salt.substring(offset + 1, offset + 2), 10), rounds = r1 + r22, real_salt = salt.substring(offset + 3, offset + 25);
  password += minor >= "a" ? "\0" : "";
  var passwordb = utf8Array(password), saltb = base64_decode(real_salt, BCRYPT_SALT_LEN);
  function finish(bytes) {
    var res = [];
    res.push("$2");
    if (minor >= "a")
      res.push(minor);
    res.push("$");
    if (rounds < 10)
      res.push("0");
    res.push(rounds.toString());
    res.push("$");
    res.push(base64_encode(saltb, saltb.length));
    res.push(base64_encode(bytes, C_ORIG.length * 4 - 1));
    return res.join("");
  }
  if (typeof callback == "undefined")
    return finish(_crypt(passwordb, saltb, rounds));
  else {
    _crypt(
      passwordb,
      saltb,
      rounds,
      function(err2, bytes) {
        if (err2)
          callback(err2, null);
        else
          callback(null, finish(bytes));
      },
      progressCallback
    );
  }
}
function encodeBase64(bytes, length) {
  return base64_encode(bytes, length);
}
function decodeBase64(string, length) {
  return base64_decode(string, length);
}
var import_crypto, randomFallback, nextTick, BASE64_CODE, BASE64_INDEX, BCRYPT_SALT_LEN, GENSALT_DEFAULT_LOG2_ROUNDS, BLOWFISH_NUM_ROUNDS, MAX_EXECUTION_TIME, P_ORIG, S_ORIG, C_ORIG, bcryptjs_default;
var init_bcryptjs = __esm({
  "node_modules/bcryptjs/index.js"() {
    import_crypto = __toESM(require_crypto(), 1);
    randomFallback = null;
    nextTick = typeof setImmediate === "function" ? setImmediate : typeof scheduler === "object" && typeof scheduler.postTask === "function" ? scheduler.postTask.bind(scheduler) : setTimeout;
    BASE64_CODE = "./ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789".split("");
    BASE64_INDEX = [
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      0,
      1,
      54,
      55,
      56,
      57,
      58,
      59,
      60,
      61,
      62,
      63,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      16,
      17,
      18,
      19,
      20,
      21,
      22,
      23,
      24,
      25,
      26,
      27,
      -1,
      -1,
      -1,
      -1,
      -1,
      -1,
      28,
      29,
      30,
      31,
      32,
      33,
      34,
      35,
      36,
      37,
      38,
      39,
      40,
      41,
      42,
      43,
      44,
      45,
      46,
      47,
      48,
      49,
      50,
      51,
      52,
      53,
      -1,
      -1,
      -1,
      -1,
      -1
    ];
    BCRYPT_SALT_LEN = 16;
    GENSALT_DEFAULT_LOG2_ROUNDS = 10;
    BLOWFISH_NUM_ROUNDS = 16;
    MAX_EXECUTION_TIME = 100;
    P_ORIG = [
      608135816,
      2242054355,
      320440878,
      57701188,
      2752067618,
      698298832,
      137296536,
      3964562569,
      1160258022,
      953160567,
      3193202383,
      887688300,
      3232508343,
      3380367581,
      1065670069,
      3041331479,
      2450970073,
      2306472731
    ];
    S_ORIG = [
      3509652390,
      2564797868,
      805139163,
      3491422135,
      3101798381,
      1780907670,
      3128725573,
      4046225305,
      614570311,
      3012652279,
      134345442,
      2240740374,
      1667834072,
      1901547113,
      2757295779,
      4103290238,
      227898511,
      1921955416,
      1904987480,
      2182433518,
      2069144605,
      3260701109,
      2620446009,
      720527379,
      3318853667,
      677414384,
      3393288472,
      3101374703,
      2390351024,
      1614419982,
      1822297739,
      2954791486,
      3608508353,
      3174124327,
      2024746970,
      1432378464,
      3864339955,
      2857741204,
      1464375394,
      1676153920,
      1439316330,
      715854006,
      3033291828,
      289532110,
      2706671279,
      2087905683,
      3018724369,
      1668267050,
      732546397,
      1947742710,
      3462151702,
      2609353502,
      2950085171,
      1814351708,
      2050118529,
      680887927,
      999245976,
      1800124847,
      3300911131,
      1713906067,
      1641548236,
      4213287313,
      1216130144,
      1575780402,
      4018429277,
      3917837745,
      3693486850,
      3949271944,
      596196993,
      3549867205,
      258830323,
      2213823033,
      772490370,
      2760122372,
      1774776394,
      2652871518,
      566650946,
      4142492826,
      1728879713,
      2882767088,
      1783734482,
      3629395816,
      2517608232,
      2874225571,
      1861159788,
      326777828,
      3124490320,
      2130389656,
      2716951837,
      967770486,
      1724537150,
      2185432712,
      2364442137,
      1164943284,
      2105845187,
      998989502,
      3765401048,
      2244026483,
      1075463327,
      1455516326,
      1322494562,
      910128902,
      469688178,
      1117454909,
      936433444,
      3490320968,
      3675253459,
      1240580251,
      122909385,
      2157517691,
      634681816,
      4142456567,
      3825094682,
      3061402683,
      2540495037,
      79693498,
      3249098678,
      1084186820,
      1583128258,
      426386531,
      1761308591,
      1047286709,
      322548459,
      995290223,
      1845252383,
      2603652396,
      3431023940,
      2942221577,
      3202600964,
      3727903485,
      1712269319,
      422464435,
      3234572375,
      1170764815,
      3523960633,
      3117677531,
      1434042557,
      442511882,
      3600875718,
      1076654713,
      1738483198,
      4213154764,
      2393238008,
      3677496056,
      1014306527,
      4251020053,
      793779912,
      2902807211,
      842905082,
      4246964064,
      1395751752,
      1040244610,
      2656851899,
      3396308128,
      445077038,
      3742853595,
      3577915638,
      679411651,
      2892444358,
      2354009459,
      1767581616,
      3150600392,
      3791627101,
      3102740896,
      284835224,
      4246832056,
      1258075500,
      768725851,
      2589189241,
      3069724005,
      3532540348,
      1274779536,
      3789419226,
      2764799539,
      1660621633,
      3471099624,
      4011903706,
      913787905,
      3497959166,
      737222580,
      2514213453,
      2928710040,
      3937242737,
      1804850592,
      3499020752,
      2949064160,
      2386320175,
      2390070455,
      2415321851,
      4061277028,
      2290661394,
      2416832540,
      1336762016,
      1754252060,
      3520065937,
      3014181293,
      791618072,
      3188594551,
      3933548030,
      2332172193,
      3852520463,
      3043980520,
      413987798,
      3465142937,
      3030929376,
      4245938359,
      2093235073,
      3534596313,
      375366246,
      2157278981,
      2479649556,
      555357303,
      3870105701,
      2008414854,
      3344188149,
      4221384143,
      3956125452,
      2067696032,
      3594591187,
      2921233993,
      2428461,
      544322398,
      577241275,
      1471733935,
      610547355,
      4027169054,
      1432588573,
      1507829418,
      2025931657,
      3646575487,
      545086370,
      48609733,
      2200306550,
      1653985193,
      298326376,
      1316178497,
      3007786442,
      2064951626,
      458293330,
      2589141269,
      3591329599,
      3164325604,
      727753846,
      2179363840,
      146436021,
      1461446943,
      4069977195,
      705550613,
      3059967265,
      3887724982,
      4281599278,
      3313849956,
      1404054877,
      2845806497,
      146425753,
      1854211946,
      1266315497,
      3048417604,
      3681880366,
      3289982499,
      290971e4,
      1235738493,
      2632868024,
      2414719590,
      3970600049,
      1771706367,
      1449415276,
      3266420449,
      422970021,
      1963543593,
      2690192192,
      3826793022,
      1062508698,
      1531092325,
      1804592342,
      2583117782,
      2714934279,
      4024971509,
      1294809318,
      4028980673,
      1289560198,
      2221992742,
      1669523910,
      35572830,
      157838143,
      1052438473,
      1016535060,
      1802137761,
      1753167236,
      1386275462,
      3080475397,
      2857371447,
      1040679964,
      2145300060,
      2390574316,
      1461121720,
      2956646967,
      4031777805,
      4028374788,
      33600511,
      2920084762,
      1018524850,
      629373528,
      3691585981,
      3515945977,
      2091462646,
      2486323059,
      586499841,
      988145025,
      935516892,
      3367335476,
      2599673255,
      2839830854,
      265290510,
      3972581182,
      2759138881,
      3795373465,
      1005194799,
      847297441,
      406762289,
      1314163512,
      1332590856,
      1866599683,
      4127851711,
      750260880,
      613907577,
      1450815602,
      3165620655,
      3734664991,
      3650291728,
      3012275730,
      3704569646,
      1427272223,
      778793252,
      1343938022,
      2676280711,
      2052605720,
      1946737175,
      3164576444,
      3914038668,
      3967478842,
      3682934266,
      1661551462,
      3294938066,
      4011595847,
      840292616,
      3712170807,
      616741398,
      312560963,
      711312465,
      1351876610,
      322626781,
      1910503582,
      271666773,
      2175563734,
      1594956187,
      70604529,
      3617834859,
      1007753275,
      1495573769,
      4069517037,
      2549218298,
      2663038764,
      504708206,
      2263041392,
      3941167025,
      2249088522,
      1514023603,
      1998579484,
      1312622330,
      694541497,
      2582060303,
      2151582166,
      1382467621,
      776784248,
      2618340202,
      3323268794,
      2497899128,
      2784771155,
      503983604,
      4076293799,
      907881277,
      423175695,
      432175456,
      1378068232,
      4145222326,
      3954048622,
      3938656102,
      3820766613,
      2793130115,
      2977904593,
      26017576,
      3274890735,
      3194772133,
      1700274565,
      1756076034,
      4006520079,
      3677328699,
      720338349,
      1533947780,
      354530856,
      688349552,
      3973924725,
      1637815568,
      332179504,
      3949051286,
      53804574,
      2852348879,
      3044236432,
      1282449977,
      3583942155,
      3416972820,
      4006381244,
      1617046695,
      2628476075,
      3002303598,
      1686838959,
      431878346,
      2686675385,
      1700445008,
      1080580658,
      1009431731,
      832498133,
      3223435511,
      2605976345,
      2271191193,
      2516031870,
      1648197032,
      4164389018,
      2548247927,
      300782431,
      375919233,
      238389289,
      3353747414,
      2531188641,
      2019080857,
      1475708069,
      455242339,
      2609103871,
      448939670,
      3451063019,
      1395535956,
      2413381860,
      1841049896,
      1491858159,
      885456874,
      4264095073,
      4001119347,
      1565136089,
      3898914787,
      1108368660,
      540939232,
      1173283510,
      2745871338,
      3681308437,
      4207628240,
      3343053890,
      4016749493,
      1699691293,
      1103962373,
      3625875870,
      2256883143,
      3830138730,
      1031889488,
      3479347698,
      1535977030,
      4236805024,
      3251091107,
      2132092099,
      1774941330,
      1199868427,
      1452454533,
      157007616,
      2904115357,
      342012276,
      595725824,
      1480756522,
      206960106,
      497939518,
      591360097,
      863170706,
      2375253569,
      3596610801,
      1814182875,
      2094937945,
      3421402208,
      1082520231,
      3463918190,
      2785509508,
      435703966,
      3908032597,
      1641649973,
      2842273706,
      3305899714,
      1510255612,
      2148256476,
      2655287854,
      3276092548,
      4258621189,
      236887753,
      3681803219,
      274041037,
      1734335097,
      3815195456,
      3317970021,
      1899903192,
      1026095262,
      4050517792,
      356393447,
      2410691914,
      3873677099,
      3682840055,
      3913112168,
      2491498743,
      4132185628,
      2489919796,
      1091903735,
      1979897079,
      3170134830,
      3567386728,
      3557303409,
      857797738,
      1136121015,
      1342202287,
      507115054,
      2535736646,
      337727348,
      3213592640,
      1301675037,
      2528481711,
      1895095763,
      1721773893,
      3216771564,
      62756741,
      2142006736,
      835421444,
      2531993523,
      1442658625,
      3659876326,
      2882144922,
      676362277,
      1392781812,
      170690266,
      3921047035,
      1759253602,
      3611846912,
      1745797284,
      664899054,
      1329594018,
      3901205900,
      3045908486,
      2062866102,
      2865634940,
      3543621612,
      3464012697,
      1080764994,
      553557557,
      3656615353,
      3996768171,
      991055499,
      499776247,
      1265440854,
      648242737,
      3940784050,
      980351604,
      3713745714,
      1749149687,
      3396870395,
      4211799374,
      3640570775,
      1161844396,
      3125318951,
      1431517754,
      545492359,
      4268468663,
      3499529547,
      1437099964,
      2702547544,
      3433638243,
      2581715763,
      2787789398,
      1060185593,
      1593081372,
      2418618748,
      4260947970,
      69676912,
      2159744348,
      86519011,
      2512459080,
      3838209314,
      1220612927,
      3339683548,
      133810670,
      1090789135,
      1078426020,
      1569222167,
      845107691,
      3583754449,
      4072456591,
      1091646820,
      628848692,
      1613405280,
      3757631651,
      526609435,
      236106946,
      48312990,
      2942717905,
      3402727701,
      1797494240,
      859738849,
      992217954,
      4005476642,
      2243076622,
      3870952857,
      3732016268,
      765654824,
      3490871365,
      2511836413,
      1685915746,
      3888969200,
      1414112111,
      2273134842,
      3281911079,
      4080962846,
      172450625,
      2569994100,
      980381355,
      4109958455,
      2819808352,
      2716589560,
      2568741196,
      3681446669,
      3329971472,
      1835478071,
      660984891,
      3704678404,
      4045999559,
      3422617507,
      3040415634,
      1762651403,
      1719377915,
      3470491036,
      2693910283,
      3642056355,
      3138596744,
      1364962596,
      2073328063,
      1983633131,
      926494387,
      3423689081,
      2150032023,
      4096667949,
      1749200295,
      3328846651,
      309677260,
      2016342300,
      1779581495,
      3079819751,
      111262694,
      1274766160,
      443224088,
      298511866,
      1025883608,
      3806446537,
      1145181785,
      168956806,
      3641502830,
      3584813610,
      1689216846,
      3666258015,
      3200248200,
      1692713982,
      2646376535,
      4042768518,
      1618508792,
      1610833997,
      3523052358,
      4130873264,
      2001055236,
      3610705100,
      2202168115,
      4028541809,
      2961195399,
      1006657119,
      2006996926,
      3186142756,
      1430667929,
      3210227297,
      1314452623,
      4074634658,
      4101304120,
      2273951170,
      1399257539,
      3367210612,
      3027628629,
      1190975929,
      2062231137,
      2333990788,
      2221543033,
      2438960610,
      1181637006,
      548689776,
      2362791313,
      3372408396,
      3104550113,
      3145860560,
      296247880,
      1970579870,
      3078560182,
      3769228297,
      1714227617,
      3291629107,
      3898220290,
      166772364,
      1251581989,
      493813264,
      448347421,
      195405023,
      2709975567,
      677966185,
      3703036547,
      1463355134,
      2715995803,
      1338867538,
      1343315457,
      2802222074,
      2684532164,
      233230375,
      2599980071,
      2000651841,
      3277868038,
      1638401717,
      4028070440,
      3237316320,
      6314154,
      819756386,
      300326615,
      590932579,
      1405279636,
      3267499572,
      3150704214,
      2428286686,
      3959192993,
      3461946742,
      1862657033,
      1266418056,
      963775037,
      2089974820,
      2263052895,
      1917689273,
      448879540,
      3550394620,
      3981727096,
      150775221,
      3627908307,
      1303187396,
      508620638,
      2975983352,
      2726630617,
      1817252668,
      1876281319,
      1457606340,
      908771278,
      3720792119,
      3617206836,
      2455994898,
      1729034894,
      1080033504,
      976866871,
      3556439503,
      2881648439,
      1522871579,
      1555064734,
      1336096578,
      3548522304,
      2579274686,
      3574697629,
      3205460757,
      3593280638,
      3338716283,
      3079412587,
      564236357,
      2993598910,
      1781952180,
      1464380207,
      3163844217,
      3332601554,
      1699332808,
      1393555694,
      1183702653,
      3581086237,
      1288719814,
      691649499,
      2847557200,
      2895455976,
      3193889540,
      2717570544,
      1781354906,
      1676643554,
      2592534050,
      3230253752,
      1126444790,
      2770207658,
      2633158820,
      2210423226,
      2615765581,
      2414155088,
      3127139286,
      673620729,
      2805611233,
      1269405062,
      4015350505,
      3341807571,
      4149409754,
      1057255273,
      2012875353,
      2162469141,
      2276492801,
      2601117357,
      993977747,
      3918593370,
      2654263191,
      753973209,
      36408145,
      2530585658,
      25011837,
      3520020182,
      2088578344,
      530523599,
      2918365339,
      1524020338,
      1518925132,
      3760827505,
      3759777254,
      1202760957,
      3985898139,
      3906192525,
      674977740,
      4174734889,
      2031300136,
      2019492241,
      3983892565,
      4153806404,
      3822280332,
      352677332,
      2297720250,
      60907813,
      90501309,
      3286998549,
      1016092578,
      2535922412,
      2839152426,
      457141659,
      509813237,
      4120667899,
      652014361,
      1966332200,
      2975202805,
      55981186,
      2327461051,
      676427537,
      3255491064,
      2882294119,
      3433927263,
      1307055953,
      942726286,
      933058658,
      2468411793,
      3933900994,
      4215176142,
      1361170020,
      2001714738,
      2830558078,
      3274259782,
      1222529897,
      1679025792,
      2729314320,
      3714953764,
      1770335741,
      151462246,
      3013232138,
      1682292957,
      1483529935,
      471910574,
      1539241949,
      458788160,
      3436315007,
      1807016891,
      3718408830,
      978976581,
      1043663428,
      3165965781,
      1927990952,
      4200891579,
      2372276910,
      3208408903,
      3533431907,
      1412390302,
      2931980059,
      4132332400,
      1947078029,
      3881505623,
      4168226417,
      2941484381,
      1077988104,
      1320477388,
      886195818,
      18198404,
      3786409e3,
      2509781533,
      112762804,
      3463356488,
      1866414978,
      891333506,
      18488651,
      661792760,
      1628790961,
      3885187036,
      3141171499,
      876946877,
      2693282273,
      1372485963,
      791857591,
      2686433993,
      3759982718,
      3167212022,
      3472953795,
      2716379847,
      445679433,
      3561995674,
      3504004811,
      3574258232,
      54117162,
      3331405415,
      2381918588,
      3769707343,
      4154350007,
      1140177722,
      4074052095,
      668550556,
      3214352940,
      367459370,
      261225585,
      2610173221,
      4209349473,
      3468074219,
      3265815641,
      314222801,
      3066103646,
      3808782860,
      282218597,
      3406013506,
      3773591054,
      379116347,
      1285071038,
      846784868,
      2669647154,
      3771962079,
      3550491691,
      2305946142,
      453669953,
      1268987020,
      3317592352,
      3279303384,
      3744833421,
      2610507566,
      3859509063,
      266596637,
      3847019092,
      517658769,
      3462560207,
      3443424879,
      370717030,
      4247526661,
      2224018117,
      4143653529,
      4112773975,
      2788324899,
      2477274417,
      1456262402,
      2901442914,
      1517677493,
      1846949527,
      2295493580,
      3734397586,
      2176403920,
      1280348187,
      1908823572,
      3871786941,
      846861322,
      1172426758,
      3287448474,
      3383383037,
      1655181056,
      3139813346,
      901632758,
      1897031941,
      2986607138,
      3066810236,
      3447102507,
      1393639104,
      373351379,
      950779232,
      625454576,
      3124240540,
      4148612726,
      2007998917,
      544563296,
      2244738638,
      2330496472,
      2058025392,
      1291430526,
      424198748,
      50039436,
      29584100,
      3605783033,
      2429876329,
      2791104160,
      1057563949,
      3255363231,
      3075367218,
      3463963227,
      1469046755,
      985887462
    ];
    C_ORIG = [
      1332899944,
      1700884034,
      1701343084,
      1684370003,
      1668446532,
      1869963892
    ];
    bcryptjs_default = {
      setRandomFallback,
      genSaltSync,
      genSalt,
      hashSync,
      hash,
      compareSync,
      compare,
      getRounds,
      getSalt,
      truncates,
      encodeBase64,
      decodeBase64
    };
  }
});

// node_modules/@prisma/client/runtime/index-browser.js
var require_index_browser = __commonJS({
  "node_modules/@prisma/client/runtime/index-browser.js"(exports, module) {
    "use strict";
    var de = Object.defineProperty;
    var We = Object.getOwnPropertyDescriptor;
    var Ge = Object.getOwnPropertyNames;
    var Je = Object.prototype.hasOwnProperty;
    var Me = (e3, n2) => {
      for (var i in n2)
        de(e3, i, { get: n2[i], enumerable: true });
    };
    var Xe = (e3, n2, i, t2) => {
      if (n2 && typeof n2 == "object" || typeof n2 == "function")
        for (let r3 of Ge(n2))
          !Je.call(e3, r3) && r3 !== i && de(e3, r3, { get: () => n2[r3], enumerable: !(t2 = We(n2, r3)) || t2.enumerable });
      return e3;
    };
    var Ke = (e3) => Xe(de({}, "__esModule", { value: true }), e3);
    var Xn = {};
    Me(Xn, { Decimal: () => je, Public: () => he, getRuntime: () => be, makeStrictEnum: () => Pe, objectEnumValues: () => Oe });
    module.exports = Ke(Xn);
    var he = {};
    Me(he, { validator: () => Ce });
    function Ce(...e3) {
      return (n2) => n2;
    }
    var ne = Symbol();
    var pe = /* @__PURE__ */ new WeakMap();
    var ge = class {
      constructor(n2) {
        n2 === ne ? pe.set(this, "Prisma.".concat(this._getName())) : pe.set(this, "new Prisma.".concat(this._getNamespace(), ".").concat(this._getName(), "()"));
      }
      _getName() {
        return this.constructor.name;
      }
      toString() {
        return pe.get(this);
      }
    };
    var G = class extends ge {
      _getNamespace() {
        return "NullTypes";
      }
    };
    var J = class extends G {
    };
    me(J, "DbNull");
    var X = class extends G {
    };
    me(X, "JsonNull");
    var K = class extends G {
    };
    me(K, "AnyNull");
    var Oe = { classes: { DbNull: J, JsonNull: X, AnyNull: K }, instances: { DbNull: new J(ne), JsonNull: new X(ne), AnyNull: new K(ne) } };
    function me(e3, n2) {
      Object.defineProperty(e3, "name", { value: n2, configurable: true });
    }
    var xe = /* @__PURE__ */ new Set(["toJSON", "$$typeof", "asymmetricMatch", Symbol.iterator, Symbol.toStringTag, Symbol.isConcatSpreadable, Symbol.toPrimitive]);
    function Pe(e3) {
      return new Proxy(e3, { get(n2, i) {
        if (i in n2)
          return n2[i];
        if (!xe.has(i))
          throw new TypeError("Invalid enum value: ".concat(String(i)));
      } });
    }
    var Qe = "Cloudflare-Workers";
    var Ye = "node";
    function Re() {
      var e3, n2, i;
      return typeof Netlify == "object" ? "netlify" : typeof EdgeRuntime == "string" ? "edge-light" : ((e3 = globalThis.navigator) == null ? void 0 : e3.userAgent) === Qe ? "workerd" : globalThis.Deno ? "deno" : globalThis.__lagon__ ? "lagon" : ((i = (n2 = globalThis.process) == null ? void 0 : n2.release) == null ? void 0 : i.name) === Ye ? "node" : globalThis.Bun ? "bun" : globalThis.fastly ? "fastly" : "unknown";
    }
    var ze = { node: "Node.js", workerd: "Cloudflare Workers", deno: "Deno and Deno Deploy", netlify: "Netlify Edge Functions", "edge-light": "Edge Runtime (Vercel Edge Functions, Vercel Edge Middleware, Next.js (Pages Router) Edge API Routes, Next.js (App Router) Edge Route Handlers or Next.js Middleware)" };
    function be() {
      let e3 = Re();
      return { id: e3, prettyName: ze[e3] || e3, isEdge: ["workerd", "deno", "netlify", "edge-light"].includes(e3) };
    }
    var H = 9e15;
    var $ = 1e9;
    var we = "0123456789abcdef";
    var te = "2.3025850929940456840179914546843642076011014886287729760333279009675726096773524802359972050895982983419677840422862486334095254650828067566662873690987816894829072083255546808437998948262331985283935053089653777326288461633662222876982198867465436674744042432743651550489343149393914796194044002221051017141748003688084012647080685567743216228355220114804663715659121373450747856947683463616792101806445070648000277502684916746550586856935673420670581136429224554405758925724208241314695689016758940256776311356919292033376587141660230105703089634572075440370847469940168269282808481184289314848524948644871927809676271275775397027668605952496716674183485704422507197965004714951050492214776567636938662976979522110718264549734772662425709429322582798502585509785265383207606726317164309505995087807523710333101197857547331541421808427543863591778117054309827482385045648019095610299291824318237525357709750539565187697510374970888692180205189339507238539205144634197265287286965110862571492198849978748873771345686209167058";
    var re = "3.1415926535897932384626433832795028841971693993751058209749445923078164062862089986280348253421170679821480865132823066470938446095505822317253594081284811174502841027019385211055596446229489549303819644288109756659334461284756482337867831652712019091456485669234603486104543266482133936072602491412737245870066063155881748815209209628292540917153643678925903600113305305488204665213841469519415116094330572703657595919530921861173819326117931051185480744623799627495673518857527248912279381830119491298336733624406566430860213949463952247371907021798609437027705392171762931767523846748184676694051320005681271452635608277857713427577896091736371787214684409012249534301465495853710507922796892589235420199561121290219608640344181598136297747713099605187072113499999983729780499510597317328160963185950244594553469083026425223082533446850352619311881710100031378387528865875332083814206171776691473035982534904287554687311595628638823537875937519577818577805321712268066130019278766111959092164201989380952572010654858632789";
    var Ne = { precision: 20, rounding: 4, modulo: 1, toExpNeg: -7, toExpPos: 21, minE: -H, maxE: H, crypto: false };
    var Te;
    var Z;
    var w2 = true;
    var oe = "[DecimalError] ";
    var V = oe + "Invalid argument: ";
    var Le = oe + "Precision limit exceeded";
    var De = oe + "crypto unavailable";
    var Fe = "[object Decimal]";
    var b2 = Math.floor;
    var C = Math.pow;
    var ye = /^0b([01]+(\.[01]*)?|\.[01]+)(p[+-]?\d+)?$/i;
    var en = /^0x([0-9a-f]+(\.[0-9a-f]*)?|\.[0-9a-f]+)(p[+-]?\d+)?$/i;
    var nn = /^0o([0-7]+(\.[0-7]*)?|\.[0-7]+)(p[+-]?\d+)?$/i;
    var Ie = /^(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
    var D = 1e7;
    var m = 7;
    var tn = 9007199254740991;
    var rn = te.length - 1;
    var ve = re.length - 1;
    var h = { toStringTag: Fe };
    h.absoluteValue = h.abs = function() {
      var e3 = new this.constructor(this);
      return e3.s < 0 && (e3.s = 1), p2(e3);
    };
    h.ceil = function() {
      return p2(new this.constructor(this), this.e + 1, 2);
    };
    h.clampedTo = h.clamp = function(e3, n2) {
      var i, t2 = this, r3 = t2.constructor;
      if (e3 = new r3(e3), n2 = new r3(n2), !e3.s || !n2.s)
        return new r3(NaN);
      if (e3.gt(n2))
        throw Error(V + n2);
      return i = t2.cmp(e3), i < 0 ? e3 : t2.cmp(n2) > 0 ? n2 : new r3(t2);
    };
    h.comparedTo = h.cmp = function(e3) {
      var n2, i, t2, r3, s3 = this, o2 = s3.d, u = (e3 = new s3.constructor(e3)).d, l2 = s3.s, f2 = e3.s;
      if (!o2 || !u)
        return !l2 || !f2 ? NaN : l2 !== f2 ? l2 : o2 === u ? 0 : !o2 ^ l2 < 0 ? 1 : -1;
      if (!o2[0] || !u[0])
        return o2[0] ? l2 : u[0] ? -f2 : 0;
      if (l2 !== f2)
        return l2;
      if (s3.e !== e3.e)
        return s3.e > e3.e ^ l2 < 0 ? 1 : -1;
      for (t2 = o2.length, r3 = u.length, n2 = 0, i = t2 < r3 ? t2 : r3; n2 < i; ++n2)
        if (o2[n2] !== u[n2])
          return o2[n2] > u[n2] ^ l2 < 0 ? 1 : -1;
      return t2 === r3 ? 0 : t2 > r3 ^ l2 < 0 ? 1 : -1;
    };
    h.cosine = h.cos = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return i.d ? i.d[0] ? (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + Math.max(i.e, i.sd()) + m, t2.rounding = 1, i = sn(t2, $e(t2, i)), t2.precision = e3, t2.rounding = n2, p2(Z == 2 || Z == 3 ? i.neg() : i, e3, n2, true)) : new t2(1) : new t2(NaN);
    };
    h.cubeRoot = h.cbrt = function() {
      var e3, n2, i, t2, r3, s3, o2, u, l2, f2, c2 = this, a = c2.constructor;
      if (!c2.isFinite() || c2.isZero())
        return new a(c2);
      for (w2 = false, s3 = c2.s * C(c2.s * c2, 1 / 3), !s3 || Math.abs(s3) == 1 / 0 ? (i = O(c2.d), e3 = c2.e, (s3 = (e3 - i.length + 1) % 3) && (i += s3 == 1 || s3 == -2 ? "0" : "00"), s3 = C(i, 1 / 3), e3 = b2((e3 + 1) / 3) - (e3 % 3 == (e3 < 0 ? -1 : 2)), s3 == 1 / 0 ? i = "5e" + e3 : (i = s3.toExponential(), i = i.slice(0, i.indexOf("e") + 1) + e3), t2 = new a(i), t2.s = c2.s) : t2 = new a(s3.toString()), o2 = (e3 = a.precision) + 3; ; )
        if (u = t2, l2 = u.times(u).times(u), f2 = l2.plus(c2), t2 = S2(f2.plus(c2).times(u), f2.plus(l2), o2 + 2, 1), O(u.d).slice(0, o2) === (i = O(t2.d)).slice(0, o2))
          if (i = i.slice(o2 - 3, o2 + 1), i == "9999" || !r3 && i == "4999") {
            if (!r3 && (p2(u, e3 + 1, 0), u.times(u).times(u).eq(c2))) {
              t2 = u;
              break;
            }
            o2 += 4, r3 = 1;
          } else {
            (!+i || !+i.slice(1) && i.charAt(0) == "5") && (p2(t2, e3 + 1, 1), n2 = !t2.times(t2).times(t2).eq(c2));
            break;
          }
      return w2 = true, p2(t2, e3, a.rounding, n2);
    };
    h.decimalPlaces = h.dp = function() {
      var e3, n2 = this.d, i = NaN;
      if (n2) {
        if (e3 = n2.length - 1, i = (e3 - b2(this.e / m)) * m, e3 = n2[e3], e3)
          for (; e3 % 10 == 0; e3 /= 10)
            i--;
        i < 0 && (i = 0);
      }
      return i;
    };
    h.dividedBy = h.div = function(e3) {
      return S2(this, new this.constructor(e3));
    };
    h.dividedToIntegerBy = h.divToInt = function(e3) {
      var n2 = this, i = n2.constructor;
      return p2(S2(n2, new i(e3), 0, 1, 1), i.precision, i.rounding);
    };
    h.equals = h.eq = function(e3) {
      return this.cmp(e3) === 0;
    };
    h.floor = function() {
      return p2(new this.constructor(this), this.e + 1, 3);
    };
    h.greaterThan = h.gt = function(e3) {
      return this.cmp(e3) > 0;
    };
    h.greaterThanOrEqualTo = h.gte = function(e3) {
      var n2 = this.cmp(e3);
      return n2 == 1 || n2 === 0;
    };
    h.hyperbolicCosine = h.cosh = function() {
      var e3, n2, i, t2, r3, s3 = this, o2 = s3.constructor, u = new o2(1);
      if (!s3.isFinite())
        return new o2(s3.s ? 1 / 0 : NaN);
      if (s3.isZero())
        return u;
      i = o2.precision, t2 = o2.rounding, o2.precision = i + Math.max(s3.e, s3.sd()) + 4, o2.rounding = 1, r3 = s3.d.length, r3 < 32 ? (e3 = Math.ceil(r3 / 3), n2 = (1 / fe(4, e3)).toString()) : (e3 = 16, n2 = "2.3283064365386962890625e-10"), s3 = j(o2, 1, s3.times(n2), new o2(1), true);
      for (var l2, f2 = e3, c2 = new o2(8); f2--; )
        l2 = s3.times(s3), s3 = u.minus(l2.times(c2.minus(l2.times(c2))));
      return p2(s3, o2.precision = i, o2.rounding = t2, true);
    };
    h.hyperbolicSine = h.sinh = function() {
      var e3, n2, i, t2, r3 = this, s3 = r3.constructor;
      if (!r3.isFinite() || r3.isZero())
        return new s3(r3);
      if (n2 = s3.precision, i = s3.rounding, s3.precision = n2 + Math.max(r3.e, r3.sd()) + 4, s3.rounding = 1, t2 = r3.d.length, t2 < 3)
        r3 = j(s3, 2, r3, r3, true);
      else {
        e3 = 1.4 * Math.sqrt(t2), e3 = e3 > 16 ? 16 : e3 | 0, r3 = r3.times(1 / fe(5, e3)), r3 = j(s3, 2, r3, r3, true);
        for (var o2, u = new s3(5), l2 = new s3(16), f2 = new s3(20); e3--; )
          o2 = r3.times(r3), r3 = r3.times(u.plus(o2.times(l2.times(o2).plus(f2))));
      }
      return s3.precision = n2, s3.rounding = i, p2(r3, n2, i, true);
    };
    h.hyperbolicTangent = h.tanh = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return i.isFinite() ? i.isZero() ? new t2(i) : (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + 7, t2.rounding = 1, S2(i.sinh(), i.cosh(), t2.precision = e3, t2.rounding = n2)) : new t2(i.s);
    };
    h.inverseCosine = h.acos = function() {
      var e3, n2 = this, i = n2.constructor, t2 = n2.abs().cmp(1), r3 = i.precision, s3 = i.rounding;
      return t2 !== -1 ? t2 === 0 ? n2.isNeg() ? L(i, r3, s3) : new i(0) : new i(NaN) : n2.isZero() ? L(i, r3 + 4, s3).times(0.5) : (i.precision = r3 + 6, i.rounding = 1, n2 = n2.asin(), e3 = L(i, r3 + 4, s3).times(0.5), i.precision = r3, i.rounding = s3, e3.minus(n2));
    };
    h.inverseHyperbolicCosine = h.acosh = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return i.lte(1) ? new t2(i.eq(1) ? 0 : NaN) : i.isFinite() ? (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + Math.max(Math.abs(i.e), i.sd()) + 4, t2.rounding = 1, w2 = false, i = i.times(i).minus(1).sqrt().plus(i), w2 = true, t2.precision = e3, t2.rounding = n2, i.ln()) : new t2(i);
    };
    h.inverseHyperbolicSine = h.asinh = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return !i.isFinite() || i.isZero() ? new t2(i) : (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + 2 * Math.max(Math.abs(i.e), i.sd()) + 6, t2.rounding = 1, w2 = false, i = i.times(i).plus(1).sqrt().plus(i), w2 = true, t2.precision = e3, t2.rounding = n2, i.ln());
    };
    h.inverseHyperbolicTangent = h.atanh = function() {
      var e3, n2, i, t2, r3 = this, s3 = r3.constructor;
      return r3.isFinite() ? r3.e >= 0 ? new s3(r3.abs().eq(1) ? r3.s / 0 : r3.isZero() ? r3 : NaN) : (e3 = s3.precision, n2 = s3.rounding, t2 = r3.sd(), Math.max(t2, e3) < 2 * -r3.e - 1 ? p2(new s3(r3), e3, n2, true) : (s3.precision = i = t2 - r3.e, r3 = S2(r3.plus(1), new s3(1).minus(r3), i + e3, 1), s3.precision = e3 + 4, s3.rounding = 1, r3 = r3.ln(), s3.precision = e3, s3.rounding = n2, r3.times(0.5))) : new s3(NaN);
    };
    h.inverseSine = h.asin = function() {
      var e3, n2, i, t2, r3 = this, s3 = r3.constructor;
      return r3.isZero() ? new s3(r3) : (n2 = r3.abs().cmp(1), i = s3.precision, t2 = s3.rounding, n2 !== -1 ? n2 === 0 ? (e3 = L(s3, i + 4, t2).times(0.5), e3.s = r3.s, e3) : new s3(NaN) : (s3.precision = i + 6, s3.rounding = 1, r3 = r3.div(new s3(1).minus(r3.times(r3)).sqrt().plus(1)).atan(), s3.precision = i, s3.rounding = t2, r3.times(2)));
    };
    h.inverseTangent = h.atan = function() {
      var e3, n2, i, t2, r3, s3, o2, u, l2, f2 = this, c2 = f2.constructor, a = c2.precision, d = c2.rounding;
      if (f2.isFinite()) {
        if (f2.isZero())
          return new c2(f2);
        if (f2.abs().eq(1) && a + 4 <= ve)
          return o2 = L(c2, a + 4, d).times(0.25), o2.s = f2.s, o2;
      } else {
        if (!f2.s)
          return new c2(NaN);
        if (a + 4 <= ve)
          return o2 = L(c2, a + 4, d).times(0.5), o2.s = f2.s, o2;
      }
      for (c2.precision = u = a + 10, c2.rounding = 1, i = Math.min(28, u / m + 2 | 0), e3 = i; e3; --e3)
        f2 = f2.div(f2.times(f2).plus(1).sqrt().plus(1));
      for (w2 = false, n2 = Math.ceil(u / m), t2 = 1, l2 = f2.times(f2), o2 = new c2(f2), r3 = f2; e3 !== -1; )
        if (r3 = r3.times(l2), s3 = o2.minus(r3.div(t2 += 2)), r3 = r3.times(l2), o2 = s3.plus(r3.div(t2 += 2)), o2.d[n2] !== void 0)
          for (e3 = n2; o2.d[e3] === s3.d[e3] && e3--; )
            ;
      return i && (o2 = o2.times(2 << i - 1)), w2 = true, p2(o2, c2.precision = a, c2.rounding = d, true);
    };
    h.isFinite = function() {
      return !!this.d;
    };
    h.isInteger = h.isInt = function() {
      return !!this.d && b2(this.e / m) > this.d.length - 2;
    };
    h.isNaN = function() {
      return !this.s;
    };
    h.isNegative = h.isNeg = function() {
      return this.s < 0;
    };
    h.isPositive = h.isPos = function() {
      return this.s > 0;
    };
    h.isZero = function() {
      return !!this.d && this.d[0] === 0;
    };
    h.lessThan = h.lt = function(e3) {
      return this.cmp(e3) < 0;
    };
    h.lessThanOrEqualTo = h.lte = function(e3) {
      return this.cmp(e3) < 1;
    };
    h.logarithm = h.log = function(e3) {
      var n2, i, t2, r3, s3, o2, u, l2, f2 = this, c2 = f2.constructor, a = c2.precision, d = c2.rounding, g = 5;
      if (e3 == null)
        e3 = new c2(10), n2 = true;
      else {
        if (e3 = new c2(e3), i = e3.d, e3.s < 0 || !i || !i[0] || e3.eq(1))
          return new c2(NaN);
        n2 = e3.eq(10);
      }
      if (i = f2.d, f2.s < 0 || !i || !i[0] || f2.eq(1))
        return new c2(i && !i[0] ? -1 / 0 : f2.s != 1 ? NaN : i ? 0 : 1 / 0);
      if (n2)
        if (i.length > 1)
          s3 = true;
        else {
          for (r3 = i[0]; r3 % 10 === 0; )
            r3 /= 10;
          s3 = r3 !== 1;
        }
      if (w2 = false, u = a + g, o2 = B(f2, u), t2 = n2 ? se(c2, u + 10) : B(e3, u), l2 = S2(o2, t2, u, 1), x2(l2.d, r3 = a, d))
        do
          if (u += 10, o2 = B(f2, u), t2 = n2 ? se(c2, u + 10) : B(e3, u), l2 = S2(o2, t2, u, 1), !s3) {
            +O(l2.d).slice(r3 + 1, r3 + 15) + 1 == 1e14 && (l2 = p2(l2, a + 1, 0));
            break;
          }
        while (x2(l2.d, r3 += 10, d));
      return w2 = true, p2(l2, a, d);
    };
    h.minus = h.sub = function(e3) {
      var n2, i, t2, r3, s3, o2, u, l2, f2, c2, a, d, g = this, v = g.constructor;
      if (e3 = new v(e3), !g.d || !e3.d)
        return !g.s || !e3.s ? e3 = new v(NaN) : g.d ? e3.s = -e3.s : e3 = new v(e3.d || g.s !== e3.s ? g : NaN), e3;
      if (g.s != e3.s)
        return e3.s = -e3.s, g.plus(e3);
      if (f2 = g.d, d = e3.d, u = v.precision, l2 = v.rounding, !f2[0] || !d[0]) {
        if (d[0])
          e3.s = -e3.s;
        else if (f2[0])
          e3 = new v(g);
        else
          return new v(l2 === 3 ? -0 : 0);
        return w2 ? p2(e3, u, l2) : e3;
      }
      if (i = b2(e3.e / m), c2 = b2(g.e / m), f2 = f2.slice(), s3 = c2 - i, s3) {
        for (a = s3 < 0, a ? (n2 = f2, s3 = -s3, o2 = d.length) : (n2 = d, i = c2, o2 = f2.length), t2 = Math.max(Math.ceil(u / m), o2) + 2, s3 > t2 && (s3 = t2, n2.length = 1), n2.reverse(), t2 = s3; t2--; )
          n2.push(0);
        n2.reverse();
      } else {
        for (t2 = f2.length, o2 = d.length, a = t2 < o2, a && (o2 = t2), t2 = 0; t2 < o2; t2++)
          if (f2[t2] != d[t2]) {
            a = f2[t2] < d[t2];
            break;
          }
        s3 = 0;
      }
      for (a && (n2 = f2, f2 = d, d = n2, e3.s = -e3.s), o2 = f2.length, t2 = d.length - o2; t2 > 0; --t2)
        f2[o2++] = 0;
      for (t2 = d.length; t2 > s3; ) {
        if (f2[--t2] < d[t2]) {
          for (r3 = t2; r3 && f2[--r3] === 0; )
            f2[r3] = D - 1;
          --f2[r3], f2[t2] += D;
        }
        f2[t2] -= d[t2];
      }
      for (; f2[--o2] === 0; )
        f2.pop();
      for (; f2[0] === 0; f2.shift())
        --i;
      return f2[0] ? (e3.d = f2, e3.e = ue(f2, i), w2 ? p2(e3, u, l2) : e3) : new v(l2 === 3 ? -0 : 0);
    };
    h.modulo = h.mod = function(e3) {
      var n2, i = this, t2 = i.constructor;
      return e3 = new t2(e3), !i.d || !e3.s || e3.d && !e3.d[0] ? new t2(NaN) : !e3.d || i.d && !i.d[0] ? p2(new t2(i), t2.precision, t2.rounding) : (w2 = false, t2.modulo == 9 ? (n2 = S2(i, e3.abs(), 0, 3, 1), n2.s *= e3.s) : n2 = S2(i, e3, 0, t2.modulo, 1), n2 = n2.times(e3), w2 = true, i.minus(n2));
    };
    h.naturalExponential = h.exp = function() {
      return Ee(this);
    };
    h.naturalLogarithm = h.ln = function() {
      return B(this);
    };
    h.negated = h.neg = function() {
      var e3 = new this.constructor(this);
      return e3.s = -e3.s, p2(e3);
    };
    h.plus = h.add = function(e3) {
      var n2, i, t2, r3, s3, o2, u, l2, f2, c2, a = this, d = a.constructor;
      if (e3 = new d(e3), !a.d || !e3.d)
        return !a.s || !e3.s ? e3 = new d(NaN) : a.d || (e3 = new d(e3.d || a.s === e3.s ? a : NaN)), e3;
      if (a.s != e3.s)
        return e3.s = -e3.s, a.minus(e3);
      if (f2 = a.d, c2 = e3.d, u = d.precision, l2 = d.rounding, !f2[0] || !c2[0])
        return c2[0] || (e3 = new d(a)), w2 ? p2(e3, u, l2) : e3;
      if (s3 = b2(a.e / m), t2 = b2(e3.e / m), f2 = f2.slice(), r3 = s3 - t2, r3) {
        for (r3 < 0 ? (i = f2, r3 = -r3, o2 = c2.length) : (i = c2, t2 = s3, o2 = f2.length), s3 = Math.ceil(u / m), o2 = s3 > o2 ? s3 + 1 : o2 + 1, r3 > o2 && (r3 = o2, i.length = 1), i.reverse(); r3--; )
          i.push(0);
        i.reverse();
      }
      for (o2 = f2.length, r3 = c2.length, o2 - r3 < 0 && (r3 = o2, i = c2, c2 = f2, f2 = i), n2 = 0; r3; )
        n2 = (f2[--r3] = f2[r3] + c2[r3] + n2) / D | 0, f2[r3] %= D;
      for (n2 && (f2.unshift(n2), ++t2), o2 = f2.length; f2[--o2] == 0; )
        f2.pop();
      return e3.d = f2, e3.e = ue(f2, t2), w2 ? p2(e3, u, l2) : e3;
    };
    h.precision = h.sd = function(e3) {
      var n2, i = this;
      if (e3 !== void 0 && e3 !== !!e3 && e3 !== 1 && e3 !== 0)
        throw Error(V + e3);
      return i.d ? (n2 = Ze(i.d), e3 && i.e + 1 > n2 && (n2 = i.e + 1)) : n2 = NaN, n2;
    };
    h.round = function() {
      var e3 = this, n2 = e3.constructor;
      return p2(new n2(e3), e3.e + 1, n2.rounding);
    };
    h.sine = h.sin = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return i.isFinite() ? i.isZero() ? new t2(i) : (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + Math.max(i.e, i.sd()) + m, t2.rounding = 1, i = un(t2, $e(t2, i)), t2.precision = e3, t2.rounding = n2, p2(Z > 2 ? i.neg() : i, e3, n2, true)) : new t2(NaN);
    };
    h.squareRoot = h.sqrt = function() {
      var e3, n2, i, t2, r3, s3, o2 = this, u = o2.d, l2 = o2.e, f2 = o2.s, c2 = o2.constructor;
      if (f2 !== 1 || !u || !u[0])
        return new c2(!f2 || f2 < 0 && (!u || u[0]) ? NaN : u ? o2 : 1 / 0);
      for (w2 = false, f2 = Math.sqrt(+o2), f2 == 0 || f2 == 1 / 0 ? (n2 = O(u), (n2.length + l2) % 2 == 0 && (n2 += "0"), f2 = Math.sqrt(n2), l2 = b2((l2 + 1) / 2) - (l2 < 0 || l2 % 2), f2 == 1 / 0 ? n2 = "5e" + l2 : (n2 = f2.toExponential(), n2 = n2.slice(0, n2.indexOf("e") + 1) + l2), t2 = new c2(n2)) : t2 = new c2(f2.toString()), i = (l2 = c2.precision) + 3; ; )
        if (s3 = t2, t2 = s3.plus(S2(o2, s3, i + 2, 1)).times(0.5), O(s3.d).slice(0, i) === (n2 = O(t2.d)).slice(0, i))
          if (n2 = n2.slice(i - 3, i + 1), n2 == "9999" || !r3 && n2 == "4999") {
            if (!r3 && (p2(s3, l2 + 1, 0), s3.times(s3).eq(o2))) {
              t2 = s3;
              break;
            }
            i += 4, r3 = 1;
          } else {
            (!+n2 || !+n2.slice(1) && n2.charAt(0) == "5") && (p2(t2, l2 + 1, 1), e3 = !t2.times(t2).eq(o2));
            break;
          }
      return w2 = true, p2(t2, l2, c2.rounding, e3);
    };
    h.tangent = h.tan = function() {
      var e3, n2, i = this, t2 = i.constructor;
      return i.isFinite() ? i.isZero() ? new t2(i) : (e3 = t2.precision, n2 = t2.rounding, t2.precision = e3 + 10, t2.rounding = 1, i = i.sin(), i.s = 1, i = S2(i, new t2(1).minus(i.times(i)).sqrt(), e3 + 10, 0), t2.precision = e3, t2.rounding = n2, p2(Z == 2 || Z == 4 ? i.neg() : i, e3, n2, true)) : new t2(NaN);
    };
    h.times = h.mul = function(e3) {
      var n2, i, t2, r3, s3, o2, u, l2, f2, c2 = this, a = c2.constructor, d = c2.d, g = (e3 = new a(e3)).d;
      if (e3.s *= c2.s, !d || !d[0] || !g || !g[0])
        return new a(!e3.s || d && !d[0] && !g || g && !g[0] && !d ? NaN : !d || !g ? e3.s / 0 : e3.s * 0);
      for (i = b2(c2.e / m) + b2(e3.e / m), l2 = d.length, f2 = g.length, l2 < f2 && (s3 = d, d = g, g = s3, o2 = l2, l2 = f2, f2 = o2), s3 = [], o2 = l2 + f2, t2 = o2; t2--; )
        s3.push(0);
      for (t2 = f2; --t2 >= 0; ) {
        for (n2 = 0, r3 = l2 + t2; r3 > t2; )
          u = s3[r3] + g[t2] * d[r3 - t2 - 1] + n2, s3[r3--] = u % D | 0, n2 = u / D | 0;
        s3[r3] = (s3[r3] + n2) % D | 0;
      }
      for (; !s3[--o2]; )
        s3.pop();
      return n2 ? ++i : s3.shift(), e3.d = s3, e3.e = ue(s3, i), w2 ? p2(e3, a.precision, a.rounding) : e3;
    };
    h.toBinary = function(e3, n2) {
      return ke(this, 2, e3, n2);
    };
    h.toDecimalPlaces = h.toDP = function(e3, n2) {
      var i = this, t2 = i.constructor;
      return i = new t2(i), e3 === void 0 ? i : (_(e3, 0, $), n2 === void 0 ? n2 = t2.rounding : _(n2, 0, 8), p2(i, e3 + i.e + 1, n2));
    };
    h.toExponential = function(e3, n2) {
      var i, t2 = this, r3 = t2.constructor;
      return e3 === void 0 ? i = F2(t2, true) : (_(e3, 0, $), n2 === void 0 ? n2 = r3.rounding : _(n2, 0, 8), t2 = p2(new r3(t2), e3 + 1, n2), i = F2(t2, true, e3 + 1)), t2.isNeg() && !t2.isZero() ? "-" + i : i;
    };
    h.toFixed = function(e3, n2) {
      var i, t2, r3 = this, s3 = r3.constructor;
      return e3 === void 0 ? i = F2(r3) : (_(e3, 0, $), n2 === void 0 ? n2 = s3.rounding : _(n2, 0, 8), t2 = p2(new s3(r3), e3 + r3.e + 1, n2), i = F2(t2, false, e3 + t2.e + 1)), r3.isNeg() && !r3.isZero() ? "-" + i : i;
    };
    h.toFraction = function(e3) {
      var n2, i, t2, r3, s3, o2, u, l2, f2, c2, a, d, g = this, v = g.d, N = g.constructor;
      if (!v)
        return new N(g);
      if (f2 = i = new N(1), t2 = l2 = new N(0), n2 = new N(t2), s3 = n2.e = Ze(v) - g.e - 1, o2 = s3 % m, n2.d[0] = C(10, o2 < 0 ? m + o2 : o2), e3 == null)
        e3 = s3 > 0 ? n2 : f2;
      else {
        if (u = new N(e3), !u.isInt() || u.lt(f2))
          throw Error(V + u);
        e3 = u.gt(n2) ? s3 > 0 ? n2 : f2 : u;
      }
      for (w2 = false, u = new N(O(v)), c2 = N.precision, N.precision = s3 = v.length * m * 2; a = S2(u, n2, 0, 1, 1), r3 = i.plus(a.times(t2)), r3.cmp(e3) != 1; )
        i = t2, t2 = r3, r3 = f2, f2 = l2.plus(a.times(r3)), l2 = r3, r3 = n2, n2 = u.minus(a.times(r3)), u = r3;
      return r3 = S2(e3.minus(i), t2, 0, 1, 1), l2 = l2.plus(r3.times(f2)), i = i.plus(r3.times(t2)), l2.s = f2.s = g.s, d = S2(f2, t2, s3, 1).minus(g).abs().cmp(S2(l2, i, s3, 1).minus(g).abs()) < 1 ? [f2, t2] : [l2, i], N.precision = c2, w2 = true, d;
    };
    h.toHexadecimal = h.toHex = function(e3, n2) {
      return ke(this, 16, e3, n2);
    };
    h.toNearest = function(e3, n2) {
      var i = this, t2 = i.constructor;
      if (i = new t2(i), e3 == null) {
        if (!i.d)
          return i;
        e3 = new t2(1), n2 = t2.rounding;
      } else {
        if (e3 = new t2(e3), n2 === void 0 ? n2 = t2.rounding : _(n2, 0, 8), !i.d)
          return e3.s ? i : e3;
        if (!e3.d)
          return e3.s && (e3.s = i.s), e3;
      }
      return e3.d[0] ? (w2 = false, i = S2(i, e3, 0, n2, 1).times(e3), w2 = true, p2(i)) : (e3.s = i.s, i = e3), i;
    };
    h.toNumber = function() {
      return +this;
    };
    h.toOctal = function(e3, n2) {
      return ke(this, 8, e3, n2);
    };
    h.toPower = h.pow = function(e3) {
      var n2, i, t2, r3, s3, o2, u = this, l2 = u.constructor, f2 = +(e3 = new l2(e3));
      if (!u.d || !e3.d || !u.d[0] || !e3.d[0])
        return new l2(C(+u, f2));
      if (u = new l2(u), u.eq(1))
        return u;
      if (t2 = l2.precision, s3 = l2.rounding, e3.eq(1))
        return p2(u, t2, s3);
      if (n2 = b2(e3.e / m), n2 >= e3.d.length - 1 && (i = f2 < 0 ? -f2 : f2) <= tn)
        return r3 = Ue(l2, u, i, t2), e3.s < 0 ? new l2(1).div(r3) : p2(r3, t2, s3);
      if (o2 = u.s, o2 < 0) {
        if (n2 < e3.d.length - 1)
          return new l2(NaN);
        if (e3.d[n2] & 1 || (o2 = 1), u.e == 0 && u.d[0] == 1 && u.d.length == 1)
          return u.s = o2, u;
      }
      return i = C(+u, f2), n2 = i == 0 || !isFinite(i) ? b2(f2 * (Math.log("0." + O(u.d)) / Math.LN10 + u.e + 1)) : new l2(i + "").e, n2 > l2.maxE + 1 || n2 < l2.minE - 1 ? new l2(n2 > 0 ? o2 / 0 : 0) : (w2 = false, l2.rounding = u.s = 1, i = Math.min(12, (n2 + "").length), r3 = Ee(e3.times(B(u, t2 + i)), t2), r3.d && (r3 = p2(r3, t2 + 5, 1), x2(r3.d, t2, s3) && (n2 = t2 + 10, r3 = p2(Ee(e3.times(B(u, n2 + i)), n2), n2 + 5, 1), +O(r3.d).slice(t2 + 1, t2 + 15) + 1 == 1e14 && (r3 = p2(r3, t2 + 1, 0)))), r3.s = o2, w2 = true, l2.rounding = s3, p2(r3, t2, s3));
    };
    h.toPrecision = function(e3, n2) {
      var i, t2 = this, r3 = t2.constructor;
      return e3 === void 0 ? i = F2(t2, t2.e <= r3.toExpNeg || t2.e >= r3.toExpPos) : (_(e3, 1, $), n2 === void 0 ? n2 = r3.rounding : _(n2, 0, 8), t2 = p2(new r3(t2), e3, n2), i = F2(t2, e3 <= t2.e || t2.e <= r3.toExpNeg, e3)), t2.isNeg() && !t2.isZero() ? "-" + i : i;
    };
    h.toSignificantDigits = h.toSD = function(e3, n2) {
      var i = this, t2 = i.constructor;
      return e3 === void 0 ? (e3 = t2.precision, n2 = t2.rounding) : (_(e3, 1, $), n2 === void 0 ? n2 = t2.rounding : _(n2, 0, 8)), p2(new t2(i), e3, n2);
    };
    h.toString = function() {
      var e3 = this, n2 = e3.constructor, i = F2(e3, e3.e <= n2.toExpNeg || e3.e >= n2.toExpPos);
      return e3.isNeg() && !e3.isZero() ? "-" + i : i;
    };
    h.truncated = h.trunc = function() {
      return p2(new this.constructor(this), this.e + 1, 1);
    };
    h.valueOf = h.toJSON = function() {
      var e3 = this, n2 = e3.constructor, i = F2(e3, e3.e <= n2.toExpNeg || e3.e >= n2.toExpPos);
      return e3.isNeg() ? "-" + i : i;
    };
    function O(e3) {
      var n2, i, t2, r3 = e3.length - 1, s3 = "", o2 = e3[0];
      if (r3 > 0) {
        for (s3 += o2, n2 = 1; n2 < r3; n2++)
          t2 = e3[n2] + "", i = m - t2.length, i && (s3 += U(i)), s3 += t2;
        o2 = e3[n2], t2 = o2 + "", i = m - t2.length, i && (s3 += U(i));
      } else if (o2 === 0)
        return "0";
      for (; o2 % 10 === 0; )
        o2 /= 10;
      return s3 + o2;
    }
    function _(e3, n2, i) {
      if (e3 !== ~~e3 || e3 < n2 || e3 > i)
        throw Error(V + e3);
    }
    function x2(e3, n2, i, t2) {
      var r3, s3, o2, u;
      for (s3 = e3[0]; s3 >= 10; s3 /= 10)
        --n2;
      return --n2 < 0 ? (n2 += m, r3 = 0) : (r3 = Math.ceil((n2 + 1) / m), n2 %= m), s3 = C(10, m - n2), u = e3[r3] % s3 | 0, t2 == null ? n2 < 3 ? (n2 == 0 ? u = u / 100 | 0 : n2 == 1 && (u = u / 10 | 0), o2 = i < 4 && u == 99999 || i > 3 && u == 49999 || u == 5e4 || u == 0) : o2 = (i < 4 && u + 1 == s3 || i > 3 && u + 1 == s3 / 2) && (e3[r3 + 1] / s3 / 100 | 0) == C(10, n2 - 2) - 1 || (u == s3 / 2 || u == 0) && (e3[r3 + 1] / s3 / 100 | 0) == 0 : n2 < 4 ? (n2 == 0 ? u = u / 1e3 | 0 : n2 == 1 ? u = u / 100 | 0 : n2 == 2 && (u = u / 10 | 0), o2 = (t2 || i < 4) && u == 9999 || !t2 && i > 3 && u == 4999) : o2 = ((t2 || i < 4) && u + 1 == s3 || !t2 && i > 3 && u + 1 == s3 / 2) && (e3[r3 + 1] / s3 / 1e3 | 0) == C(10, n2 - 3) - 1, o2;
    }
    function ie(e3, n2, i) {
      for (var t2, r3 = [0], s3, o2 = 0, u = e3.length; o2 < u; ) {
        for (s3 = r3.length; s3--; )
          r3[s3] *= n2;
        for (r3[0] += we.indexOf(e3.charAt(o2++)), t2 = 0; t2 < r3.length; t2++)
          r3[t2] > i - 1 && (r3[t2 + 1] === void 0 && (r3[t2 + 1] = 0), r3[t2 + 1] += r3[t2] / i | 0, r3[t2] %= i);
      }
      return r3.reverse();
    }
    function sn(e3, n2) {
      var i, t2, r3;
      if (n2.isZero())
        return n2;
      t2 = n2.d.length, t2 < 32 ? (i = Math.ceil(t2 / 3), r3 = (1 / fe(4, i)).toString()) : (i = 16, r3 = "2.3283064365386962890625e-10"), e3.precision += i, n2 = j(e3, 1, n2.times(r3), new e3(1));
      for (var s3 = i; s3--; ) {
        var o2 = n2.times(n2);
        n2 = o2.times(o2).minus(o2).times(8).plus(1);
      }
      return e3.precision -= i, n2;
    }
    var S2 = function() {
      function e3(t2, r3, s3) {
        var o2, u = 0, l2 = t2.length;
        for (t2 = t2.slice(); l2--; )
          o2 = t2[l2] * r3 + u, t2[l2] = o2 % s3 | 0, u = o2 / s3 | 0;
        return u && t2.unshift(u), t2;
      }
      function n2(t2, r3, s3, o2) {
        var u, l2;
        if (s3 != o2)
          l2 = s3 > o2 ? 1 : -1;
        else
          for (u = l2 = 0; u < s3; u++)
            if (t2[u] != r3[u]) {
              l2 = t2[u] > r3[u] ? 1 : -1;
              break;
            }
        return l2;
      }
      function i(t2, r3, s3, o2) {
        for (var u = 0; s3--; )
          t2[s3] -= u, u = t2[s3] < r3[s3] ? 1 : 0, t2[s3] = u * o2 + t2[s3] - r3[s3];
        for (; !t2[0] && t2.length > 1; )
          t2.shift();
      }
      return function(t2, r3, s3, o2, u, l2) {
        var f2, c2, a, d, g, v, N, A, M, q, E, P2, Y, I, le, z, W, ce, T2, y, ee = t2.constructor, ae = t2.s == r3.s ? 1 : -1, R = t2.d, k2 = r3.d;
        if (!R || !R[0] || !k2 || !k2[0])
          return new ee(!t2.s || !r3.s || (R ? k2 && R[0] == k2[0] : !k2) ? NaN : R && R[0] == 0 || !k2 ? ae * 0 : ae / 0);
        for (l2 ? (g = 1, c2 = t2.e - r3.e) : (l2 = D, g = m, c2 = b2(t2.e / g) - b2(r3.e / g)), T2 = k2.length, W = R.length, M = new ee(ae), q = M.d = [], a = 0; k2[a] == (R[a] || 0); a++)
          ;
        if (k2[a] > (R[a] || 0) && c2--, s3 == null ? (I = s3 = ee.precision, o2 = ee.rounding) : u ? I = s3 + (t2.e - r3.e) + 1 : I = s3, I < 0)
          q.push(1), v = true;
        else {
          if (I = I / g + 2 | 0, a = 0, T2 == 1) {
            for (d = 0, k2 = k2[0], I++; (a < W || d) && I--; a++)
              le = d * l2 + (R[a] || 0), q[a] = le / k2 | 0, d = le % k2 | 0;
            v = d || a < W;
          } else {
            for (d = l2 / (k2[0] + 1) | 0, d > 1 && (k2 = e3(k2, d, l2), R = e3(R, d, l2), T2 = k2.length, W = R.length), z = T2, E = R.slice(0, T2), P2 = E.length; P2 < T2; )
              E[P2++] = 0;
            y = k2.slice(), y.unshift(0), ce = k2[0], k2[1] >= l2 / 2 && ++ce;
            do
              d = 0, f2 = n2(k2, E, T2, P2), f2 < 0 ? (Y = E[0], T2 != P2 && (Y = Y * l2 + (E[1] || 0)), d = Y / ce | 0, d > 1 ? (d >= l2 && (d = l2 - 1), N = e3(k2, d, l2), A = N.length, P2 = E.length, f2 = n2(N, E, A, P2), f2 == 1 && (d--, i(N, T2 < A ? y : k2, A, l2))) : (d == 0 && (f2 = d = 1), N = k2.slice()), A = N.length, A < P2 && N.unshift(0), i(E, N, P2, l2), f2 == -1 && (P2 = E.length, f2 = n2(k2, E, T2, P2), f2 < 1 && (d++, i(E, T2 < P2 ? y : k2, P2, l2))), P2 = E.length) : f2 === 0 && (d++, E = [0]), q[a++] = d, f2 && E[0] ? E[P2++] = R[z] || 0 : (E = [R[z]], P2 = 1);
            while ((z++ < W || E[0] !== void 0) && I--);
            v = E[0] !== void 0;
          }
          q[0] || q.shift();
        }
        if (g == 1)
          M.e = c2, Te = v;
        else {
          for (a = 1, d = q[0]; d >= 10; d /= 10)
            a++;
          M.e = a + c2 * g - 1, p2(M, u ? s3 + M.e + 1 : s3, o2, v);
        }
        return M;
      };
    }();
    function p2(e3, n2, i, t2) {
      var r3, s3, o2, u, l2, f2, c2, a, d, g = e3.constructor;
      e:
        if (n2 != null) {
          if (a = e3.d, !a)
            return e3;
          for (r3 = 1, u = a[0]; u >= 10; u /= 10)
            r3++;
          if (s3 = n2 - r3, s3 < 0)
            s3 += m, o2 = n2, c2 = a[d = 0], l2 = c2 / C(10, r3 - o2 - 1) % 10 | 0;
          else if (d = Math.ceil((s3 + 1) / m), u = a.length, d >= u)
            if (t2) {
              for (; u++ <= d; )
                a.push(0);
              c2 = l2 = 0, r3 = 1, s3 %= m, o2 = s3 - m + 1;
            } else
              break e;
          else {
            for (c2 = u = a[d], r3 = 1; u >= 10; u /= 10)
              r3++;
            s3 %= m, o2 = s3 - m + r3, l2 = o2 < 0 ? 0 : c2 / C(10, r3 - o2 - 1) % 10 | 0;
          }
          if (t2 = t2 || n2 < 0 || a[d + 1] !== void 0 || (o2 < 0 ? c2 : c2 % C(10, r3 - o2 - 1)), f2 = i < 4 ? (l2 || t2) && (i == 0 || i == (e3.s < 0 ? 3 : 2)) : l2 > 5 || l2 == 5 && (i == 4 || t2 || i == 6 && (s3 > 0 ? o2 > 0 ? c2 / C(10, r3 - o2) : 0 : a[d - 1]) % 10 & 1 || i == (e3.s < 0 ? 8 : 7)), n2 < 1 || !a[0])
            return a.length = 0, f2 ? (n2 -= e3.e + 1, a[0] = C(10, (m - n2 % m) % m), e3.e = -n2 || 0) : a[0] = e3.e = 0, e3;
          if (s3 == 0 ? (a.length = d, u = 1, d--) : (a.length = d + 1, u = C(10, m - s3), a[d] = o2 > 0 ? (c2 / C(10, r3 - o2) % C(10, o2) | 0) * u : 0), f2)
            for (; ; )
              if (d == 0) {
                for (s3 = 1, o2 = a[0]; o2 >= 10; o2 /= 10)
                  s3++;
                for (o2 = a[0] += u, u = 1; o2 >= 10; o2 /= 10)
                  u++;
                s3 != u && (e3.e++, a[0] == D && (a[0] = 1));
                break;
              } else {
                if (a[d] += u, a[d] != D)
                  break;
                a[d--] = 0, u = 1;
              }
          for (s3 = a.length; a[--s3] === 0; )
            a.pop();
        }
      return w2 && (e3.e > g.maxE ? (e3.d = null, e3.e = NaN) : e3.e < g.minE && (e3.e = 0, e3.d = [0])), e3;
    }
    function F2(e3, n2, i) {
      if (!e3.isFinite())
        return Ve(e3);
      var t2, r3 = e3.e, s3 = O(e3.d), o2 = s3.length;
      return n2 ? (i && (t2 = i - o2) > 0 ? s3 = s3.charAt(0) + "." + s3.slice(1) + U(t2) : o2 > 1 && (s3 = s3.charAt(0) + "." + s3.slice(1)), s3 = s3 + (e3.e < 0 ? "e" : "e+") + e3.e) : r3 < 0 ? (s3 = "0." + U(-r3 - 1) + s3, i && (t2 = i - o2) > 0 && (s3 += U(t2))) : r3 >= o2 ? (s3 += U(r3 + 1 - o2), i && (t2 = i - r3 - 1) > 0 && (s3 = s3 + "." + U(t2))) : ((t2 = r3 + 1) < o2 && (s3 = s3.slice(0, t2) + "." + s3.slice(t2)), i && (t2 = i - o2) > 0 && (r3 + 1 === o2 && (s3 += "."), s3 += U(t2))), s3;
    }
    function ue(e3, n2) {
      var i = e3[0];
      for (n2 *= m; i >= 10; i /= 10)
        n2++;
      return n2;
    }
    function se(e3, n2, i) {
      if (n2 > rn)
        throw w2 = true, i && (e3.precision = i), Error(Le);
      return p2(new e3(te), n2, 1, true);
    }
    function L(e3, n2, i) {
      if (n2 > ve)
        throw Error(Le);
      return p2(new e3(re), n2, i, true);
    }
    function Ze(e3) {
      var n2 = e3.length - 1, i = n2 * m + 1;
      if (n2 = e3[n2], n2) {
        for (; n2 % 10 == 0; n2 /= 10)
          i--;
        for (n2 = e3[0]; n2 >= 10; n2 /= 10)
          i++;
      }
      return i;
    }
    function U(e3) {
      for (var n2 = ""; e3--; )
        n2 += "0";
      return n2;
    }
    function Ue(e3, n2, i, t2) {
      var r3, s3 = new e3(1), o2 = Math.ceil(t2 / m + 4);
      for (w2 = false; ; ) {
        if (i % 2 && (s3 = s3.times(n2), _e(s3.d, o2) && (r3 = true)), i = b2(i / 2), i === 0) {
          i = s3.d.length - 1, r3 && s3.d[i] === 0 && ++s3.d[i];
          break;
        }
        n2 = n2.times(n2), _e(n2.d, o2);
      }
      return w2 = true, s3;
    }
    function Ae(e3) {
      return e3.d[e3.d.length - 1] & 1;
    }
    function Be(e3, n2, i) {
      for (var t2, r3 = new e3(n2[0]), s3 = 0; ++s3 < n2.length; )
        if (t2 = new e3(n2[s3]), t2.s)
          r3[i](t2) && (r3 = t2);
        else {
          r3 = t2;
          break;
        }
      return r3;
    }
    function Ee(e3, n2) {
      var i, t2, r3, s3, o2, u, l2, f2 = 0, c2 = 0, a = 0, d = e3.constructor, g = d.rounding, v = d.precision;
      if (!e3.d || !e3.d[0] || e3.e > 17)
        return new d(e3.d ? e3.d[0] ? e3.s < 0 ? 0 : 1 / 0 : 1 : e3.s ? e3.s < 0 ? 0 : e3 : NaN);
      for (n2 == null ? (w2 = false, l2 = v) : l2 = n2, u = new d(0.03125); e3.e > -2; )
        e3 = e3.times(u), a += 5;
      for (t2 = Math.log(C(2, a)) / Math.LN10 * 2 + 5 | 0, l2 += t2, i = s3 = o2 = new d(1), d.precision = l2; ; ) {
        if (s3 = p2(s3.times(e3), l2, 1), i = i.times(++c2), u = o2.plus(S2(s3, i, l2, 1)), O(u.d).slice(0, l2) === O(o2.d).slice(0, l2)) {
          for (r3 = a; r3--; )
            o2 = p2(o2.times(o2), l2, 1);
          if (n2 == null)
            if (f2 < 3 && x2(o2.d, l2 - t2, g, f2))
              d.precision = l2 += 10, i = s3 = u = new d(1), c2 = 0, f2++;
            else
              return p2(o2, d.precision = v, g, w2 = true);
          else
            return d.precision = v, o2;
        }
        o2 = u;
      }
    }
    function B(e3, n2) {
      var i, t2, r3, s3, o2, u, l2, f2, c2, a, d, g = 1, v = 10, N = e3, A = N.d, M = N.constructor, q = M.rounding, E = M.precision;
      if (N.s < 0 || !A || !A[0] || !N.e && A[0] == 1 && A.length == 1)
        return new M(A && !A[0] ? -1 / 0 : N.s != 1 ? NaN : A ? 0 : N);
      if (n2 == null ? (w2 = false, c2 = E) : c2 = n2, M.precision = c2 += v, i = O(A), t2 = i.charAt(0), Math.abs(s3 = N.e) < 15e14) {
        for (; t2 < 7 && t2 != 1 || t2 == 1 && i.charAt(1) > 3; )
          N = N.times(e3), i = O(N.d), t2 = i.charAt(0), g++;
        s3 = N.e, t2 > 1 ? (N = new M("0." + i), s3++) : N = new M(t2 + "." + i.slice(1));
      } else
        return f2 = se(M, c2 + 2, E).times(s3 + ""), N = B(new M(t2 + "." + i.slice(1)), c2 - v).plus(f2), M.precision = E, n2 == null ? p2(N, E, q, w2 = true) : N;
      for (a = N, l2 = o2 = N = S2(N.minus(1), N.plus(1), c2, 1), d = p2(N.times(N), c2, 1), r3 = 3; ; ) {
        if (o2 = p2(o2.times(d), c2, 1), f2 = l2.plus(S2(o2, new M(r3), c2, 1)), O(f2.d).slice(0, c2) === O(l2.d).slice(0, c2))
          if (l2 = l2.times(2), s3 !== 0 && (l2 = l2.plus(se(M, c2 + 2, E).times(s3 + ""))), l2 = S2(l2, new M(g), c2, 1), n2 == null)
            if (x2(l2.d, c2 - v, q, u))
              M.precision = c2 += v, f2 = o2 = N = S2(a.minus(1), a.plus(1), c2, 1), d = p2(N.times(N), c2, 1), r3 = u = 1;
            else
              return p2(l2, M.precision = E, q, w2 = true);
          else
            return M.precision = E, l2;
        l2 = f2, r3 += 2;
      }
    }
    function Ve(e3) {
      return String(e3.s * e3.s / 0);
    }
    function Se(e3, n2) {
      var i, t2, r3;
      for ((i = n2.indexOf(".")) > -1 && (n2 = n2.replace(".", "")), (t2 = n2.search(/e/i)) > 0 ? (i < 0 && (i = t2), i += +n2.slice(t2 + 1), n2 = n2.substring(0, t2)) : i < 0 && (i = n2.length), t2 = 0; n2.charCodeAt(t2) === 48; t2++)
        ;
      for (r3 = n2.length; n2.charCodeAt(r3 - 1) === 48; --r3)
        ;
      if (n2 = n2.slice(t2, r3), n2) {
        if (r3 -= t2, e3.e = i = i - t2 - 1, e3.d = [], t2 = (i + 1) % m, i < 0 && (t2 += m), t2 < r3) {
          for (t2 && e3.d.push(+n2.slice(0, t2)), r3 -= m; t2 < r3; )
            e3.d.push(+n2.slice(t2, t2 += m));
          n2 = n2.slice(t2), t2 = m - n2.length;
        } else
          t2 -= r3;
        for (; t2--; )
          n2 += "0";
        e3.d.push(+n2), w2 && (e3.e > e3.constructor.maxE ? (e3.d = null, e3.e = NaN) : e3.e < e3.constructor.minE && (e3.e = 0, e3.d = [0]));
      } else
        e3.e = 0, e3.d = [0];
      return e3;
    }
    function on(e3, n2) {
      var i, t2, r3, s3, o2, u, l2, f2, c2;
      if (n2.indexOf("_") > -1) {
        if (n2 = n2.replace(/(\d)_(?=\d)/g, "$1"), Ie.test(n2))
          return Se(e3, n2);
      } else if (n2 === "Infinity" || n2 === "NaN")
        return +n2 || (e3.s = NaN), e3.e = NaN, e3.d = null, e3;
      if (en.test(n2))
        i = 16, n2 = n2.toLowerCase();
      else if (ye.test(n2))
        i = 2;
      else if (nn.test(n2))
        i = 8;
      else
        throw Error(V + n2);
      for (s3 = n2.search(/p/i), s3 > 0 ? (l2 = +n2.slice(s3 + 1), n2 = n2.substring(2, s3)) : n2 = n2.slice(2), s3 = n2.indexOf("."), o2 = s3 >= 0, t2 = e3.constructor, o2 && (n2 = n2.replace(".", ""), u = n2.length, s3 = u - s3, r3 = Ue(t2, new t2(i), s3, s3 * 2)), f2 = ie(n2, i, D), c2 = f2.length - 1, s3 = c2; f2[s3] === 0; --s3)
        f2.pop();
      return s3 < 0 ? new t2(e3.s * 0) : (e3.e = ue(f2, c2), e3.d = f2, w2 = false, o2 && (e3 = S2(e3, r3, u * 4)), l2 && (e3 = e3.times(Math.abs(l2) < 54 ? C(2, l2) : Q.pow(2, l2))), w2 = true, e3);
    }
    function un(e3, n2) {
      var i, t2 = n2.d.length;
      if (t2 < 3)
        return n2.isZero() ? n2 : j(e3, 2, n2, n2);
      i = 1.4 * Math.sqrt(t2), i = i > 16 ? 16 : i | 0, n2 = n2.times(1 / fe(5, i)), n2 = j(e3, 2, n2, n2);
      for (var r3, s3 = new e3(5), o2 = new e3(16), u = new e3(20); i--; )
        r3 = n2.times(n2), n2 = n2.times(s3.plus(r3.times(o2.times(r3).minus(u))));
      return n2;
    }
    function j(e3, n2, i, t2, r3) {
      var s3, o2, u, l2, f2 = 1, c2 = e3.precision, a = Math.ceil(c2 / m);
      for (w2 = false, l2 = i.times(i), u = new e3(t2); ; ) {
        if (o2 = S2(u.times(l2), new e3(n2++ * n2++), c2, 1), u = r3 ? t2.plus(o2) : t2.minus(o2), t2 = S2(o2.times(l2), new e3(n2++ * n2++), c2, 1), o2 = u.plus(t2), o2.d[a] !== void 0) {
          for (s3 = a; o2.d[s3] === u.d[s3] && s3--; )
            ;
          if (s3 == -1)
            break;
        }
        s3 = u, u = t2, t2 = o2, o2 = s3, f2++;
      }
      return w2 = true, o2.d.length = a + 1, o2;
    }
    function fe(e3, n2) {
      for (var i = e3; --n2; )
        i *= e3;
      return i;
    }
    function $e(e3, n2) {
      var i, t2 = n2.s < 0, r3 = L(e3, e3.precision, 1), s3 = r3.times(0.5);
      if (n2 = n2.abs(), n2.lte(s3))
        return Z = t2 ? 4 : 1, n2;
      if (i = n2.divToInt(r3), i.isZero())
        Z = t2 ? 3 : 2;
      else {
        if (n2 = n2.minus(i.times(r3)), n2.lte(s3))
          return Z = Ae(i) ? t2 ? 2 : 3 : t2 ? 4 : 1, n2;
        Z = Ae(i) ? t2 ? 1 : 4 : t2 ? 3 : 2;
      }
      return n2.minus(r3).abs();
    }
    function ke(e3, n2, i, t2) {
      var r3, s3, o2, u, l2, f2, c2, a, d, g = e3.constructor, v = i !== void 0;
      if (v ? (_(i, 1, $), t2 === void 0 ? t2 = g.rounding : _(t2, 0, 8)) : (i = g.precision, t2 = g.rounding), !e3.isFinite())
        c2 = Ve(e3);
      else {
        for (c2 = F2(e3), o2 = c2.indexOf("."), v ? (r3 = 2, n2 == 16 ? i = i * 4 - 3 : n2 == 8 && (i = i * 3 - 2)) : r3 = n2, o2 >= 0 && (c2 = c2.replace(".", ""), d = new g(1), d.e = c2.length - o2, d.d = ie(F2(d), 10, r3), d.e = d.d.length), a = ie(c2, 10, r3), s3 = l2 = a.length; a[--l2] == 0; )
          a.pop();
        if (!a[0])
          c2 = v ? "0p+0" : "0";
        else {
          if (o2 < 0 ? s3-- : (e3 = new g(e3), e3.d = a, e3.e = s3, e3 = S2(e3, d, i, t2, 0, r3), a = e3.d, s3 = e3.e, f2 = Te), o2 = a[i], u = r3 / 2, f2 = f2 || a[i + 1] !== void 0, f2 = t2 < 4 ? (o2 !== void 0 || f2) && (t2 === 0 || t2 === (e3.s < 0 ? 3 : 2)) : o2 > u || o2 === u && (t2 === 4 || f2 || t2 === 6 && a[i - 1] & 1 || t2 === (e3.s < 0 ? 8 : 7)), a.length = i, f2)
            for (; ++a[--i] > r3 - 1; )
              a[i] = 0, i || (++s3, a.unshift(1));
          for (l2 = a.length; !a[l2 - 1]; --l2)
            ;
          for (o2 = 0, c2 = ""; o2 < l2; o2++)
            c2 += we.charAt(a[o2]);
          if (v) {
            if (l2 > 1)
              if (n2 == 16 || n2 == 8) {
                for (o2 = n2 == 16 ? 4 : 3, --l2; l2 % o2; l2++)
                  c2 += "0";
                for (a = ie(c2, r3, n2), l2 = a.length; !a[l2 - 1]; --l2)
                  ;
                for (o2 = 1, c2 = "1."; o2 < l2; o2++)
                  c2 += we.charAt(a[o2]);
              } else
                c2 = c2.charAt(0) + "." + c2.slice(1);
            c2 = c2 + (s3 < 0 ? "p" : "p+") + s3;
          } else if (s3 < 0) {
            for (; ++s3; )
              c2 = "0" + c2;
            c2 = "0." + c2;
          } else if (++s3 > l2)
            for (s3 -= l2; s3--; )
              c2 += "0";
          else
            s3 < l2 && (c2 = c2.slice(0, s3) + "." + c2.slice(s3));
        }
        c2 = (n2 == 16 ? "0x" : n2 == 2 ? "0b" : n2 == 8 ? "0o" : "") + c2;
      }
      return e3.s < 0 ? "-" + c2 : c2;
    }
    function _e(e3, n2) {
      if (e3.length > n2)
        return e3.length = n2, true;
    }
    function fn(e3) {
      return new this(e3).abs();
    }
    function ln(e3) {
      return new this(e3).acos();
    }
    function cn(e3) {
      return new this(e3).acosh();
    }
    function an(e3, n2) {
      return new this(e3).plus(n2);
    }
    function dn(e3) {
      return new this(e3).asin();
    }
    function hn(e3) {
      return new this(e3).asinh();
    }
    function pn(e3) {
      return new this(e3).atan();
    }
    function gn(e3) {
      return new this(e3).atanh();
    }
    function mn(e3, n2) {
      e3 = new this(e3), n2 = new this(n2);
      var i, t2 = this.precision, r3 = this.rounding, s3 = t2 + 4;
      return !e3.s || !n2.s ? i = new this(NaN) : !e3.d && !n2.d ? (i = L(this, s3, 1).times(n2.s > 0 ? 0.25 : 0.75), i.s = e3.s) : !n2.d || e3.isZero() ? (i = n2.s < 0 ? L(this, t2, r3) : new this(0), i.s = e3.s) : !e3.d || n2.isZero() ? (i = L(this, s3, 1).times(0.5), i.s = e3.s) : n2.s < 0 ? (this.precision = s3, this.rounding = 1, i = this.atan(S2(e3, n2, s3, 1)), n2 = L(this, s3, 1), this.precision = t2, this.rounding = r3, i = e3.s < 0 ? i.minus(n2) : i.plus(n2)) : i = this.atan(S2(e3, n2, s3, 1)), i;
    }
    function wn(e3) {
      return new this(e3).cbrt();
    }
    function Nn(e3) {
      return p2(e3 = new this(e3), e3.e + 1, 2);
    }
    function vn(e3, n2, i) {
      return new this(e3).clamp(n2, i);
    }
    function En(e3) {
      if (!e3 || typeof e3 != "object")
        throw Error(oe + "Object expected");
      var n2, i, t2, r3 = e3.defaults === true, s3 = ["precision", 1, $, "rounding", 0, 8, "toExpNeg", -H, 0, "toExpPos", 0, H, "maxE", 0, H, "minE", -H, 0, "modulo", 0, 9];
      for (n2 = 0; n2 < s3.length; n2 += 3)
        if (i = s3[n2], r3 && (this[i] = Ne[i]), (t2 = e3[i]) !== void 0)
          if (b2(t2) === t2 && t2 >= s3[n2 + 1] && t2 <= s3[n2 + 2])
            this[i] = t2;
          else
            throw Error(V + i + ": " + t2);
      if (i = "crypto", r3 && (this[i] = Ne[i]), (t2 = e3[i]) !== void 0)
        if (t2 === true || t2 === false || t2 === 0 || t2 === 1)
          if (t2)
            if (typeof crypto < "u" && crypto && (crypto.getRandomValues || crypto.randomBytes))
              this[i] = true;
            else
              throw Error(De);
          else
            this[i] = false;
        else
          throw Error(V + i + ": " + t2);
      return this;
    }
    function Sn(e3) {
      return new this(e3).cos();
    }
    function kn(e3) {
      return new this(e3).cosh();
    }
    function He(e3) {
      var n2, i, t2;
      function r3(s3) {
        var o2, u, l2, f2 = this;
        if (!(f2 instanceof r3))
          return new r3(s3);
        if (f2.constructor = r3, qe(s3)) {
          f2.s = s3.s, w2 ? !s3.d || s3.e > r3.maxE ? (f2.e = NaN, f2.d = null) : s3.e < r3.minE ? (f2.e = 0, f2.d = [0]) : (f2.e = s3.e, f2.d = s3.d.slice()) : (f2.e = s3.e, f2.d = s3.d ? s3.d.slice() : s3.d);
          return;
        }
        if (l2 = typeof s3, l2 === "number") {
          if (s3 === 0) {
            f2.s = 1 / s3 < 0 ? -1 : 1, f2.e = 0, f2.d = [0];
            return;
          }
          if (s3 < 0 ? (s3 = -s3, f2.s = -1) : f2.s = 1, s3 === ~~s3 && s3 < 1e7) {
            for (o2 = 0, u = s3; u >= 10; u /= 10)
              o2++;
            w2 ? o2 > r3.maxE ? (f2.e = NaN, f2.d = null) : o2 < r3.minE ? (f2.e = 0, f2.d = [0]) : (f2.e = o2, f2.d = [s3]) : (f2.e = o2, f2.d = [s3]);
            return;
          } else if (s3 * 0 !== 0) {
            s3 || (f2.s = NaN), f2.e = NaN, f2.d = null;
            return;
          }
          return Se(f2, s3.toString());
        } else if (l2 !== "string")
          throw Error(V + s3);
        return (u = s3.charCodeAt(0)) === 45 ? (s3 = s3.slice(1), f2.s = -1) : (u === 43 && (s3 = s3.slice(1)), f2.s = 1), Ie.test(s3) ? Se(f2, s3) : on(f2, s3);
      }
      if (r3.prototype = h, r3.ROUND_UP = 0, r3.ROUND_DOWN = 1, r3.ROUND_CEIL = 2, r3.ROUND_FLOOR = 3, r3.ROUND_HALF_UP = 4, r3.ROUND_HALF_DOWN = 5, r3.ROUND_HALF_EVEN = 6, r3.ROUND_HALF_CEIL = 7, r3.ROUND_HALF_FLOOR = 8, r3.EUCLID = 9, r3.config = r3.set = En, r3.clone = He, r3.isDecimal = qe, r3.abs = fn, r3.acos = ln, r3.acosh = cn, r3.add = an, r3.asin = dn, r3.asinh = hn, r3.atan = pn, r3.atanh = gn, r3.atan2 = mn, r3.cbrt = wn, r3.ceil = Nn, r3.clamp = vn, r3.cos = Sn, r3.cosh = kn, r3.div = Mn, r3.exp = Cn, r3.floor = On, r3.hypot = Pn, r3.ln = Rn, r3.log = bn, r3.log10 = _n, r3.log2 = An, r3.max = qn, r3.min = Tn, r3.mod = Ln, r3.mul = Dn, r3.pow = Fn, r3.random = In, r3.round = Zn, r3.sign = Un, r3.sin = Bn, r3.sinh = Vn, r3.sqrt = $n, r3.sub = Hn, r3.sum = jn, r3.tan = Wn, r3.tanh = Gn, r3.trunc = Jn, e3 === void 0 && (e3 = {}), e3 && e3.defaults !== true)
        for (t2 = ["precision", "rounding", "toExpNeg", "toExpPos", "maxE", "minE", "modulo", "crypto"], n2 = 0; n2 < t2.length; )
          e3.hasOwnProperty(i = t2[n2++]) || (e3[i] = this[i]);
      return r3.config(e3), r3;
    }
    function Mn(e3, n2) {
      return new this(e3).div(n2);
    }
    function Cn(e3) {
      return new this(e3).exp();
    }
    function On(e3) {
      return p2(e3 = new this(e3), e3.e + 1, 3);
    }
    function Pn() {
      var e3, n2, i = new this(0);
      for (w2 = false, e3 = 0; e3 < arguments.length; )
        if (n2 = new this(arguments[e3++]), n2.d)
          i.d && (i = i.plus(n2.times(n2)));
        else {
          if (n2.s)
            return w2 = true, new this(1 / 0);
          i = n2;
        }
      return w2 = true, i.sqrt();
    }
    function qe(e3) {
      return e3 instanceof Q || e3 && e3.toStringTag === Fe || false;
    }
    function Rn(e3) {
      return new this(e3).ln();
    }
    function bn(e3, n2) {
      return new this(e3).log(n2);
    }
    function An(e3) {
      return new this(e3).log(2);
    }
    function _n(e3) {
      return new this(e3).log(10);
    }
    function qn() {
      return Be(this, arguments, "lt");
    }
    function Tn() {
      return Be(this, arguments, "gt");
    }
    function Ln(e3, n2) {
      return new this(e3).mod(n2);
    }
    function Dn(e3, n2) {
      return new this(e3).mul(n2);
    }
    function Fn(e3, n2) {
      return new this(e3).pow(n2);
    }
    function In(e3) {
      var n2, i, t2, r3, s3 = 0, o2 = new this(1), u = [];
      if (e3 === void 0 ? e3 = this.precision : _(e3, 1, $), t2 = Math.ceil(e3 / m), this.crypto)
        if (crypto.getRandomValues)
          for (n2 = crypto.getRandomValues(new Uint32Array(t2)); s3 < t2; )
            r3 = n2[s3], r3 >= 429e7 ? n2[s3] = crypto.getRandomValues(new Uint32Array(1))[0] : u[s3++] = r3 % 1e7;
        else if (crypto.randomBytes) {
          for (n2 = crypto.randomBytes(t2 *= 4); s3 < t2; )
            r3 = n2[s3] + (n2[s3 + 1] << 8) + (n2[s3 + 2] << 16) + ((n2[s3 + 3] & 127) << 24), r3 >= 214e7 ? crypto.randomBytes(4).copy(n2, s3) : (u.push(r3 % 1e7), s3 += 4);
          s3 = t2 / 4;
        } else
          throw Error(De);
      else
        for (; s3 < t2; )
          u[s3++] = Math.random() * 1e7 | 0;
      for (t2 = u[--s3], e3 %= m, t2 && e3 && (r3 = C(10, m - e3), u[s3] = (t2 / r3 | 0) * r3); u[s3] === 0; s3--)
        u.pop();
      if (s3 < 0)
        i = 0, u = [0];
      else {
        for (i = -1; u[0] === 0; i -= m)
          u.shift();
        for (t2 = 1, r3 = u[0]; r3 >= 10; r3 /= 10)
          t2++;
        t2 < m && (i -= m - t2);
      }
      return o2.e = i, o2.d = u, o2;
    }
    function Zn(e3) {
      return p2(e3 = new this(e3), e3.e + 1, this.rounding);
    }
    function Un(e3) {
      return e3 = new this(e3), e3.d ? e3.d[0] ? e3.s : 0 * e3.s : e3.s || NaN;
    }
    function Bn(e3) {
      return new this(e3).sin();
    }
    function Vn(e3) {
      return new this(e3).sinh();
    }
    function $n(e3) {
      return new this(e3).sqrt();
    }
    function Hn(e3, n2) {
      return new this(e3).sub(n2);
    }
    function jn() {
      var e3 = 0, n2 = arguments, i = new this(n2[e3]);
      for (w2 = false; i.s && ++e3 < n2.length; )
        i = i.plus(n2[e3]);
      return w2 = true, p2(i, this.precision, this.rounding);
    }
    function Wn(e3) {
      return new this(e3).tan();
    }
    function Gn(e3) {
      return new this(e3).tanh();
    }
    function Jn(e3) {
      return p2(e3 = new this(e3), e3.e + 1, 1);
    }
    h[Symbol.for("nodejs.util.inspect.custom")] = h.toString;
    h[Symbol.toStringTag] = "Decimal";
    var Q = h.constructor = He(Ne);
    te = new Q(te);
    re = new Q(re);
    var je = Q;
  }
});

// node_modules/.prisma/client/index-browser.js
var require_index_browser2 = __commonJS({
  "node_modules/.prisma/client/index-browser.js"(exports) {
    Object.defineProperty(exports, "__esModule", { value: true });
    var {
      Decimal: Decimal2,
      objectEnumValues: objectEnumValues2,
      makeStrictEnum: makeStrictEnum2,
      Public: Public2,
      getRuntime: getRuntime2,
      skip
    } = require_index_browser();
    var Prisma = {};
    exports.Prisma = Prisma;
    exports.$Enums = {};
    Prisma.prismaVersion = {
      client: "5.22.0",
      engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
    };
    Prisma.PrismaClientKnownRequestError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.PrismaClientUnknownRequestError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.PrismaClientRustPanicError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.PrismaClientInitializationError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.PrismaClientValidationError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.NotFoundError = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.Decimal = Decimal2;
    Prisma.sql = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.empty = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.join = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.raw = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.validator = Public2.validator;
    Prisma.getExtensionContext = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.defineExtension = () => {
      const runtimeName = getRuntime2().prettyName;
      throw new Error(
        `Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`
      );
    };
    Prisma.DbNull = objectEnumValues2.instances.DbNull;
    Prisma.JsonNull = objectEnumValues2.instances.JsonNull;
    Prisma.AnyNull = objectEnumValues2.instances.AnyNull;
    Prisma.NullTypes = {
      DbNull: objectEnumValues2.classes.DbNull,
      JsonNull: objectEnumValues2.classes.JsonNull,
      AnyNull: objectEnumValues2.classes.AnyNull
    };
    exports.Prisma.TransactionIsolationLevel = makeStrictEnum2({
      ReadUncommitted: "ReadUncommitted",
      ReadCommitted: "ReadCommitted",
      RepeatableRead: "RepeatableRead",
      Serializable: "Serializable"
    });
    exports.Prisma.OrgScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      name: "name"
    };
    exports.Prisma.SiteScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      name: "name",
      orgId: "orgId"
    };
    exports.Prisma.RoomScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      name: "name",
      building: "building",
      floor: "floor",
      siteId: "siteId"
    };
    exports.Prisma.AssetScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      name: "name",
      roomId: "roomId"
    };
    exports.Prisma.WorkOrderScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      title: "title",
      description: "description",
      status: "status",
      failureMode: "failureMode",
      revisitSchedule: "revisitSchedule",
      assetId: "assetId",
      orgId: "orgId",
      assignedToId: "assignedToId"
    };
    exports.Prisma.UserScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      updatedAt: "updatedAt",
      email: "email",
      password: "password",
      firstName: "firstName",
      lastName: "lastName",
      phoneNumber: "phoneNumber",
      role: "role",
      orgId: "orgId"
    };
    exports.Prisma.SessionScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      expiresAt: "expiresAt",
      userId: "userId"
    };
    exports.Prisma.AuditLogScalarFieldEnum = {
      id: "id",
      createdAt: "createdAt",
      action: "action",
      details: "details",
      userId: "userId"
    };
    exports.Prisma.SortOrder = {
      asc: "asc",
      desc: "desc"
    };
    exports.Prisma.NullableJsonNullValueInput = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull
    };
    exports.Prisma.QueryMode = {
      default: "default",
      insensitive: "insensitive"
    };
    exports.Prisma.NullsOrder = {
      first: "first",
      last: "last"
    };
    exports.Prisma.JsonNullValueFilter = {
      DbNull: Prisma.DbNull,
      JsonNull: Prisma.JsonNull,
      AnyNull: Prisma.AnyNull
    };
    exports.WorkOrderStatus = exports.$Enums.WorkOrderStatus = {
      PENDING: "PENDING",
      IN_PROGRESS: "IN_PROGRESS",
      COMPLETED: "COMPLETED",
      ON_HOLD: "ON_HOLD",
      CANCELLED: "CANCELLED"
    };
    exports.UserRole = exports.$Enums.UserRole = {
      ADMIN: "ADMIN",
      MANAGER: "MANAGER",
      TECHNICIAN: "TECHNICIAN"
    };
    exports.Prisma.ModelName = {
      Org: "Org",
      Site: "Site",
      Room: "Room",
      Asset: "Asset",
      WorkOrder: "WorkOrder",
      User: "User",
      Session: "Session",
      AuditLog: "AuditLog"
    };
    var PrismaClient2 = class {
      constructor() {
        return new Proxy(this, {
          get(target, prop) {
            let message;
            const runtime = getRuntime2();
            if (runtime.isEdge) {
              message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
            } else {
              message = "PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `" + runtime.prettyName + "`).";
            }
            message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`;
            throw new Error(message);
          }
        });
      }
    };
    exports.PrismaClient = PrismaClient2;
    Object.assign(exports, Prisma);
  }
});

// node_modules/.prisma/client/default.js
var require_default = __commonJS({
  "node_modules/.prisma/client/default.js"(exports, module) {
    module.exports = { ...require_index_browser2() };
  }
});

// node_modules/@prisma/client/default.js
var require_default2 = __commonJS({
  "node_modules/@prisma/client/default.js"(exports, module) {
    module.exports = {
      ...require_default()
    };
  }
});

// node_modules/@prisma/client/scripts/default-index.js
var require_default_index = __commonJS({
  "node_modules/@prisma/client/scripts/default-index.js"(exports, module) {
    "use strict";
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key2 of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to, key2) && key2 !== except)
            __defProp2(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc2(from, key2)) || desc.enumerable });
      }
      return to;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var default_index_exports = {};
    __export2(default_index_exports, {
      Prisma: () => Prisma,
      PrismaClient: () => PrismaClient2,
      default: () => default_index_default
    });
    module.exports = __toCommonJS(default_index_exports);
    var prisma2 = {
      enginesVersion: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
    };
    var version = "5.22.0";
    var clientVersion = version;
    var PrismaClient2 = class {
      constructor() {
        throw new Error('@prisma/client did not initialize yet. Please run "prisma generate" and try to import it again.');
      }
    };
    function defineExtension(ext) {
      if (typeof ext === "function") {
        return ext;
      }
      return (client) => client.$extends(ext);
    }
    function getExtensionContext(that) {
      return that;
    }
    var Prisma = {
      defineExtension,
      getExtensionContext,
      prismaVersion: { client: clientVersion, engine: prisma2.enginesVersion }
    };
    var default_index_default = { Prisma };
  }
});

// node_modules/@prisma/extension-accelerate/dist/index.js
function f(a, n2) {
  let [c2 = 0, u = 0, m = 0] = a.split(".").map(Number), [o2 = 0, h = 0, i = 0] = n2.split(".").map(Number), r3 = o2 - c2, e3 = h - u, t2 = i - m;
  return r3 || e3 || t2;
}
function p() {
  let a = import_default_index2.default.Prisma.prismaVersion;
  return [F(), `PrismaEngine/${a.engine}`, `PrismaClient/${a.client}`].join(" ");
}
function F() {
  return typeof navigator < "u" ? navigator.userAgent : typeof process < "u" && typeof process.versions < "u" ? `Node/${process.versions.node} (${process.platform}; ${process.arch})` : "EdgeRuntime" in globalThis ? "Vercel-Edge-Runtime" : "UnknownRuntime";
}
function S(a) {
  let n2 = p(), c2;
  return async (u) => {
    let { args: m } = u, { cacheStrategy: o2, __accelerateInfo: h = false, ...i } = m, r3 = null, { __internalParams: e3, query: t2 } = u;
    return e3.customDataProxyFetch = () => async (s3, d) => {
      let A = new Array();
      typeof o2?.ttl == "number" && A.push(`max-age=${o2.ttl}`), typeof o2?.swr == "number" && A.push(`stale-while-revalidate=${o2.swr}`);
      let y = o2?.tags?.join(",") ?? "";
      d.headers = { ...d.headers, "cache-control": A.length > 0 ? A.join(",") : "no-cache", "user-agent": n2, ...y.length > 0 ? { "accelerate-cache-tags": y } : {} }, c2 && (d.headers["accelerate-query-engine-jwt"] = c2);
      try {
        let g = await a(s3, d);
        return r3 = { cacheStatus: g.headers.get("accelerate-cache-status"), lastModified: new Date(g.headers.get("last-modified") ?? ""), region: g.headers.get("cf-ray")?.split("-")[1] ?? "unspecified", requestId: g.headers.get("cf-ray") ?? "unspecified", signature: g.headers.get("accelerate-signature") ?? "unspecified" }, c2 = g.headers.get("accelerate-query-engine-jwt") ?? void 0, g;
      } catch {
        throw new Error(x);
      }
    }, h ? { data: await t2(i, e3), info: r3 } : t2(i, e3);
  };
}
function T(a) {
  let n2 = f("5.1.0", import_default_index.default.Prisma.prismaVersion.client) >= 0;
  return import_default_index.default.Prisma.defineExtension((c2) => {
    let { apiKeyPromise: u, baseURL: m } = b(c2), o2 = S(a);
    async function h(r3) {
      let e3 = await u;
      if (!e3)
        return { requestId: "unspecified" };
      let t2;
      try {
        t2 = await a(new URL("/invalidate", m).href, { method: "POST", headers: { authorization: `Bearer ${e3}`, "content-type": "application/json" }, body: JSON.stringify(r3) });
      } catch {
        throw new Error(x);
      }
      if (!t2?.ok) {
        let s3 = await t2.text();
        throw new Error(`Failed to invalidate Accelerate cache. Response was ${t2.status} ${t2.statusText}. ${s3}`);
      }
      return t2.body?.cancel(), { requestId: t2.headers.get("cf-ray") ?? "unspecified" };
    }
    let i = c2.$extends({ name: P, query: { $allModels: { $allOperations: o2 } } });
    return i.$extends({ name: P, client: { $accelerate: { invalidate: (r3) => h(r3), invalidateAll: () => h({ tags: "all" }) } }, model: { $allModels: { aggregate(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.aggregate(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.aggregate({ ...r3, __accelerateInfo: true });
      } });
    }, count(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.count(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.count({ ...r3, __accelerateInfo: true });
      } });
    }, findFirst(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.findFirst(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.findFirst({ ...r3, __accelerateInfo: true });
      } });
    }, findFirstOrThrow(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.findFirstOrThrow(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.findFirstOrThrow({ ...r3, __accelerateInfo: true });
      } });
    }, findMany(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.findMany(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.findMany({ ...r3, __accelerateInfo: true });
      } });
    }, findUnique(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.findUnique(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.findUnique({ ...r3, __accelerateInfo: true });
      } });
    }, findUniqueOrThrow(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.findUniqueOrThrow(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.findUniqueOrThrow({ ...r3, __accelerateInfo: true });
      } });
    }, groupBy(r3) {
      let e3 = import_default_index.default.Prisma.getExtensionContext(this), t2 = n2 ? e3.$parent[e3.$name] : i[e3.name], s3 = t2.groupBy(r3);
      return Object.assign(s3, { withAccelerateInfo() {
        return t2.groupBy({ ...r3, __accelerateInfo: true });
      } });
    } } } });
  });
}
function b(a) {
  let n2 = Reflect.get(a, "_accelerateEngineConfig");
  try {
    let { host: c2, hostname: u, protocol: m, searchParams: o2 } = new URL(n2?.accelerateUtils?.resolveDatasourceUrl?.(n2));
    if (m === "prisma+postgres:" && (u === "localhost" || u === "127.0.0.1"))
      return { apiKeyPromise: Promise.resolve(o2.get("api_key")), baseURL: new URL(`http://${c2}`) };
  } catch {
  }
  return { apiKeyPromise: a._engine.start().then(() => a._engine.apiKey?.() ?? null), baseURL: new URL("https://accelerate.prisma-data.net") };
}
function k(a) {
  let n2 = a?.fetch ?? fetch;
  return T(n2);
}
var import_default_index, import_default_index2, P, x;
var init_dist = __esm({
  "node_modules/@prisma/extension-accelerate/dist/index.js"() {
    import_default_index = __toESM(require_default_index(), 1);
    import_default_index2 = __toESM(require_default_index(), 1);
    P = "@prisma/extension-accelerate";
    x = "Unable to connect to the Accelerate API. This may be due to a network or DNS issue. Please check your connection and the Accelerate connection string. For details, visit https://www.prisma.io/docs/accelerate/troubleshoot.";
  }
});

// .svelte-kit/output/server/chunks/prisma.js
function createPrismaClient(orgId) {
  if (!orgId) {
    return prismaSingleton;
  }
  return prismaSingleton.$extends({
    query: {
      $allModels: {
        async findMany({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findFirst({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async findUnique({ model, args, query }) {
          const result = await query(args);
          if (result && orgModels.includes(model) && result.orgId !== orgId) {
            return null;
          }
          return result;
        },
        async update({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async delete({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.where = { ...args.where, orgId };
          }
          return query(args);
        },
        async create({ model, args, query }) {
          if (orgModels.includes(model)) {
            args.data = { ...args.data, orgId };
          }
          return query(args);
        }
      }
    }
  });
}
function createRequestPrisma(event) {
  const orgId = event.locals.user?.orgId;
  return createPrismaClient(orgId);
}
var import_client, globalForPrisma, prismaSingleton, orgModels, prisma;
var init_prisma = __esm({
  ".svelte-kit/output/server/chunks/prisma.js"() {
    import_client = __toESM(require_default2(), 1);
    init_dist();
    globalForPrisma = globalThis;
    prismaSingleton = globalForPrisma.prisma ?? new import_client.PrismaClient({
      log: true ? ["query", "info", "warn", "error"] : ["warn", "error"]
    }).$extends(k());
    if (true) {
      globalForPrisma.prisma = prismaSingleton;
    }
    orgModels = ["WorkOrder", "User", "Site"];
    prisma = prismaSingleton;
  }
});

// .svelte-kit/output/server/chunks/auth.js
async function hashPassword(password) {
  return bcryptjs_default.hash(password, 12);
}
async function verifyPassword(password, hash3) {
  return bcryptjs_default.compare(password, hash3);
}
async function createSession(userId) {
  try {
    const expiresAt = /* @__PURE__ */ new Date();
    expiresAt.setDate(expiresAt.getDate() + SESSION_EXPIRY_DAYS);
    const session = await prisma.session.create({
      data: {
        userId,
        expiresAt
      }
    });
    return session.id;
  } catch (error2) {
    console.error("Failed to create session:", error2);
    throw new Error("Failed to create session");
  }
}
async function validateSession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (!sessionId) {
    return null;
  }
  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          orgId: true
        }
      }
    }
  });
  if (!session) {
    return null;
  }
  if (session.expiresAt < /* @__PURE__ */ new Date()) {
    await prisma.session.delete({ where: { id: sessionId } });
    return null;
  }
  return session.user;
}
async function destroySession(cookies) {
  const sessionId = cookies.get(SESSION_COOKIE);
  if (sessionId) {
    await prisma.session.delete({ where: { id: sessionId } }).catch(() => {
    });
    cookies.delete(SESSION_COOKIE, { path: "/" });
  }
}
function setSessionCookie(cookies, sessionId) {
  cookies.set(SESSION_COOKIE, sessionId, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    maxAge: 60 * 60 * 24 * SESSION_EXPIRY_DAYS
  });
}
function canManageUsers(role) {
  return role === "ADMIN";
}
var SESSION_COOKIE, SESSION_EXPIRY_DAYS;
var init_auth = __esm({
  ".svelte-kit/output/server/chunks/auth.js"() {
    init_bcryptjs();
    init_prisma();
    SESSION_COOKIE = "spore_session";
    SESSION_EXPIRY_DAYS = 30;
  }
});

// .svelte-kit/output/server/chunks/hooks.server.js
var hooks_server_exports = {};
__export(hooks_server_exports, {
  handle: () => handle
});
var publicRoutes, handle;
var init_hooks_server = __esm({
  ".svelte-kit/output/server/chunks/hooks.server.js"() {
    init_chunks();
    init_auth();
    init_environment();
    publicRoutes = ["/auth/login", "/auth/register", "/auth/forgot-password", "/"];
    handle = async ({ event, resolve: resolve2 }) => {
      if (building) {
        return resolve2(event);
      }
      const user = await validateSession(event.cookies);
      event.locals.user = user;
      const isPublicRoute = publicRoutes.some((route) => event.url.pathname.startsWith(route));
      if (!user && !isPublicRoute) {
        throw redirect(303, "/auth/login");
      }
      if (user && event.url.pathname.startsWith("/auth/")) {
        throw redirect(303, "/dashboard");
      }
      return resolve2(event);
    };
  }
});

// node_modules/devalue/src/utils.js
function is_primitive(thing) {
  return Object(thing) !== thing;
}
function is_plain_object(thing) {
  const proto = Object.getPrototypeOf(thing);
  return proto === Object.prototype || proto === null || Object.getOwnPropertyNames(proto).sort().join("\0") === object_proto_names;
}
function get_type(thing) {
  return Object.prototype.toString.call(thing).slice(8, -1);
}
function get_escaped_char(char) {
  switch (char) {
    case '"':
      return '\\"';
    case "<":
      return "\\u003C";
    case "\\":
      return "\\\\";
    case "\n":
      return "\\n";
    case "\r":
      return "\\r";
    case "	":
      return "\\t";
    case "\b":
      return "\\b";
    case "\f":
      return "\\f";
    case "\u2028":
      return "\\u2028";
    case "\u2029":
      return "\\u2029";
    default:
      return char < " " ? `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}` : "";
  }
}
function stringify_string(str) {
  let result = "";
  let last_pos = 0;
  const len = str.length;
  for (let i = 0; i < len; i += 1) {
    const char = str[i];
    const replacement = get_escaped_char(char);
    if (replacement) {
      result += str.slice(last_pos, i) + replacement;
      last_pos = i + 1;
    }
  }
  return `"${last_pos === 0 ? str : result + str.slice(last_pos)}"`;
}
var escaped, DevalueError, object_proto_names;
var init_utils = __esm({
  "node_modules/devalue/src/utils.js"() {
    escaped = {
      "<": "\\u003C",
      "\\": "\\\\",
      "\b": "\\b",
      "\f": "\\f",
      "\n": "\\n",
      "\r": "\\r",
      "	": "\\t",
      "\u2028": "\\u2028",
      "\u2029": "\\u2029"
    };
    DevalueError = class extends Error {
      /**
       * @param {string} message
       * @param {string[]} keys
       */
      constructor(message, keys) {
        super(message);
        this.name = "DevalueError";
        this.path = keys.join("");
      }
    };
    object_proto_names = /* @__PURE__ */ Object.getOwnPropertyNames(
      Object.prototype
    ).sort().join("\0");
  }
});

// node_modules/devalue/src/uneval.js
function uneval(value, replacer) {
  const counts = /* @__PURE__ */ new Map();
  const keys = [];
  const custom = /* @__PURE__ */ new Map();
  function walk(thing) {
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys);
    }
    if (!is_primitive(thing)) {
      if (counts.has(thing)) {
        counts.set(thing, counts.get(thing) + 1);
        return;
      }
      counts.set(thing, 1);
      if (replacer) {
        const str2 = replacer(thing);
        if (typeof str2 === "string") {
          custom.set(thing, str2);
          return;
        }
      }
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "BigInt":
        case "String":
        case "Boolean":
        case "Date":
        case "RegExp":
          return;
        case "Array":
          thing.forEach((value2, i) => {
            keys.push(`[${i}]`);
            walk(value2);
            keys.pop();
          });
          break;
        case "Set":
          Array.from(thing).forEach(walk);
          break;
        case "Map":
          for (const [key2, value2] of thing) {
            keys.push(
              `.get(${is_primitive(key2) ? stringify_primitive(key2) : "..."})`
            );
            walk(value2);
            keys.pop();
          }
          break;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(
              `Cannot stringify arbitrary non-POJOs`,
              keys
            );
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new DevalueError(
              `Cannot stringify POJOs with symbolic keys`,
              keys
            );
          }
          for (const key2 in thing) {
            keys.push(`.${key2}`);
            walk(thing[key2]);
            keys.pop();
          }
      }
    }
  }
  walk(value);
  const names = /* @__PURE__ */ new Map();
  Array.from(counts).filter((entry) => entry[1] > 1).sort((a, b2) => b2[1] - a[1]).forEach((entry, i) => {
    names.set(entry[0], get_name(i));
  });
  function stringify2(thing) {
    if (names.has(thing)) {
      return names.get(thing);
    }
    if (is_primitive(thing)) {
      return stringify_primitive(thing);
    }
    if (custom.has(thing)) {
      return custom.get(thing);
    }
    const type = get_type(thing);
    switch (type) {
      case "Number":
      case "String":
      case "Boolean":
        return `Object(${stringify2(thing.valueOf())})`;
      case "RegExp":
        return `new RegExp(${stringify_string(thing.source)}, "${thing.flags}")`;
      case "Date":
        return `new Date(${thing.getTime()})`;
      case "Array":
        const members = (
          /** @type {any[]} */
          thing.map(
            (v, i) => i in thing ? stringify2(v) : ""
          )
        );
        const tail = thing.length === 0 || thing.length - 1 in thing ? "" : ",";
        return `[${members.join(",")}${tail}]`;
      case "Set":
      case "Map":
        return `new ${type}([${Array.from(thing).map(stringify2).join(",")}])`;
      default:
        const obj = `{${Object.keys(thing).map((key2) => `${safe_key(key2)}:${stringify2(thing[key2])}`).join(",")}}`;
        const proto = Object.getPrototypeOf(thing);
        if (proto === null) {
          return Object.keys(thing).length > 0 ? `Object.assign(Object.create(null),${obj})` : `Object.create(null)`;
        }
        return obj;
    }
  }
  const str = stringify2(value);
  if (names.size) {
    const params = [];
    const statements = [];
    const values = [];
    names.forEach((name, thing) => {
      params.push(name);
      if (custom.has(thing)) {
        values.push(
          /** @type {string} */
          custom.get(thing)
        );
        return;
      }
      if (is_primitive(thing)) {
        values.push(stringify_primitive(thing));
        return;
      }
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          values.push(`Object(${stringify2(thing.valueOf())})`);
          break;
        case "RegExp":
          values.push(thing.toString());
          break;
        case "Date":
          values.push(`new Date(${thing.getTime()})`);
          break;
        case "Array":
          values.push(`Array(${thing.length})`);
          thing.forEach((v, i) => {
            statements.push(`${name}[${i}]=${stringify2(v)}`);
          });
          break;
        case "Set":
          values.push(`new Set`);
          statements.push(
            `${name}.${Array.from(thing).map((v) => `add(${stringify2(v)})`).join(".")}`
          );
          break;
        case "Map":
          values.push(`new Map`);
          statements.push(
            `${name}.${Array.from(thing).map(([k2, v]) => `set(${stringify2(k2)}, ${stringify2(v)})`).join(".")}`
          );
          break;
        default:
          values.push(
            Object.getPrototypeOf(thing) === null ? "Object.create(null)" : "{}"
          );
          Object.keys(thing).forEach((key2) => {
            statements.push(
              `${name}${safe_prop(key2)}=${stringify2(thing[key2])}`
            );
          });
      }
    });
    statements.push(`return ${str}`);
    return `(function(${params.join(",")}){${statements.join(
      ";"
    )}}(${values.join(",")}))`;
  } else {
    return str;
  }
}
function get_name(num) {
  let name = "";
  do {
    name = chars[num % chars.length] + name;
    num = ~~(num / chars.length) - 1;
  } while (num >= 0);
  return reserved.test(name) ? `${name}0` : name;
}
function escape_unsafe_char(c2) {
  return escaped[c2] || c2;
}
function escape_unsafe_chars(str) {
  return str.replace(unsafe_chars, escape_unsafe_char);
}
function safe_key(key2) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key2) ? key2 : escape_unsafe_chars(JSON.stringify(key2));
}
function safe_prop(key2) {
  return /^[_$a-zA-Z][_$a-zA-Z0-9]*$/.test(key2) ? `.${key2}` : `[${escape_unsafe_chars(JSON.stringify(key2))}]`;
}
function stringify_primitive(thing) {
  if (typeof thing === "string")
    return stringify_string(thing);
  if (thing === void 0)
    return "void 0";
  if (thing === 0 && 1 / thing < 0)
    return "-0";
  const str = String(thing);
  if (typeof thing === "number")
    return str.replace(/^(-)?0\./, "$1.");
  if (typeof thing === "bigint")
    return thing + "n";
  return str;
}
var chars, unsafe_chars, reserved;
var init_uneval = __esm({
  "node_modules/devalue/src/uneval.js"() {
    init_utils();
    chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_$";
    unsafe_chars = /[<\b\f\n\r\t\0\u2028\u2029]/g;
    reserved = /^(?:do|if|in|for|int|let|new|try|var|byte|case|char|else|enum|goto|long|this|void|with|await|break|catch|class|const|final|float|short|super|throw|while|yield|delete|double|export|import|native|return|switch|throws|typeof|boolean|default|extends|finally|package|private|abstract|continue|debugger|function|volatile|interface|protected|transient|implements|instanceof|synchronized)$/;
  }
});

// node_modules/devalue/src/constants.js
var UNDEFINED, HOLE, NAN, POSITIVE_INFINITY, NEGATIVE_INFINITY, NEGATIVE_ZERO;
var init_constants = __esm({
  "node_modules/devalue/src/constants.js"() {
    UNDEFINED = -1;
    HOLE = -2;
    NAN = -3;
    POSITIVE_INFINITY = -4;
    NEGATIVE_INFINITY = -5;
    NEGATIVE_ZERO = -6;
  }
});

// node_modules/devalue/src/parse.js
var init_parse = __esm({
  "node_modules/devalue/src/parse.js"() {
    init_constants();
  }
});

// node_modules/devalue/src/stringify.js
function stringify(value, reducers) {
  const stringified = [];
  const indexes = /* @__PURE__ */ new Map();
  const custom = [];
  for (const key2 in reducers) {
    custom.push({ key: key2, fn: reducers[key2] });
  }
  const keys = [];
  let p2 = 0;
  function flatten(thing) {
    if (typeof thing === "function") {
      throw new DevalueError(`Cannot stringify a function`, keys);
    }
    if (indexes.has(thing))
      return indexes.get(thing);
    if (thing === void 0)
      return UNDEFINED;
    if (Number.isNaN(thing))
      return NAN;
    if (thing === Infinity)
      return POSITIVE_INFINITY;
    if (thing === -Infinity)
      return NEGATIVE_INFINITY;
    if (thing === 0 && 1 / thing < 0)
      return NEGATIVE_ZERO;
    const index18 = p2++;
    indexes.set(thing, index18);
    for (const { key: key2, fn } of custom) {
      const value2 = fn(thing);
      if (value2) {
        stringified[index18] = `["${key2}",${flatten(value2)}]`;
        return index18;
      }
    }
    let str = "";
    if (is_primitive(thing)) {
      str = stringify_primitive2(thing);
    } else {
      const type = get_type(thing);
      switch (type) {
        case "Number":
        case "String":
        case "Boolean":
          str = `["Object",${stringify_primitive2(thing)}]`;
          break;
        case "BigInt":
          str = `["BigInt",${thing}]`;
          break;
        case "Date":
          const valid = !isNaN(thing.getDate());
          str = `["Date","${valid ? thing.toISOString() : ""}"]`;
          break;
        case "RegExp":
          const { source, flags } = thing;
          str = flags ? `["RegExp",${stringify_string(source)},"${flags}"]` : `["RegExp",${stringify_string(source)}]`;
          break;
        case "Array":
          str = "[";
          for (let i = 0; i < thing.length; i += 1) {
            if (i > 0)
              str += ",";
            if (i in thing) {
              keys.push(`[${i}]`);
              str += flatten(thing[i]);
              keys.pop();
            } else {
              str += HOLE;
            }
          }
          str += "]";
          break;
        case "Set":
          str = '["Set"';
          for (const value2 of thing) {
            str += `,${flatten(value2)}`;
          }
          str += "]";
          break;
        case "Map":
          str = '["Map"';
          for (const [key2, value2] of thing) {
            keys.push(
              `.get(${is_primitive(key2) ? stringify_primitive2(key2) : "..."})`
            );
            str += `,${flatten(key2)},${flatten(value2)}`;
            keys.pop();
          }
          str += "]";
          break;
        default:
          if (!is_plain_object(thing)) {
            throw new DevalueError(
              `Cannot stringify arbitrary non-POJOs`,
              keys
            );
          }
          if (Object.getOwnPropertySymbols(thing).length > 0) {
            throw new DevalueError(
              `Cannot stringify POJOs with symbolic keys`,
              keys
            );
          }
          if (Object.getPrototypeOf(thing) === null) {
            str = '["null"';
            for (const key2 in thing) {
              keys.push(`.${key2}`);
              str += `,${stringify_string(key2)},${flatten(thing[key2])}`;
              keys.pop();
            }
            str += "]";
          } else {
            str = "{";
            let started = false;
            for (const key2 in thing) {
              if (started)
                str += ",";
              started = true;
              keys.push(`.${key2}`);
              str += `${stringify_string(key2)}:${flatten(thing[key2])}`;
              keys.pop();
            }
            str += "}";
          }
      }
    }
    stringified[index18] = str;
    return index18;
  }
  const index17 = flatten(value);
  if (index17 < 0)
    return `${index17}`;
  return `[${stringified.join(",")}]`;
}
function stringify_primitive2(thing) {
  const type = typeof thing;
  if (type === "string")
    return stringify_string(thing);
  if (thing instanceof String)
    return stringify_string(thing.toString());
  if (thing === void 0)
    return UNDEFINED.toString();
  if (thing === 0 && 1 / thing < 0)
    return NEGATIVE_ZERO.toString();
  if (type === "bigint")
    return `["BigInt","${thing}"]`;
  return String(thing);
}
var init_stringify = __esm({
  "node_modules/devalue/src/stringify.js"() {
    init_utils();
    init_constants();
  }
});

// node_modules/devalue/index.js
var init_devalue = __esm({
  "node_modules/devalue/index.js"() {
    init_uneval();
    init_parse();
    init_stringify();
  }
});

// .svelte-kit/output/server/chunks/index2.js
function readable(value, start) {
  return {
    subscribe: writable(value, start).subscribe
  };
}
function writable(value, start = noop) {
  let stop;
  const subscribers = /* @__PURE__ */ new Set();
  function set(new_value) {
    if (safe_not_equal(value, new_value)) {
      value = new_value;
      if (stop) {
        const run_queue = !subscriber_queue.length;
        for (const subscriber of subscribers) {
          subscriber[1]();
          subscriber_queue.push(subscriber, value);
        }
        if (run_queue) {
          for (let i = 0; i < subscriber_queue.length; i += 2) {
            subscriber_queue[i][0](subscriber_queue[i + 1]);
          }
          subscriber_queue.length = 0;
        }
      }
    }
  }
  function update(fn) {
    set(fn(value));
  }
  function subscribe2(run2, invalidate = noop) {
    const subscriber = [run2, invalidate];
    subscribers.add(subscriber);
    if (subscribers.size === 1) {
      stop = start(set, update) || noop;
    }
    run2(value);
    return () => {
      subscribers.delete(subscriber);
      if (subscribers.size === 0 && stop) {
        stop();
        stop = null;
      }
    };
  }
  return { set, update, subscribe: subscribe2 };
}
var subscriber_queue;
var init_index2 = __esm({
  ".svelte-kit/output/server/chunks/index2.js"() {
    init_ssr();
    subscriber_queue = [];
  }
});

// node_modules/cookie/dist/index.js
var require_dist = __commonJS({
  "node_modules/cookie/dist/index.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.parse = parse3;
    exports.serialize = serialize2;
    var cookieNameRegExp = /^[\u0021-\u003A\u003C\u003E-\u007E]+$/;
    var cookieValueRegExp = /^[\u0021-\u003A\u003C-\u007E]*$/;
    var domainValueRegExp = /^([.]?[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)([.][a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?)*$/i;
    var pathValueRegExp = /^[\u0020-\u003A\u003D-\u007E]*$/;
    var __toString = Object.prototype.toString;
    var NullObject = /* @__PURE__ */ (() => {
      const C = function() {
      };
      C.prototype = /* @__PURE__ */ Object.create(null);
      return C;
    })();
    function parse3(str, options2) {
      const obj = new NullObject();
      const len = str.length;
      if (len < 2)
        return obj;
      const dec = options2?.decode || decode;
      let index17 = 0;
      do {
        const eqIdx = str.indexOf("=", index17);
        if (eqIdx === -1)
          break;
        const colonIdx = str.indexOf(";", index17);
        const endIdx = colonIdx === -1 ? len : colonIdx;
        if (eqIdx > endIdx) {
          index17 = str.lastIndexOf(";", eqIdx - 1) + 1;
          continue;
        }
        const keyStartIdx = startIndex(str, index17, eqIdx);
        const keyEndIdx = endIndex(str, eqIdx, keyStartIdx);
        const key2 = str.slice(keyStartIdx, keyEndIdx);
        if (obj[key2] === void 0) {
          let valStartIdx = startIndex(str, eqIdx + 1, endIdx);
          let valEndIdx = endIndex(str, endIdx, valStartIdx);
          const value = dec(str.slice(valStartIdx, valEndIdx));
          obj[key2] = value;
        }
        index17 = endIdx + 1;
      } while (index17 < len);
      return obj;
    }
    function startIndex(str, index17, max) {
      do {
        const code = str.charCodeAt(index17);
        if (code !== 32 && code !== 9)
          return index17;
      } while (++index17 < max);
      return max;
    }
    function endIndex(str, index17, min) {
      while (index17 > min) {
        const code = str.charCodeAt(--index17);
        if (code !== 32 && code !== 9)
          return index17 + 1;
      }
      return min;
    }
    function serialize2(name, val, options2) {
      const enc = options2?.encode || encodeURIComponent;
      if (!cookieNameRegExp.test(name)) {
        throw new TypeError(`argument name is invalid: ${name}`);
      }
      const value = enc(val);
      if (!cookieValueRegExp.test(value)) {
        throw new TypeError(`argument val is invalid: ${val}`);
      }
      let str = name + "=" + value;
      if (!options2)
        return str;
      if (options2.maxAge !== void 0) {
        if (!Number.isInteger(options2.maxAge)) {
          throw new TypeError(`option maxAge is invalid: ${options2.maxAge}`);
        }
        str += "; Max-Age=" + options2.maxAge;
      }
      if (options2.domain) {
        if (!domainValueRegExp.test(options2.domain)) {
          throw new TypeError(`option domain is invalid: ${options2.domain}`);
        }
        str += "; Domain=" + options2.domain;
      }
      if (options2.path) {
        if (!pathValueRegExp.test(options2.path)) {
          throw new TypeError(`option path is invalid: ${options2.path}`);
        }
        str += "; Path=" + options2.path;
      }
      if (options2.expires) {
        if (!isDate(options2.expires) || !Number.isFinite(options2.expires.valueOf())) {
          throw new TypeError(`option expires is invalid: ${options2.expires}`);
        }
        str += "; Expires=" + options2.expires.toUTCString();
      }
      if (options2.httpOnly) {
        str += "; HttpOnly";
      }
      if (options2.secure) {
        str += "; Secure";
      }
      if (options2.partitioned) {
        str += "; Partitioned";
      }
      if (options2.priority) {
        const priority = typeof options2.priority === "string" ? options2.priority.toLowerCase() : void 0;
        switch (priority) {
          case "low":
            str += "; Priority=Low";
            break;
          case "medium":
            str += "; Priority=Medium";
            break;
          case "high":
            str += "; Priority=High";
            break;
          default:
            throw new TypeError(`option priority is invalid: ${options2.priority}`);
        }
      }
      if (options2.sameSite) {
        const sameSite = typeof options2.sameSite === "string" ? options2.sameSite.toLowerCase() : options2.sameSite;
        switch (sameSite) {
          case true:
          case "strict":
            str += "; SameSite=Strict";
            break;
          case "lax":
            str += "; SameSite=Lax";
            break;
          case "none":
            str += "; SameSite=None";
            break;
          default:
            throw new TypeError(`option sameSite is invalid: ${options2.sameSite}`);
        }
      }
      return str;
    }
    function decode(str) {
      if (str.indexOf("%") === -1)
        return str;
      try {
        return decodeURIComponent(str);
      } catch (e3) {
        return str;
      }
    }
    function isDate(val) {
      return __toString.call(val) === "[object Date]";
    }
  }
});

// node_modules/set-cookie-parser/lib/set-cookie.js
var require_set_cookie = __commonJS({
  "node_modules/set-cookie-parser/lib/set-cookie.js"(exports, module) {
    "use strict";
    var defaultParseOptions = {
      decodeValues: true,
      map: false,
      silent: false
    };
    function isForbiddenKey(key2) {
      return typeof key2 !== "string" || key2 in {};
    }
    function createNullObj() {
      return /* @__PURE__ */ Object.create(null);
    }
    function isNonEmptyString(str) {
      return typeof str === "string" && !!str.trim();
    }
    function parseString2(setCookieValue, options2) {
      var parts = setCookieValue.split(";").filter(isNonEmptyString);
      var nameValuePairStr = parts.shift();
      var parsed = parseNameValuePair(nameValuePairStr);
      var name = parsed.name;
      var value = parsed.value;
      options2 = options2 ? Object.assign({}, defaultParseOptions, options2) : defaultParseOptions;
      if (isForbiddenKey(name)) {
        return null;
      }
      try {
        value = options2.decodeValues ? decodeURIComponent(value) : value;
      } catch (e3) {
        console.error(
          "set-cookie-parser: failed to decode cookie value. Set options.decodeValues=false to disable decoding.",
          e3
        );
      }
      var cookie = createNullObj();
      cookie.name = name;
      cookie.value = value;
      parts.forEach(function(part) {
        var sides = part.split("=");
        var key2 = sides.shift().trimLeft().toLowerCase();
        if (isForbiddenKey(key2)) {
          return;
        }
        var value2 = sides.join("=");
        if (key2 === "expires") {
          cookie.expires = new Date(value2);
        } else if (key2 === "max-age") {
          var n2 = parseInt(value2, 10);
          if (!Number.isNaN(n2))
            cookie.maxAge = n2;
        } else if (key2 === "secure") {
          cookie.secure = true;
        } else if (key2 === "httponly") {
          cookie.httpOnly = true;
        } else if (key2 === "samesite") {
          cookie.sameSite = value2;
        } else if (key2 === "partitioned") {
          cookie.partitioned = true;
        } else if (key2) {
          cookie[key2] = value2;
        }
      });
      return cookie;
    }
    function parseNameValuePair(nameValuePairStr) {
      var name = "";
      var value = "";
      var nameValueArr = nameValuePairStr.split("=");
      if (nameValueArr.length > 1) {
        name = nameValueArr.shift();
        value = nameValueArr.join("=");
      } else {
        value = nameValuePairStr;
      }
      return { name, value };
    }
    function parse3(input, options2) {
      options2 = options2 ? Object.assign({}, defaultParseOptions, options2) : defaultParseOptions;
      if (!input) {
        if (!options2.map) {
          return [];
        } else {
          return createNullObj();
        }
      }
      if (input.headers) {
        if (typeof input.headers.getSetCookie === "function") {
          input = input.headers.getSetCookie();
        } else if (input.headers["set-cookie"]) {
          input = input.headers["set-cookie"];
        } else {
          var sch = input.headers[Object.keys(input.headers).find(function(key2) {
            return key2.toLowerCase() === "set-cookie";
          })];
          if (!sch && input.headers.cookie && !options2.silent) {
            console.warn(
              "Warning: set-cookie-parser appears to have been called on a request object. It is designed to parse Set-Cookie headers from responses, not Cookie headers from requests. Set the option {silent: true} to suppress this warning."
            );
          }
          input = sch;
        }
      }
      if (!Array.isArray(input)) {
        input = [input];
      }
      if (!options2.map) {
        return input.filter(isNonEmptyString).map(function(str) {
          return parseString2(str, options2);
        }).filter(Boolean);
      } else {
        var cookies = createNullObj();
        return input.filter(isNonEmptyString).reduce(function(cookies2, str) {
          var cookie = parseString2(str, options2);
          if (cookie && !isForbiddenKey(cookie.name)) {
            cookies2[cookie.name] = cookie;
          }
          return cookies2;
        }, cookies);
      }
    }
    function splitCookiesString2(cookiesString) {
      if (Array.isArray(cookiesString)) {
        return cookiesString;
      }
      if (typeof cookiesString !== "string") {
        return [];
      }
      var cookiesStrings = [];
      var pos = 0;
      var start;
      var ch;
      var lastComma;
      var nextStart;
      var cookiesSeparatorFound;
      function skipWhitespace() {
        while (pos < cookiesString.length && /\s/.test(cookiesString.charAt(pos))) {
          pos += 1;
        }
        return pos < cookiesString.length;
      }
      function notSpecialChar() {
        ch = cookiesString.charAt(pos);
        return ch !== "=" && ch !== ";" && ch !== ",";
      }
      while (pos < cookiesString.length) {
        start = pos;
        cookiesSeparatorFound = false;
        while (skipWhitespace()) {
          ch = cookiesString.charAt(pos);
          if (ch === ",") {
            lastComma = pos;
            pos += 1;
            skipWhitespace();
            nextStart = pos;
            while (pos < cookiesString.length && notSpecialChar()) {
              pos += 1;
            }
            if (pos < cookiesString.length && cookiesString.charAt(pos) === "=") {
              cookiesSeparatorFound = true;
              pos = nextStart;
              cookiesStrings.push(cookiesString.substring(start, lastComma));
              start = pos;
            } else {
              pos = lastComma + 1;
            }
          } else {
            pos += 1;
          }
        }
        if (!cookiesSeparatorFound || pos >= cookiesString.length) {
          cookiesStrings.push(cookiesString.substring(start, cookiesString.length));
        }
      }
      return cookiesStrings;
    }
    module.exports = parse3;
    module.exports.parse = parse3;
    module.exports.parseString = parseString2;
    module.exports.splitCookiesString = splitCookiesString2;
  }
});

// .svelte-kit/output/server/entries/pages/_layout.server.ts.js
var layout_server_ts_exports = {};
__export(layout_server_ts_exports, {
  load: () => load
});
var load;
var init_layout_server_ts = __esm({
  ".svelte-kit/output/server/entries/pages/_layout.server.ts.js"() {
    init_prisma();
    load = async ({ locals }) => {
      let assets2 = [];
      if (locals.user) {
        const prisma2 = createRequestPrisma({ locals });
        assets2 = await prisma2.asset.findMany({
          include: {
            room: {
              include: {
                site: {
                  select: {
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            name: "asc"
          },
          take: 50
          // Limit to keep it performant
        });
      }
      return {
        user: locals.user ?? null,
        assets: assets2.map((asset) => ({
          id: asset.id,
          name: asset.name,
          room: asset.room ? {
            site: asset.room.site ? {
              name: asset.room.site.name
            } : void 0
          } : void 0
        }))
      };
    };
  }
});

// .svelte-kit/output/server/chunks/stores.js
var getStores, page;
var init_stores = __esm({
  ".svelte-kit/output/server/chunks/stores.js"() {
    init_ssr();
    getStores = () => {
      const stores = getContext("__svelte__");
      return {
        /** @type {typeof page} */
        page: {
          subscribe: stores.page.subscribe
        },
        /** @type {typeof navigating} */
        navigating: {
          subscribe: stores.navigating.subscribe
        },
        /** @type {typeof updated} */
        updated: stores.updated
      };
    };
    page = {
      subscribe(fn) {
        const store = getStores().page;
        return store.subscribe(fn);
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/_layout.svelte.js
var layout_svelte_exports = {};
__export(layout_svelte_exports, {
  default: () => Layout
});
var QuickFAB, Layout;
var init_layout_svelte = __esm({
  ".svelte-kit/output/server/entries/pages/_layout.svelte.js"() {
    init_ssr();
    init_stores();
    init_devalue();
    QuickFAB = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { assets: assets2 = [] } = $$props;
      createEventDispatcher();
      if ($$props.assets === void 0 && $$bindings.assets && assets2 !== void 0)
        $$bindings.assets(assets2);
      return ` ${`<button type="button" class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 lg:hidden" title="Create Work Order" aria-label="Create Work Order" data-svelte-h="svelte-2vdg7u"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button>  <button type="button" class="fixed bottom-6 right-6 z-50 bg-spore-orange hover:bg-spore-orange/90 text-white rounded-full w-16 h-16 flex items-center justify-center shadow-lg hover:shadow-xl transition-all transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 hidden lg:flex" title="Create Work Order" aria-label="Create Work Order" data-svelte-h="svelte-3pnp2f"><svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"></path></svg></button>`}  ${``}`;
    });
    Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let currentPath;
      let user;
      let isAuthPage;
      let isLandingPage;
      let showFAB;
      let $page, $$unsubscribe_page;
      $$unsubscribe_page = subscribe(page, (value) => $page = value);
      let { data } = $$props;
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      currentPath = $page.url.pathname;
      user = data.user;
      isAuthPage = currentPath.startsWith("/auth");
      isLandingPage = currentPath === "/";
      showFAB = user && !isAuthPage && !isLandingPage && !currentPath.startsWith("/work-orders/new");
      $$unsubscribe_page();
      return `${!isAuthPage && !isLandingPage && user ? ` <nav class="bg-spore-dark border-b border-spore-steel/30"><div class="max-w-7xl mx-auto px-4"><div class="flex justify-between h-16"><div class="flex items-center gap-10"> <a href="/dashboard" class="flex items-center gap-2" data-svelte-h="svelte-sc039f"><span class="text-2xl font-extrabold text-spore-cream tracking-tight">SPORE</span> <span class="text-xs font-medium text-spore-steel uppercase tracking-widest">CMMS</span></a>  <div class="hidden md:flex items-center gap-1"><a href="/dashboard" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath === "/dashboard" ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Dashboard</a> <a href="/work-orders" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath.startsWith("/work-orders") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Work Orders</a> <a href="/sites" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath.startsWith("/sites") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Sites</a> <a href="/assets" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath.startsWith("/assets") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Assets</a> ${user.role === "ADMIN" ? `<a href="/users" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath.startsWith("/users") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Users</a> <a href="/audit-log" class="${"px-4 py-2 text-sm font-semibold tracking-wide transition-colors " + escape(
        currentPath.startsWith("/audit-log") ? "text-spore-orange" : "text-spore-cream/70 hover:text-spore-cream",
        true
      )}">Audit Log</a>` : ``}</div></div>  <div class="flex items-center gap-4"><a href="/profile" class="hidden sm:block text-right hover:opacity-80 transition-opacity"><p class="text-sm font-semibold text-spore-cream">${escape(user.firstName || user.email.split("@")[0])}</p> <p class="text-xs text-spore-steel capitalize">${escape(user.role.toLowerCase())}</p></a> <form method="POST" action="/auth/logout" data-svelte-h="svelte-4tekxq"><button type="submit" class="text-sm font-semibold text-spore-cream/50 hover:text-spore-cream transition-colors" title="Sign out of your account">Logout</button></form></div></div></div></nav>  <nav class="md:hidden bg-spore-dark border-b border-spore-steel/30 px-4 py-3 shadow-lg"><div class="flex justify-around items-center"><a href="/dashboard" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
        currentPath === "/dashboard" ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-xl leading-none" data-svelte-h="svelte-n8oaaj">\u{1F4CA}</span> <span class="text-xs font-medium" data-svelte-h="svelte-q6iwf9">Dashboard</span></a> <a href="/work-orders" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
        currentPath.startsWith("/work-orders") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-xl leading-none" data-svelte-h="svelte-ud50em">\u{1F4CB}</span> <span class="text-xs font-medium" data-svelte-h="svelte-t3cpir">Work Orders</span></a> <a href="/sites" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
        currentPath.startsWith("/sites") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-xl leading-none" data-svelte-h="svelte-1oi8lds">\u{1F3E2}</span> <span class="text-xs font-medium" data-svelte-h="svelte-1vga3wp">Sites</span></a> <a href="/assets" class="${"flex flex-col items-center gap-1 px-3 py-2 rounded-lg transition-colors " + escape(
        currentPath.startsWith("/assets") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-xl leading-none" data-svelte-h="svelte-170tr8u">\u2699\uFE0F</span> <span class="text-xs font-medium" data-svelte-h="svelte-1vr39kw">Assets</span></a> ${user.role === "ADMIN" ? `<div class="flex gap-2"><a href="/users" class="${"flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors " + escape(
        currentPath.startsWith("/users") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-lg leading-none" data-svelte-h="svelte-kzuy6d">\u{1F465}</span></a> <a href="/audit-log" class="${"flex flex-col items-center gap-1 px-2 py-2 rounded-lg transition-colors " + escape(
        currentPath.startsWith("/audit-log") ? "text-spore-orange bg-spore-cream/10" : "text-spore-cream/70 hover:text-spore-cream hover:bg-spore-cream/5",
        true
      )}"><span class="text-lg leading-none" data-svelte-h="svelte-r3t20g">\u{1F4DC}</span></a></div>` : ``}</div></nav>` : ``}  <main${add_attribute(
        "class",
        isAuthPage || isLandingPage ? "" : "bg-spore-steel min-h-screen",
        0
      )}>${slots.default ? slots.default({}) : ``}</main>  ${showFAB ? `${validate_component(QuickFAB, "QuickFAB").$$render($$result, { assets: data.assets || [] }, {}, {})}` : ``}`;
    });
  }
});

// .svelte-kit/output/server/nodes/0.js
var __exports = {};
__export(__exports, {
  component: () => component,
  fonts: () => fonts,
  imports: () => imports,
  index: () => index,
  server: () => layout_server_ts_exports,
  server_id: () => server_id,
  stylesheets: () => stylesheets
});
var index, component_cache, component, server_id, imports, stylesheets, fonts;
var init__ = __esm({
  ".svelte-kit/output/server/nodes/0.js"() {
    init_layout_server_ts();
    index = 0;
    component = async () => component_cache ??= (await Promise.resolve().then(() => (init_layout_svelte(), layout_svelte_exports))).default;
    server_id = "src/routes/+layout.server.ts";
    imports = ["_app/immutable/nodes/0.716f7a47.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/stores.a8838f7a.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/each.12b2b3cf.js"];
    stylesheets = ["_app/immutable/assets/0.bcb74662.css"];
    fonts = [];
  }
});

// .svelte-kit/output/server/entries/fallbacks/error.svelte.js
var error_svelte_exports = {};
__export(error_svelte_exports, {
  default: () => Error2
});
var Error2;
var init_error_svelte = __esm({
  ".svelte-kit/output/server/entries/fallbacks/error.svelte.js"() {
    init_ssr();
    init_stores();
    Error2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $page, $$unsubscribe_page;
      $$unsubscribe_page = subscribe(page, (value) => $page = value);
      $$unsubscribe_page();
      return `<h1>${escape($page.status)}</h1> <p>${escape($page.error?.message)}</p>`;
    });
  }
});

// .svelte-kit/output/server/nodes/1.js
var __exports2 = {};
__export(__exports2, {
  component: () => component2,
  fonts: () => fonts2,
  imports: () => imports2,
  index: () => index2,
  stylesheets: () => stylesheets2
});
var index2, component_cache2, component2, imports2, stylesheets2, fonts2;
var init__2 = __esm({
  ".svelte-kit/output/server/nodes/1.js"() {
    index2 = 1;
    component2 = async () => component_cache2 ??= (await Promise.resolve().then(() => (init_error_svelte(), error_svelte_exports))).default;
    imports2 = ["_app/immutable/nodes/1.7d8b155a.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/stores.a8838f7a.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets2 = [];
    fonts2 = [];
  }
});

// .svelte-kit/output/server/entries/pages/_page.server.ts.js
var page_server_ts_exports = {};
__export(page_server_ts_exports, {
  load: () => load2
});
var load2;
var init_page_server_ts = __esm({
  ".svelte-kit/output/server/entries/pages/_page.server.ts.js"() {
    init_chunks();
    init_environment();
    load2 = async ({ locals }) => {
      if (building) {
        return {};
      }
      if (locals.user) {
        throw redirect(302, "/dashboard");
      }
      throw redirect(302, "/auth/login");
    };
  }
});

// .svelte-kit/output/server/entries/pages/_page.svelte.js
var page_svelte_exports = {};
__export(page_svelte_exports, {
  default: () => Page
});
var Page;
var init_page_svelte = __esm({
  ".svelte-kit/output/server/entries/pages/_page.svelte.js"() {
    init_ssr();
    Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      return `${$$result.head += `<!-- HEAD_svelte-du8lua_START -->${$$result.title = `<title>Spore CMMS - Simple Property Maintenance Management</title>`, ""}<meta name="description" content="Simple, mobile-first CMMS for property management. Real-time updates, multi-site support, and intuitive work order management."><!-- HEAD_svelte-du8lua_END -->`, ""}  <div class="min-h-screen bg-gradient-to-br from-spore-dark via-spore-steel to-spore-dark" data-svelte-h="svelte-sd832c"> <section class="px-4 py-20 md:py-32"><div class="max-w-6xl mx-auto text-center"> <div class="flex items-center justify-center gap-3 mb-8"><span class="text-4xl md:text-5xl font-extrabold text-spore-cream tracking-tight">SPORE</span> <span class="text-lg md:text-xl font-medium text-spore-steel uppercase tracking-widest bg-spore-cream/10 px-3 py-1 rounded-full">CMMS</span></div>  <h1 class="text-4xl md:text-6xl font-extrabold text-spore-cream mb-6 leading-tight">Simple CMMS for<br> <span class="text-spore-orange">Property Management</span></h1>  <p class="text-xl md:text-2xl text-spore-cream/80 mb-12 max-w-3xl mx-auto leading-relaxed">Streamline maintenance operations with real-time updates, mobile-first design, and multi-site support. Built for property managers who need efficiency without complexity.</p>  <div class="flex flex-col sm:flex-row gap-4 justify-center items-center"><a href="/auth/login" class="bg-spore-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-orange/90 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 transition-all transform hover:scale-105 shadow-lg">Try the Demo</a> <a href="#features" class="border-2 border-spore-cream/30 text-spore-cream px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-cream/10 focus:outline-none focus:ring-4 focus:ring-spore-cream/20 transition-all">Learn More</a></div></div></section>  <section id="features" class="px-4 py-20 bg-spore-steel/30"><div class="max-w-6xl mx-auto"><h2 class="text-3xl md:text-4xl font-extrabold text-spore-cream text-center mb-16">Built for Property Teams</h2> <div class="grid md:grid-cols-3 gap-8"> <div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors"><div class="text-4xl mb-4">\u{1F4F1}</div> <h3 class="text-xl font-bold text-spore-cream mb-3">Mobile-First Design</h3> <p class="text-spore-cream/70 leading-relaxed">Work orders, updates, and communications work seamlessly on any device. Perfect for field teams who need to stay connected from anywhere.</p></div>  <div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors"><div class="text-4xl mb-4">\u26A1</div> <h3 class="text-xl font-bold text-spore-cream mb-3">Real-Time Updates</h3> <p class="text-spore-cream/70 leading-relaxed">Instant notifications when work orders are created, assigned, or completed. Keep your entire team in sync without constant check-ins.</p></div>  <div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors"><div class="text-4xl mb-4">\u{1F3E2}</div> <h3 class="text-xl font-bold text-spore-cream mb-3">Multi-Site Support</h3> <p class="text-spore-cream/70 leading-relaxed">Manage multiple properties, buildings, and assets from a single dashboard. Organize by location with room-level tracking.</p></div></div>  <div class="grid md:grid-cols-2 gap-8 mt-8"><div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors"><div class="text-3xl mb-4">\u{1F527}</div> <h3 class="text-xl font-bold text-spore-cream mb-3">Asset Management</h3> <p class="text-spore-cream/70 leading-relaxed">Track equipment, maintenance history, and failure patterns. Prevent breakdowns with proactive maintenance scheduling.</p></div> <div class="bg-spore-dark rounded-2xl p-8 border border-spore-steel/50 hover:border-spore-orange/50 transition-colors"><div class="text-3xl mb-4">\u{1F4CA}</div> <h3 class="text-xl font-bold text-spore-cream mb-3">Simple Analytics</h3> <p class="text-spore-cream/70 leading-relaxed">Dashboard insights into work order status, team performance, and maintenance trends. Make data-driven decisions without complexity.</p></div></div></div></section>  <section class="px-4 py-20"><div class="max-w-4xl mx-auto text-center"><h2 class="text-3xl md:text-4xl font-extrabold text-spore-cream mb-6">Ready to simplify<br> <span class="text-spore-orange">property maintenance?</span></h2> <p class="text-xl text-spore-cream/80 mb-12">Try the demo to see how Spore CMMS can transform your maintenance operations.</p> <a href="/auth/login" class="bg-spore-orange text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-spore-orange/90 focus:outline-none focus:ring-4 focus:ring-spore-orange/50 transition-all transform hover:scale-105 shadow-lg inline-block">Start Free Demo</a></div></section>  <footer class="px-4 py-12 border-t border-spore-steel/50"><div class="max-w-6xl mx-auto"><div class="flex flex-col md:flex-row justify-between items-center"><div class="flex items-center gap-2 mb-4 md:mb-0"><span class="text-xl font-extrabold text-spore-cream">SPORE</span> <span class="text-sm font-medium text-spore-steel uppercase tracking-widest">CMMS</span></div> <div class="text-sm text-spore-cream/60">\xA9 2024 Spore Intelligent Systems. Built for property teams.</div></div></div></footer></div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/2.js
var __exports3 = {};
__export(__exports3, {
  component: () => component3,
  fonts: () => fonts3,
  imports: () => imports3,
  index: () => index3,
  server: () => page_server_ts_exports,
  server_id: () => server_id2,
  stylesheets: () => stylesheets3
});
var index3, component_cache3, component3, server_id2, imports3, stylesheets3, fonts3;
var init__3 = __esm({
  ".svelte-kit/output/server/nodes/2.js"() {
    init_page_server_ts();
    index3 = 2;
    component3 = async () => component_cache3 ??= (await Promise.resolve().then(() => (init_page_svelte(), page_svelte_exports))).default;
    server_id2 = "src/routes/+page.server.ts";
    imports3 = ["_app/immutable/nodes/2.fbfc9181.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js"];
    stylesheets3 = [];
    fonts3 = [];
  }
});

// .svelte-kit/output/server/chunks/guards.js
function requireAuth(event) {
  if (!event.locals.user) {
    throw redirect(303, "/auth/login");
  }
}
function isAdmin(event) {
  return event.locals.user?.role === "ADMIN";
}
function isManagerOrAbove(event) {
  const role = event.locals.user?.role;
  return role === "ADMIN" || role === "MANAGER";
}
var init_guards = __esm({
  ".svelte-kit/output/server/chunks/guards.js"() {
    init_chunks();
  }
});

// .svelte-kit/output/server/chunks/audit.js
async function logAudit(userId, action, details) {
  try {
    await prisma.auditLog.create({
      data: {
        userId,
        action,
        details: details || null
      }
    });
  } catch (e3) {
    console.error("Audit log failed:", e3);
  }
}
var init_audit = __esm({
  ".svelte-kit/output/server/chunks/audit.js"() {
    init_prisma();
  }
});

// .svelte-kit/output/server/entries/pages/assets/_page.server.ts.js
var page_server_ts_exports2 = {};
__export(page_server_ts_exports2, {
  actions: () => actions,
  load: () => load3
});
var load3, actions;
var init_page_server_ts2 = __esm({
  ".svelte-kit/output/server/entries/pages/assets/_page.server.ts.js"() {
    init_prisma();
    init_chunks();
    init_guards();
    init_audit();
    load3 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const roomFilter = event.url.searchParams.get("room");
      const assets2 = await prisma2.asset.findMany({
        where: roomFilter ? { roomId: roomFilter } : void 0,
        orderBy: { createdAt: "desc" },
        include: {
          room: {
            include: {
              site: {
                select: { name: true }
              }
            }
          },
          _count: {
            select: { workOrders: true }
          }
        }
      });
      const rooms = await prisma2.room.findMany({
        orderBy: [
          { site: { name: "asc" } },
          { building: "asc" },
          { name: "asc" }
        ],
        include: {
          site: {
            select: { name: true }
          }
        }
      });
      return { assets: assets2, rooms, roomFilter };
    };
    actions = {
      create: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const name = formData2.get("name");
        const roomId = formData2.get("roomId");
        if (!name || name.trim() === "") {
          return fail(400, { error: "Asset name is required" });
        }
        if (!roomId) {
          return fail(400, { error: "Room is required" });
        }
        const asset = await prisma2.asset.create({
          data: {
            name: name.trim(),
            roomId
          }
        });
        await logAudit(event.locals.user.id, "ASSET_CREATED", {
          assetId: asset.id,
          name: asset.name,
          roomId
        });
        return { success: true, asset };
      },
      delete: async (event) => {
        if (!isManagerOrAbove(event)) {
          return fail(403, { error: "Permission denied. Only managers can delete assets." });
        }
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const assetId = formData2.get("assetId");
        if (!assetId) {
          return fail(400, { error: "Asset ID is required" });
        }
        const asset = await prisma2.asset.findUnique({
          where: { id: assetId },
          select: { name: true }
        });
        await prisma2.asset.delete({
          where: { id: assetId }
        });
        await logAudit(event.locals.user.id, "ASSET_DELETED", {
          assetId,
          name: asset?.name
        });
        return { success: true };
      },
      update: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const assetId = formData2.get("assetId");
        const name = formData2.get("name");
        const roomId = formData2.get("roomId");
        if (!assetId) {
          return fail(400, { error: "Asset ID is required" });
        }
        if (!name || name.trim() === "") {
          return fail(400, { error: "Asset name is required" });
        }
        if (!roomId) {
          return fail(400, { error: "Room is required" });
        }
        const asset = await prisma2.asset.update({
          where: { id: assetId },
          data: {
            name: name.trim(),
            roomId
          }
        });
        return { success: true, asset };
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/assets/_page.svelte.js
var page_svelte_exports2 = {};
__export(page_svelte_exports2, {
  default: () => Page2
});
var Page2;
var init_page_svelte2 = __esm({
  ".svelte-kit/output/server/entries/pages/assets/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page2 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let assets2;
      let rooms;
      let roomFilter;
      let { data } = $$props;
      let editingAssetId = null;
      let editingAsset = { name: "", roomId: "" };
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      assets2 = data.assets || [];
      rooms = data.rooms || [];
      roomFilter = data.roomFilter;
      return `${$$result.head += `<!-- HEAD_svelte-5egb08_START -->${$$result.title = `<title>Assets \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-5egb08_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-b9dnm5">Assets</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${roomFilter ? `Showing assets for selected room
					<button class="ml-2 text-spore-orange hover:underline" data-svelte-h="svelte-1pi4qp5">Clear filter</button>` : `${escape(assets2.length)} total asset${escape(assets2.length !== 1 ? "s" : "")}`}</p></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ NEW ASSET")}</button></div>  ${``}  ${assets2.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark" data-svelte-h="svelte-184b13d"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Asset</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Location</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Work Orders</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Created</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(assets2, (asset) => {
        return `${editingAssetId === asset.id ? ` <tr class="bg-spore-orange/10"><td class="px-6 py-4" colspan="5"><form method="POST" action="?/update" class="flex flex-wrap items-center gap-4"><input type="hidden" name="assetId"${add_attribute("value", asset.id, 0)}> <input type="text" name="name" class="flex-1 min-w-[200px] px-3 py-2 rounded border border-spore-orange bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange" required${add_attribute("value", editingAsset.name, 0)}> <select name="roomId" class="px-3 py-2 rounded border border-spore-orange bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange" required>${each(rooms, (room) => {
          return `<option${add_attribute("value", room.id, 0)}>${escape(room.site?.name)} - Room ${escape(room.name)} </option>`;
        })}</select> <button type="submit" ${!editingAsset.name.trim() ? "disabled" : ""} class="bg-spore-forest text-white px-4 py-2 rounded font-bold text-xs hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("SAVE")}</button> <button type="button" class="px-4 py-2 rounded font-bold text-xs text-spore-steel hover:bg-spore-cream transition-colors" data-svelte-h="svelte-1bnvh8x">CANCEL</button> </form></td> </tr>` : ` <tr class="hover:bg-spore-cream/20 transition-colors group"><td class="px-6 py-4 whitespace-nowrap"><a href="${"/assets/" + escape(asset.id, true)}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors">${escape(asset.name)} </a></td> <td class="px-6 py-4 whitespace-nowrap"><div class="text-sm text-spore-steel"><span class="font-medium">${escape(asset.room?.site?.name || "Unknown")}</span> <br> <span class="text-xs">Room ${escape(asset.room?.name || "N/A")} ${escape(asset.room?.building ? ` \u2022 Bldg ${asset.room.building}` : "")} ${escape(asset.room?.floor ? ` \u2022 Floor ${asset.room.floor}` : "")}</span> </div></td> <td class="px-6 py-4 whitespace-nowrap">${asset._count?.workOrders > 0 ? `<span class="px-3 py-1 text-xs font-bold rounded-full bg-spore-orange/10 text-spore-orange">${escape(asset._count.workOrders)} WO${escape(asset._count.workOrders !== 1 ? "s" : "")} </span>` : `<span class="text-sm text-spore-steel/50" data-svelte-h="svelte-gnhnj2">None</span>`}</td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(new Date(asset.createdAt).toLocaleDateString())}</td> <td class="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-3"><a href="${"/assets/" + escape(asset.id, true)}" class="text-spore-forest hover:text-spore-forest/70 transition-colors">View</a> <button class="text-spore-orange hover:text-spore-orange/70 transition-colors" data-svelte-h="svelte-1u2ikol">Edit</button> <form method="POST" action="?/delete" class="inline"><input type="hidden" name="assetId"${add_attribute("value", asset.id, 0)}> <button type="submit" class="text-red-500 hover:text-red-400 transition-colors" data-svelte-h="svelte-1aobehf">Delete</button> </form></td> </tr>`}`;
      })}</tbody></table></div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1mat6ie">\u2699\uFE0F</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-xz11x2">No assets yet</h3> <p class="text-spore-steel mb-6">${roomFilter ? `No assets in this room` : `Create your first asset to start tracking equipment`}</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-ulaxo0">+ CREATE ASSET</button></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/3.js
var __exports4 = {};
__export(__exports4, {
  component: () => component4,
  fonts: () => fonts4,
  imports: () => imports4,
  index: () => index4,
  server: () => page_server_ts_exports2,
  server_id: () => server_id3,
  stylesheets: () => stylesheets4
});
var index4, component_cache4, component4, server_id3, imports4, stylesheets4, fonts4;
var init__4 = __esm({
  ".svelte-kit/output/server/nodes/3.js"() {
    init_page_server_ts2();
    index4 = 3;
    component4 = async () => component_cache4 ??= (await Promise.resolve().then(() => (init_page_svelte2(), page_svelte_exports2))).default;
    server_id3 = "src/routes/assets/+page.server.ts";
    imports4 = ["_app/immutable/nodes/3.469b072a.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets4 = [];
    fonts4 = [];
  }
});

// .svelte-kit/output/server/entries/pages/assets/_id_/_page.server.ts.js
var page_server_ts_exports3 = {};
__export(page_server_ts_exports3, {
  actions: () => actions2,
  load: () => load4
});
var load4, actions2;
var init_page_server_ts3 = __esm({
  ".svelte-kit/output/server/entries/pages/assets/_id_/_page.server.ts.js"() {
    init_prisma();
    init_chunks();
    init_guards();
    load4 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const { id } = event.params;
      const asset = await prisma2.asset.findUnique({
        where: { id },
        include: {
          room: {
            include: {
              site: { select: { id: true, name: true } }
            }
          },
          workOrders: {
            orderBy: { createdAt: "desc" },
            take: 20,
            select: {
              id: true,
              title: true,
              status: true,
              failureMode: true,
              createdAt: true,
              updatedAt: true
            }
          },
          _count: {
            select: { workOrders: true }
          }
        }
      });
      if (!asset) {
        throw error(404, "Asset not found");
      }
      const rooms = await prisma2.room.findMany({
        orderBy: [
          { site: { name: "asc" } },
          { building: "asc" },
          { name: "asc" }
        ],
        include: {
          site: { select: { name: true } }
        }
      });
      const [totalWO, pendingWO, inProgressWO, completedWO] = await Promise.all([
        prisma2.workOrder.count({ where: { assetId: id } }),
        prisma2.workOrder.count({ where: { assetId: id, status: "PENDING" } }),
        prisma2.workOrder.count({ where: { assetId: id, status: "IN_PROGRESS" } }),
        prisma2.workOrder.count({ where: { assetId: id, status: "COMPLETED" } })
      ]);
      return {
        asset,
        rooms,
        woStats: { total: totalWO, pending: pendingWO, inProgress: inProgressWO, completed: completedWO }
      };
    };
    actions2 = {
      update: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const { id } = event.params;
        const name = formData2.get("name");
        const roomId = formData2.get("roomId");
        if (!name || name.trim() === "") {
          return fail(400, { error: "Asset name is required" });
        }
        if (!roomId) {
          return fail(400, { error: "Room is required" });
        }
        const asset = await prisma2.asset.update({
          where: { id },
          data: {
            name: name.trim(),
            roomId
          }
        });
        return { success: true, asset };
      },
      delete: async (event) => {
        if (!isManagerOrAbove(event)) {
          return fail(403, { error: "Permission denied. Only managers can delete assets." });
        }
        const prisma2 = createRequestPrisma(event);
        const { id } = event.params;
        await prisma2.asset.delete({
          where: { id }
        });
        throw redirect(303, "/assets");
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/assets/_id_/_page.svelte.js
var page_svelte_exports3 = {};
__export(page_svelte_exports3, {
  default: () => Page3
});
function getStatusColor(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-spore-forest text-white";
    case "IN_PROGRESS":
      return "bg-spore-orange text-white";
    case "PENDING":
      return "bg-spore-steel text-white";
    case "ON_HOLD":
      return "bg-spore-cream text-spore-steel";
    case "CANCELLED":
      return "bg-red-600 text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
var Page3;
var init_page_svelte3 = __esm({
  ".svelte-kit/output/server/entries/pages/assets/_id_/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page3 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let asset;
      let woStats;
      let { data } = $$props;
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      asset = data.asset;
      data.rooms || [];
      woStats = data.woStats;
      return `<div class="max-w-4xl mx-auto px-4 py-10"> <div class="mb-6" data-svelte-h="svelte-c9soqw"><a href="/assets" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">\u2190 Back to Assets</a></div> ${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(asset.name)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">${escape(asset.room?.site?.name)} \u2022 Room ${escape(asset.room?.name)} ${asset.room?.building ? `\u2022 Bldg ${escape(asset.room.building)}` : ``} ${asset.room?.floor ? `\u2022 Floor ${escape(asset.room.floor)}` : ``}</p></div> <div class="flex gap-2"><button class="bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" data-svelte-h="svelte-9ofjog">EDIT</button> <form method="POST" action="?/delete" data-svelte-h="svelte-8pxr33"><button type="submit" class="px-4 py-2 rounded-lg font-bold text-sm text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-colors" onclick="return confirm('Delete this asset? All associated work orders will also be deleted.')">DELETE</button></form></div></div></div>  <div class="grid grid-cols-2 sm:grid-cols-4 border-b border-spore-cream"><div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-dark">${escape(woStats.total)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-14h9nd3">Total WOs</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-steel">${escape(woStats.pending)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-vg7ifd">Pending</p></div> <div class="p-4 text-center border-r border-spore-cream"><p class="text-2xl font-extrabold text-spore-orange">${escape(woStats.inProgress)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-bf56gq">In Progress</p></div> <div class="p-4 text-center"><p class="text-2xl font-extrabold text-spore-forest">${escape(woStats.completed)}</p> <p class="text-xs font-bold text-spore-steel uppercase" data-svelte-h="svelte-300hz3">Completed</p></div></div>  <div class="p-6"><div class="flex justify-between items-center mb-4"><h2 class="text-lg font-bold text-spore-dark" data-svelte-h="svelte-1ez9epy">Work Order History</h2> <a href="${"/work-orders?asset=" + escape(asset.id, true)}" class="text-sm font-bold text-spore-orange hover:text-spore-orange/80">View All \u2192</a></div> ${asset.workOrders && asset.workOrders.length > 0 ? `<div class="space-y-3">${each(asset.workOrders, (wo) => {
        return `<a href="${"/work-orders/" + escape(wo.id, true)}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"><div class="flex-1 min-w-0"><p class="font-bold text-spore-dark truncate">${escape(wo.title)}</p> <p class="text-xs text-spore-steel mt-1">${escape(wo.failureMode || "General")} \u2022 ${escape(new Date(wo.createdAt).toLocaleDateString())} </p></div> <span class="${"ml-4 px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor(wo.status), true)}">${escape(wo.status.replace("_", " "))}</span> </a>`;
      })}</div>` : `<div class="text-center py-8 bg-spore-cream/20 rounded-lg" data-svelte-h="svelte-1gkpby5"><p class="text-spore-steel">No work orders for this asset</p> <a href="/work-orders" class="inline-block mt-4 bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 transition-colors">Create Work Order</a></div>`}</div></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/4.js
var __exports5 = {};
__export(__exports5, {
  component: () => component5,
  fonts: () => fonts5,
  imports: () => imports5,
  index: () => index5,
  server: () => page_server_ts_exports3,
  server_id: () => server_id4,
  stylesheets: () => stylesheets5
});
var index5, component_cache5, component5, server_id4, imports5, stylesheets5, fonts5;
var init__5 = __esm({
  ".svelte-kit/output/server/nodes/4.js"() {
    init_page_server_ts3();
    index5 = 4;
    component5 = async () => component_cache5 ??= (await Promise.resolve().then(() => (init_page_svelte3(), page_svelte_exports3))).default;
    server_id4 = "src/routes/assets/[id]/+page.server.ts";
    imports5 = ["_app/immutable/nodes/4.e0e52526.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets5 = [];
    fonts5 = [];
  }
});

// .svelte-kit/output/server/entries/pages/audit-log/_page.server.ts.js
var page_server_ts_exports4 = {};
__export(page_server_ts_exports4, {
  load: () => load5
});
var load5;
var init_page_server_ts4 = __esm({
  ".svelte-kit/output/server/entries/pages/audit-log/_page.server.ts.js"() {
    init_prisma();
    init_chunks();
    init_guards();
    load5 = async (event) => {
      if (!isAdmin(event)) {
        throw error(403, "Access denied. Admin privileges required.");
      }
      const orgId = event.locals.user.orgId;
      const page2 = parseInt(event.url.searchParams.get("page") || "1");
      const limit = 50;
      const skip = (page2 - 1) * limit;
      const auditLogs = await prisma.auditLog.findMany({
        where: {
          user: { orgId }
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true
            }
          }
        }
      });
      const totalCount = await prisma.auditLog.count({
        where: {
          user: { orgId }
        }
      });
      const totalPages = Math.ceil(totalCount / limit);
      return {
        auditLogs,
        page: page2,
        totalPages,
        totalCount
      };
    };
  }
});

// .svelte-kit/output/server/entries/pages/audit-log/_page.svelte.js
var page_svelte_exports4 = {};
__export(page_svelte_exports4, {
  default: () => Page4
});
function getUserName(user) {
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email;
}
function formatAction(action) {
  return action.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c2) => c2.toUpperCase());
}
function getActionColor(action) {
  if (action.includes("DELETED"))
    return "text-red-500";
  if (action.includes("CREATED"))
    return "text-spore-forest";
  if (action.includes("CHANGED") || action.includes("ASSIGNED"))
    return "text-spore-orange";
  return "text-spore-steel";
}
function formatDetails(details) {
  if (!details)
    return "";
  if (typeof details === "object") {
    return Object.entries(details).filter(([_, v]) => v != null).map(([k2, v]) => `${k2}: ${v}`).join(", ");
  }
  return String(details);
}
var Page4;
var init_page_svelte4 = __esm({
  ".svelte-kit/output/server/entries/pages/audit-log/_page.svelte.js"() {
    init_ssr();
    Page4 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let auditLogs;
      let page2;
      let totalPages;
      let { data } = $$props;
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      auditLogs = data.auditLogs || [];
      page2 = data.page;
      totalPages = data.totalPages;
      return `${$$result.head += `<!-- HEAD_svelte-111n33w_START -->${$$result.title = `<title>Audit Log \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-111n33w_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"><div class="mb-8" data-svelte-h="svelte-o4yp00"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Audit Log</h1> <p class="text-spore-cream/60 mt-2">Track all changes made in your organization</p></div> ${auditLogs.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark" data-svelte-h="svelte-jysngp"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">When</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Who</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Action</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Details</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(auditLogs, (log) => {
        return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel"><time${add_attribute("datetime", log.createdAt.toString(), 0)}>${escape(new Date(log.createdAt).toLocaleString())} </time></td> <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-spore-dark">${escape(getUserName(log.user))}</td> <td class="px-6 py-4 whitespace-nowrap"><span class="${"text-sm font-bold " + escape(getActionColor(log.action), true)}">${escape(formatAction(log.action))} </span></td> <td class="px-6 py-4 text-sm text-spore-steel max-w-md truncate"${add_attribute("title", formatDetails(log.details), 0)}>${escape(formatDetails(log.details))}</td> </tr>`;
      })}</tbody></table></div></div>  ${totalPages > 1 ? `<div class="flex justify-center gap-2 mt-6">${page2 > 1 ? `<a href="${"/audit-log?page=" + escape(page2 - 1, true)}" class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold">\u2190 Previous</a>` : ``} <span class="px-4 py-2 text-spore-cream/60 text-sm">Page ${escape(page2)} of ${escape(totalPages)}</span> ${page2 < totalPages ? `<a href="${"/audit-log?page=" + escape(page2 + 1, true)}" class="px-4 py-2 bg-spore-white text-spore-steel rounded-lg hover:bg-spore-cream transition-colors text-sm font-bold">Next \u2192</a>` : ``}</div>` : ``}` : `<div class="text-center py-16 bg-spore-white rounded-xl" data-svelte-h="svelte-7g3wy2"><div class="text-5xl mb-4">\u{1F4DC}</div> <h3 class="text-xl font-bold text-spore-dark mb-2">No activity yet</h3> <p class="text-spore-steel">Actions will be recorded here as users make changes</p></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/5.js
var __exports6 = {};
__export(__exports6, {
  component: () => component6,
  fonts: () => fonts6,
  imports: () => imports6,
  index: () => index6,
  server: () => page_server_ts_exports4,
  server_id: () => server_id5,
  stylesheets: () => stylesheets6
});
var index6, component_cache6, component6, server_id5, imports6, stylesheets6, fonts6;
var init__6 = __esm({
  ".svelte-kit/output/server/nodes/5.js"() {
    init_page_server_ts4();
    index6 = 5;
    component6 = async () => component_cache6 ??= (await Promise.resolve().then(() => (init_page_svelte4(), page_svelte_exports4))).default;
    server_id5 = "src/routes/audit-log/+page.server.ts";
    imports6 = ["_app/immutable/nodes/5.7177f4d3.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js"];
    stylesheets6 = [];
    fonts6 = [];
  }
});

// .svelte-kit/output/server/entries/pages/auth/login/_page.server.ts.js
var page_server_ts_exports5 = {};
__export(page_server_ts_exports5, {
  actions: () => actions3,
  load: () => load6
});
var load6, actions3;
var init_page_server_ts5 = __esm({
  ".svelte-kit/output/server/entries/pages/auth/login/_page.server.ts.js"() {
    init_chunks();
    init_auth();
    init_prisma();
    load6 = async ({ locals }) => {
      if (locals.user) {
        throw redirect(303, "/dashboard");
      }
      return {};
    };
    actions3 = {
      default: async ({ request, cookies }) => {
        try {
          const formData2 = await request.formData();
          const email = formData2.get("email");
          const password = formData2.get("password");
          if (!email || !password) {
            return fail(400, { error: "Email and password are required", email });
          }
          const user = await prisma.user.findUnique({
            where: { email: email.toLowerCase().trim() }
          });
          if (!user) {
            return fail(400, { error: "Invalid email or password", email });
          }
          const valid = await verifyPassword(password, user.password);
          if (!valid) {
            return fail(400, { error: "Invalid email or password", email });
          }
          const sessionId = await createSession(user.id);
          setSessionCookie(cookies, sessionId);
          throw redirect(303, "/dashboard");
        } catch (error2) {
          if (error2 && typeof error2 === "object" && "location" in error2) {
            throw error2;
          }
          console.error("Login error:", error2);
          const emailValue = formData?.get("email");
          return fail(500, {
            error: "An unexpected error occurred. Please try again.",
            email: emailValue
          });
        }
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/auth/login/_page.svelte.js
var page_svelte_exports5 = {};
__export(page_svelte_exports5, {
  default: () => Page5
});
var Page5;
var init_page_svelte5 = __esm({
  ".svelte-kit/output/server/entries/pages/auth/login/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page5 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { form } = $$props;
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      return `<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4"><div class="max-w-md w-full"> <div class="text-center mb-8" data-svelte-h="svelte-498r17"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">\u{1F33F} SPORE</h1> <p class="text-spore-cream/60 mt-2">Maintenance Management System</p></div>  <div class="bg-spore-white rounded-xl p-8"><h2 class="text-2xl font-bold text-spore-dark mb-6" data-svelte-h="svelte-18b8pfu">Sign In</h2> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">${escape(form.error)}</div>` : ``} <form method="POST" class="space-y-5"><div><label for="email" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-15zf06q">Email</label> <input type="email" id="email" name="email"${add_attribute("value", form?.email ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="you@example.com" required></div> <div data-svelte-h="svelte-eokk8v"><label for="password" class="block text-sm font-bold text-spore-steel mb-2">Password</label> <input type="password" id="password" name="password" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required></div> <button type="submit" ${""} class="w-full bg-spore-forest text-white py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("SIGN IN")}</button></form> <div class="mt-6 text-center" data-svelte-h="svelte-3lw5hn"><p class="text-sm text-spore-steel">Don&#39;t have an account? 
					<a href="/auth/register" class="text-spore-orange font-bold hover:underline">Create one</a></p></div></div></div></div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/6.js
var __exports7 = {};
__export(__exports7, {
  component: () => component7,
  fonts: () => fonts7,
  imports: () => imports7,
  index: () => index7,
  server: () => page_server_ts_exports5,
  server_id: () => server_id6,
  stylesheets: () => stylesheets7
});
var index7, component_cache7, component7, server_id6, imports7, stylesheets7, fonts7;
var init__7 = __esm({
  ".svelte-kit/output/server/nodes/6.js"() {
    init_page_server_ts5();
    index7 = 6;
    component7 = async () => component_cache7 ??= (await Promise.resolve().then(() => (init_page_svelte5(), page_svelte_exports5))).default;
    server_id6 = "src/routes/auth/login/+page.server.ts";
    imports7 = ["_app/immutable/nodes/6.5b21f2a0.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets7 = [];
    fonts7 = [];
  }
});

// .svelte-kit/output/server/entries/pages/auth/logout/_page.server.ts.js
var page_server_ts_exports6 = {};
__export(page_server_ts_exports6, {
  actions: () => actions4
});
var actions4;
var init_page_server_ts6 = __esm({
  ".svelte-kit/output/server/entries/pages/auth/logout/_page.server.ts.js"() {
    init_chunks();
    init_auth();
    actions4 = {
      default: async ({ cookies }) => {
        await destroySession(cookies);
        throw redirect(303, "/auth/login");
      }
    };
  }
});

// .svelte-kit/output/server/nodes/7.js
var __exports8 = {};
__export(__exports8, {
  fonts: () => fonts8,
  imports: () => imports8,
  index: () => index8,
  server: () => page_server_ts_exports6,
  server_id: () => server_id7,
  stylesheets: () => stylesheets8
});
var index8, server_id7, imports8, stylesheets8, fonts8;
var init__8 = __esm({
  ".svelte-kit/output/server/nodes/7.js"() {
    init_page_server_ts6();
    index8 = 7;
    server_id7 = "src/routes/auth/logout/+page.server.ts";
    imports8 = [];
    stylesheets8 = [];
    fonts8 = [];
  }
});

// .svelte-kit/output/server/entries/pages/auth/register/_page.server.ts.js
var page_server_ts_exports7 = {};
__export(page_server_ts_exports7, {
  actions: () => actions5,
  load: () => load7
});
var load7, actions5;
var init_page_server_ts7 = __esm({
  ".svelte-kit/output/server/entries/pages/auth/register/_page.server.ts.js"() {
    init_chunks();
    init_auth();
    init_prisma();
    load7 = async ({ locals }) => {
      if (locals.user) {
        throw redirect(303, "/dashboard");
      }
      return {};
    };
    actions5 = {
      default: async ({ request, cookies }) => {
        const formData2 = await request.formData();
        const orgName = formData2.get("orgName");
        const firstName = formData2.get("firstName");
        const lastName = formData2.get("lastName");
        const email = formData2.get("email");
        const password = formData2.get("password");
        const confirmPassword = formData2.get("confirmPassword");
        if (!orgName?.trim()) {
          return fail(400, { error: "Organization name is required", orgName, firstName, lastName, email });
        }
        if (!firstName?.trim()) {
          return fail(400, { error: "First name is required", orgName, firstName, lastName, email });
        }
        if (!email?.trim()) {
          return fail(400, { error: "Email is required", orgName, firstName, lastName, email });
        }
        if (!password || password.length < 8) {
          return fail(400, { error: "Password must be at least 8 characters", orgName, firstName, lastName, email });
        }
        if (password !== confirmPassword) {
          return fail(400, { error: "Passwords do not match", orgName, firstName, lastName, email });
        }
        const existingUser = await prisma.user.findUnique({
          where: { email: email.toLowerCase().trim() }
        });
        if (existingUser) {
          return fail(400, { error: "An account with this email already exists", orgName, firstName, lastName, email });
        }
        const hashedPassword = await hashPassword(password);
        const { user } = await prisma.$transaction(async (tx) => {
          const org = await tx.org.create({
            data: { name: orgName.trim() }
          });
          const user2 = await tx.user.create({
            data: {
              email: email.toLowerCase().trim(),
              password: hashedPassword,
              firstName: firstName.trim(),
              lastName: lastName?.trim() || null,
              role: "ADMIN",
              orgId: org.id
            }
          });
          return { org, user: user2 };
        });
        const sessionId = await createSession(user.id);
        setSessionCookie(cookies, sessionId);
        throw redirect(303, "/dashboard");
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/auth/register/_page.svelte.js
var page_svelte_exports6 = {};
__export(page_svelte_exports6, {
  default: () => Page6
});
var Page6;
var init_page_svelte6 = __esm({
  ".svelte-kit/output/server/entries/pages/auth/register/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page6 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { form } = $$props;
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      return `<div class="min-h-screen bg-spore-dark flex items-center justify-center px-4 py-8"><div class="max-w-md w-full"> <div class="text-center mb-8" data-svelte-h="svelte-n6ncso"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">\u{1F33F} SPORE</h1> <p class="text-spore-cream/60 mt-2">Create your account</p></div>  <div class="bg-spore-white rounded-xl p-8"><h2 class="text-2xl font-bold text-spore-dark mb-6" data-svelte-h="svelte-1kcjb2h">Get Started</h2> ${form?.error ? `<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6 text-sm">${escape(form.error)}</div>` : ``} <form method="POST" class="space-y-5"> <div><label for="orgName" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-1gz9jof">Organization Name</label> <input type="text" id="orgName" name="orgName"${add_attribute("value", form?.orgName ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="Sunrise Senior Living" required></div>  <div class="grid grid-cols-2 gap-4"><div><label for="firstName" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-1mte4f6">First Name</label> <input type="text" id="firstName" name="firstName"${add_attribute("value", form?.firstName ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" required></div> <div><label for="lastName" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-wwlx0">Last Name</label> <input type="text" id="lastName" name="lastName"${add_attribute("value", form?.lastName ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"></div></div>  <div><label for="email" class="block text-sm font-bold text-spore-steel mb-2" data-svelte-h="svelte-15zf06q">Email</label> <input type="email" id="email" name="email"${add_attribute("value", form?.email ?? "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="you@example.com" required></div>  <div data-svelte-h="svelte-hjst8c"><label for="password" class="block text-sm font-bold text-spore-steel mb-2">Password</label> <input type="password" id="password" name="password" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" minlength="8" required> <p class="text-xs text-spore-steel mt-1">Minimum 8 characters</p></div>  <div data-svelte-h="svelte-18r9lc3"><label for="confirmPassword" class="block text-sm font-bold text-spore-steel mb-2">Confirm Password</label> <input type="password" id="confirmPassword" name="confirmPassword" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange" placeholder="\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" required></div> <button type="submit" ${""} class="w-full bg-spore-forest text-white py-3 rounded-lg font-bold text-sm tracking-wide hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("CREATE ACCOUNT")}</button></form> <div class="mt-6 text-center" data-svelte-h="svelte-1dpl13j"><p class="text-sm text-spore-steel">Already have an account? 
					<a href="/auth/login" class="text-spore-orange font-bold hover:underline">Sign in</a></p></div></div></div></div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/8.js
var __exports9 = {};
__export(__exports9, {
  component: () => component8,
  fonts: () => fonts9,
  imports: () => imports9,
  index: () => index9,
  server: () => page_server_ts_exports7,
  server_id: () => server_id8,
  stylesheets: () => stylesheets9
});
var index9, component_cache8, component8, server_id8, imports9, stylesheets9, fonts9;
var init__9 = __esm({
  ".svelte-kit/output/server/nodes/8.js"() {
    init_page_server_ts7();
    index9 = 8;
    component8 = async () => component_cache8 ??= (await Promise.resolve().then(() => (init_page_svelte6(), page_svelte_exports6))).default;
    server_id8 = "src/routes/auth/register/+page.server.ts";
    imports9 = ["_app/immutable/nodes/8.c5ed6e1c.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets9 = [];
    fonts9 = [];
  }
});

// .svelte-kit/output/server/entries/pages/dashboard/_page.server.ts.js
var page_server_ts_exports8 = {};
__export(page_server_ts_exports8, {
  load: () => load8
});
var load8;
var init_page_server_ts8 = __esm({
  ".svelte-kit/output/server/entries/pages/dashboard/_page.server.ts.js"() {
    init_prisma();
    init_guards();
    load8 = async (event) => {
      try {
        requireAuth(event);
        console.log("[DASHBOARD] Loading dashboard for user:", event.locals.user?.id);
        const prisma2 = createRequestPrisma(event);
        const [total, pending, inProgress, completed] = await Promise.all([
          prisma2.workOrder.count(),
          prisma2.workOrder.count({ where: { status: "PENDING" } }),
          prisma2.workOrder.count({ where: { status: "IN_PROGRESS" } }),
          prisma2.workOrder.count({ where: { status: "COMPLETED" } })
        ]);
        console.log("[DASHBOARD] Stats loaded:", { total, pending, inProgress, completed });
        const recentWorkOrders = await prisma2.workOrder.findMany({
          take: 5,
          orderBy: { updatedAt: "desc" },
          include: {
            asset: {
              include: {
                room: {
                  select: {
                    name: true,
                    building: true,
                    floor: true,
                    site: {
                      select: { name: true }
                    }
                  }
                }
              }
            }
          }
        });
        console.log("[DASHBOARD] Recent work orders loaded:", recentWorkOrders.length);
        const sites = await prisma2.site.findMany({
          include: {
            _count: {
              select: { rooms: true }
            }
          }
        });
        console.log("[DASHBOARD] Sites loaded:", sites.length);
        return {
          stats: { total, pending, inProgress, completed },
          recentWorkOrders,
          sites
        };
      } catch (error2) {
        console.error("[DASHBOARD] Error loading dashboard:", error2);
        throw error2;
      }
    };
  }
});

// .svelte-kit/output/server/chunks/websocket.js
var initialState, wsStore;
var init_websocket = __esm({
  ".svelte-kit/output/server/chunks/websocket.js"() {
    init_index2();
    initialState = {
      isConnected: false,
      messages: [],
      error: null,
      orgId: null,
      isPolling: false
    };
    wsStore = writable(initialState);
  }
});

// .svelte-kit/output/server/entries/pages/dashboard/_page.svelte.js
var page_svelte_exports7 = {};
__export(page_svelte_exports7, {
  default: () => Page7
});
var Page7;
var init_page_svelte7 = __esm({
  ".svelte-kit/output/server/entries/pages/dashboard/_page.svelte.js"() {
    init_ssr();
    init_websocket();
    Page7 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let stats;
      let recentWorkOrders;
      let { data } = $$props;
      let wsConnected = false;
      let wsPolling = false;
      let liveFeed = [];
      let lastSeenTimestamp = 0;
      const unsubscribe = wsStore.subscribe((state) => {
        wsConnected = state.isConnected;
        wsPolling = state.isPolling;
        if (state.messages.length > 0) {
          const latest = state.messages[0];
          if (latest.timestamp && latest.timestamp > lastSeenTimestamp) {
            lastSeenTimestamp = latest.timestamp;
            if (latest.type === "WO_UPDATE") {
              const wo = latest.payload;
              liveFeed = [
                {
                  type: "update",
                  message: `${wo.title} \u2192 ${wo.status}`,
                  time: /* @__PURE__ */ new Date(),
                  id: latest.timestamp
                },
                ...liveFeed
              ].slice(0, 10);
            }
            if (latest.type === "WO_NEW") {
              const wo = latest.payload;
              liveFeed = [
                {
                  type: "new",
                  message: `New: ${wo.title}`,
                  time: /* @__PURE__ */ new Date(),
                  id: latest.timestamp
                },
                ...liveFeed
              ].slice(0, 10);
            }
          }
        }
      });
      onDestroy(() => unsubscribe());
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      stats = data.stats;
      recentWorkOrders = data.recentWorkOrders || [];
      return `${$$result.head += `<!-- HEAD_svelte-6500cf_START -->${$$result.title = `<title>Dashboard \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-6500cf_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="mb-10"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-1nvtx26">Dashboard</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
        wsConnected ? "text-spore-orange" : wsPolling ? "text-spore-forest" : "text-spore-cream/50",
        true
      )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
        wsConnected ? "bg-spore-orange animate-pulse" : wsPolling ? "bg-spore-forest animate-pulse" : "bg-spore-cream/30",
        true
      )}" aria-hidden="true"></span> ${wsConnected ? `Live updates enabled` : `${wsPolling ? `Polling updates` : `Connecting...`}`}</span></div></div> <div class="grid grid-cols-1 lg:grid-cols-3 gap-8"> <div class="lg:col-span-2 space-y-8"> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-cby6zq">Total WOs</p> <p class="text-3xl font-extrabold text-spore-dark mt-1">${escape(stats?.total || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-1i4hqk4">Pending</p> <p class="text-3xl font-extrabold text-spore-orange mt-1">${escape(stats?.pending || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-m6iuib">In Progress</p> <p class="text-3xl font-extrabold text-spore-steel mt-1">${escape(stats?.inProgress || 0)}</p></div> <div class="bg-spore-white rounded-xl p-5 shadow-sm border border-spore-cream/50"><p class="text-xs font-semibold text-spore-steel uppercase tracking-wide" data-svelte-h="svelte-vsahe6">Completed</p> <p class="text-3xl font-extrabold text-spore-forest mt-1">${escape(stats?.completed || 0)}</p></div></div>  <div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50" data-svelte-h="svelte-1jmr3rt"><h2 class="text-lg font-bold text-spore-dark mb-5">Quick Actions</h2> <div class="grid grid-cols-2 md:grid-cols-4 gap-4"><a href="/work-orders" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2">\u{1F4CB}</span> <span class="text-sm font-semibold text-spore-steel">All Work Orders</span></a> <a href="/sites" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2">\u{1F3E2}</span> <span class="text-sm font-semibold text-spore-steel">Sites</span></a> <a href="/assets" class="flex flex-col items-center p-5 bg-spore-cream/30 rounded-xl hover:bg-spore-cream/50 transition-colors border border-spore-cream/30"><span class="text-2xl mb-2">\u2699\uFE0F</span> <span class="text-sm font-semibold text-spore-steel">Assets</span></a> <a href="/work-orders?create=true" class="flex flex-col items-center p-5 bg-spore-orange rounded-xl hover:bg-spore-orange/90 transition-colors shadow-sm hover:shadow-md"><span class="text-2xl mb-2">\u2795</span> <span class="text-sm font-bold text-white">New WO</span></a></div></div>  <div class="bg-spore-white rounded-xl p-6 shadow-sm border border-spore-cream/50"><div class="flex justify-between items-center mb-5" data-svelte-h="svelte-g1vs87"><h2 class="text-lg font-bold text-spore-dark">Recent Work Orders</h2> <a href="/work-orders" class="text-sm font-semibold text-spore-orange hover:text-spore-orange/80">View all \u2192</a></div> ${recentWorkOrders.length > 0 ? `<div class="space-y-3">${each(recentWorkOrders, (wo) => {
        return `<div class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg border border-spore-cream/50"><div class="flex-1 min-w-0"><p class="text-sm font-bold text-spore-dark truncate">${escape(wo.title)}</p> <p class="text-xs text-spore-steel mt-1">${escape(wo.asset?.room?.name ? `Room ${wo.asset.room.name}` : "")} ${escape(wo.asset?.room?.building ? ` \u2022 Bldg ${wo.asset.room.building}` : "")} ${escape(wo.asset?.room?.floor ? ` \u2022 Floor ${wo.asset.room.floor}` : "")} </p></div> <span class="${"ml-3 px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full " + escape(
          wo.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
          true
        ) + " " + escape(
          wo.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
          true
        ) + " " + escape(
          wo.status === "PENDING" ? "bg-spore-steel text-white" : "",
          true
        ) + " " + escape(
          wo.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
          true
        )}">${escape(wo.status.replace("_", " "))}</span> </div>`;
      })}</div>` : `<p class="text-spore-steel text-sm" data-svelte-h="svelte-bae9j6">No recent work orders</p>`}</div></div>  <div class="space-y-8"><div class="bg-spore-dark rounded-xl p-6 border border-spore-steel/30"><div class="flex items-center justify-between mb-5"><h2 class="text-lg font-bold text-spore-cream" data-svelte-h="svelte-846tpj">Live Feed</h2> <span class="${"flex items-center gap-2 text-xs font-semibold " + escape(
        wsConnected ? "text-spore-orange" : wsPolling ? "text-spore-forest" : "text-spore-cream/50",
        true
      )}"><span class="${"w-2 h-2 rounded-full " + escape(
        wsConnected ? "bg-spore-orange animate-pulse" : wsPolling ? "bg-spore-forest animate-pulse" : "bg-spore-cream/30",
        true
      )}"></span> ${wsConnected ? `Live` : `${wsPolling ? `Polling` : `Offline`}`}</span></div> ${liveFeed.length > 0 ? `<div class="space-y-3">${each(liveFeed, (item) => {
        return `<div class="${"flex items-start gap-3 p-3 rounded-lg " + escape(
          item.type === "new" ? "bg-spore-forest/20" : "bg-spore-steel/50",
          true
        )}"><span class="text-base">${escape(item.type === "new" ? "\u{1F195}" : "\u{1F504}")}</span> <div class="flex-1 min-w-0"><p class="text-sm font-medium text-spore-cream truncate">${escape(item.message)}</p> <p class="text-xs text-spore-cream/50 mt-1">${escape(item.time.toLocaleTimeString())} </p></div> </div>`;
      })}</div>` : `<div class="text-center py-10" data-svelte-h="svelte-1l92qcj"><p class="text-spore-cream/50 text-sm font-medium">Waiting for activity...</p> <p class="text-xs text-spore-cream/30 mt-2">Updates appear here in real-time</p></div>`}</div>  ${data.sites && data.sites.length > 0 ? `<div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-bold text-spore-dark mb-5" data-svelte-h="svelte-ifb08s">Sites</h2> <div class="space-y-3">${each(data.sites, (site) => {
        return `<a href="${"/sites/" + escape(site.id, true)}" class="flex items-center justify-between p-4 bg-spore-cream/20 rounded-lg hover:bg-spore-cream/40 transition-colors border border-spore-cream/50"><span class="text-sm font-bold text-spore-dark">${escape(site.name)}</span> <span class="text-xs font-semibold text-spore-steel">${escape(site._count?.rooms || 0)} rooms</span> </a>`;
      })}</div></div>` : ``}</div></div></div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/9.js
var __exports10 = {};
__export(__exports10, {
  component: () => component9,
  fonts: () => fonts10,
  imports: () => imports10,
  index: () => index10,
  server: () => page_server_ts_exports8,
  server_id: () => server_id9,
  stylesheets: () => stylesheets10
});
var index10, component_cache9, component9, server_id9, imports10, stylesheets10, fonts10;
var init__10 = __esm({
  ".svelte-kit/output/server/nodes/9.js"() {
    init_page_server_ts8();
    index10 = 9;
    component9 = async () => component_cache9 ??= (await Promise.resolve().then(() => (init_page_svelte7(), page_svelte_exports7))).default;
    server_id9 = "src/routes/dashboard/+page.server.ts";
    imports10 = ["_app/immutable/nodes/9.26db66b4.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/websocket.7498009b.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets10 = [];
    fonts10 = [];
  }
});

// .svelte-kit/output/server/entries/pages/profile/_page.server.ts.js
var page_server_ts_exports9 = {};
__export(page_server_ts_exports9, {
  actions: () => actions6,
  load: () => load9
});
var load9, actions6;
var init_page_server_ts9 = __esm({
  ".svelte-kit/output/server/entries/pages/profile/_page.server.ts.js"() {
    init_prisma();
    init_auth();
    init_guards();
    init_chunks();
    load9 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const userId = event.locals.user.id;
      const user = await prisma2.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phoneNumber: true,
          role: true,
          createdAt: true
        }
      });
      return { profile: user };
    };
    actions6 = {
      updateProfile: async (event) => {
        requireAuth(event);
        const prisma2 = createRequestPrisma(event);
        const userId = event.locals.user.id;
        const formData2 = await event.request.formData();
        const firstName = formData2.get("firstName");
        const lastName = formData2.get("lastName");
        const phoneNumber = formData2.get("phoneNumber");
        await prisma2.user.update({
          where: { id: userId },
          data: {
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            phoneNumber: phoneNumber?.trim() || null
          }
        });
        return { success: true, message: "Profile updated successfully" };
      },
      changePassword: async (event) => {
        requireAuth(event);
        const prisma2 = createRequestPrisma(event);
        const userId = event.locals.user.id;
        const formData2 = await event.request.formData();
        const currentPassword = formData2.get("currentPassword");
        const newPassword = formData2.get("newPassword");
        const confirmPassword = formData2.get("confirmPassword");
        if (!currentPassword || !newPassword || !confirmPassword) {
          return fail(400, { passwordError: "All password fields are required" });
        }
        if (newPassword.length < 8) {
          return fail(400, { passwordError: "New password must be at least 8 characters" });
        }
        if (newPassword !== confirmPassword) {
          return fail(400, { passwordError: "New passwords do not match" });
        }
        const user = await prisma2.user.findUnique({
          where: { id: userId },
          select: { password: true }
        });
        if (!user) {
          return fail(400, { passwordError: "User not found" });
        }
        const isValid = await verifyPassword(currentPassword, user.password);
        if (!isValid) {
          return fail(400, { passwordError: "Current password is incorrect" });
        }
        const hashedPassword = await hashPassword(newPassword);
        await prisma2.user.update({
          where: { id: userId },
          data: { password: hashedPassword }
        });
        return { passwordSuccess: true, message: "Password changed successfully" };
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/profile/_page.svelte.js
var page_svelte_exports8 = {};
__export(page_svelte_exports8, {
  default: () => Page8
});
var Page8;
var init_page_svelte8 = __esm({
  ".svelte-kit/output/server/entries/pages/profile/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page8 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let { data } = $$props;
      let { form } = $$props;
      let currentPassword = "";
      let newPassword = "";
      let confirmPassword = "";
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      if ($$props.form === void 0 && $$bindings.form && form !== void 0)
        $$bindings.form(form);
      return `${$$result.head += `<!-- HEAD_svelte-3w78n0_START -->${$$result.title = `<title>Profile \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-3w78n0_END -->`, ""} <div class="max-w-3xl mx-auto px-4 py-10"><div class="mb-8" data-svelte-h="svelte-1lq5mur"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Profile Settings</h1> <p class="text-spore-cream/60 mt-2">Manage your account information</p></div>  <div class="bg-spore-dark rounded-xl p-6 mb-6 border border-spore-steel/30"><div class="flex items-start gap-6"> <div class="w-20 h-20 rounded-full bg-spore-orange flex items-center justify-center text-3xl font-bold text-white shrink-0">${escape((data.profile?.firstName?.[0] || data.profile?.email?.[0] || "?").toUpperCase())}</div> <div class="flex-1 min-w-0"><h2 class="text-2xl font-bold text-spore-cream">${data.profile?.firstName || data.profile?.lastName ? `${escape([data.profile?.firstName, data.profile?.lastName].filter(Boolean).join(" "))}` : `${escape(data.profile?.email?.split("@")[0])}`}</h2> <div class="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2 text-sm"><div><span class="text-spore-steel" data-svelte-h="svelte-n48nce">Email</span> <p class="text-spore-cream font-medium truncate">${escape(data.profile?.email)}</p></div> <div><span class="text-spore-steel" data-svelte-h="svelte-x9w8cq">Phone</span> <p class="text-spore-cream font-medium">${escape(data.profile?.phoneNumber || "\u2014")}</p></div> <div><span class="text-spore-steel" data-svelte-h="svelte-1wne51i">Role</span> <p class="text-spore-cream font-medium capitalize">${escape(data.profile?.role?.toLowerCase())}</p></div> <div><span class="text-spore-steel" data-svelte-h="svelte-1atodpa">Access Level</span> <p class="${"font-medium " + escape(
        data.profile?.role === "ADMIN" ? "text-spore-orange" : data.profile?.role === "MANAGER" ? "text-spore-forest" : "text-spore-cream",
        true
      )}">${data.profile?.role === "ADMIN" ? `Full Access` : `${data.profile?.role === "MANAGER" ? `Elevated Access` : `Standard Access`}`}</p></div></div></div></div></div>  <div class="bg-spore-white rounded-xl p-6 mb-6"><h2 class="text-lg font-bold text-spore-dark mb-4" data-svelte-h="svelte-t4k2di">Edit Profile</h2> ${form?.success ? `<div class="mb-4 p-3 bg-spore-forest/10 border border-spore-forest/30 rounded-lg text-spore-forest text-sm">${escape(form.message)}</div>` : ``} <form method="POST" action="?/updateProfile" class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="firstName" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-13ykw0p">First Name</label> <input type="text" id="firstName" name="firstName"${add_attribute("value", data.profile?.firstName || "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"></div> <div><label for="lastName" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-eyowth">Last Name</label> <input type="text" id="lastName" name="lastName"${add_attribute("value", data.profile?.lastName || "", 0)} class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"></div></div> <div><label for="phoneNumber" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-jpoql5">Phone Number</label> <input type="tel" id="phoneNumber" name="phoneNumber"${add_attribute("value", data.profile?.phoneNumber || "", 0)} placeholder="(555) 123-4567" class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark placeholder-spore-steel/50 focus:outline-none focus:ring-2 focus:ring-spore-orange"></div> <div><label class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-1551fsf">Email</label> <input type="email"${add_attribute("value", data.profile?.email || "", 0)} disabled class="w-full px-4 py-3 rounded-lg border border-spore-cream/50 bg-spore-cream/10 text-spore-steel cursor-not-allowed"> <p class="text-xs text-spore-steel mt-1" data-svelte-h="svelte-9ep45u">Contact an admin to change your email</p></div> <div class="flex justify-between items-center pt-2"><div class="text-sm text-spore-steel"><span class="font-medium" data-svelte-h="svelte-1knzhrc">Role:</span> <span class="capitalize">${escape(data.profile?.role.toLowerCase())}</span></div> <button type="submit" ${""} class="bg-spore-forest text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 focus:outline-none focus:ring-2 focus:ring-spore-forest disabled:opacity-50 transition-colors">${escape("Save Changes")}</button></div></form></div>  <div class="bg-spore-white rounded-xl p-6"><h2 class="text-lg font-bold text-spore-dark mb-4" data-svelte-h="svelte-1vsjyy0">Change Password</h2> ${form?.passwordError ? `<div class="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">${escape(form.passwordError)}</div>` : ``} ${form?.passwordSuccess ? `<div class="mb-4 p-3 bg-spore-forest/10 border border-spore-forest/30 rounded-lg text-spore-forest text-sm">${escape(form.message)}</div>` : ``} <form method="POST" action="?/changePassword" class="space-y-4"><div><label for="currentPassword" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-1rc1a4n">Current Password</label> <input type="password" id="currentPassword" name="currentPassword" required class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", currentPassword, 0)}></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div><label for="newPassword" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-t80aod">New Password</label> <input type="password" id="newPassword" name="newPassword" minlength="8" required class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", newPassword, 0)}></div> <div><label for="confirmPassword" class="block text-sm font-medium text-spore-steel mb-1" data-svelte-h="svelte-w47hzp">Confirm Password</label> <input type="password" id="confirmPassword" name="confirmPassword" minlength="8" required class="w-full px-4 py-3 rounded-lg border border-spore-cream bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", confirmPassword, 0)}></div></div> <p class="text-xs text-spore-steel" data-svelte-h="svelte-aovh52">Password must be at least 8 characters</p> <div class="flex justify-end pt-2"><button type="submit" ${"disabled"} class="bg-spore-orange text-white px-6 py-2 rounded-lg font-bold text-sm hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange disabled:opacity-50 transition-colors">${escape("Change Password")}</button></div></form></div>  <div class="mt-6 text-center text-sm text-spore-cream/50">Account created ${escape(new Date(data.profile?.createdAt || "").toLocaleDateString())}</div></div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/10.js
var __exports11 = {};
__export(__exports11, {
  component: () => component10,
  fonts: () => fonts11,
  imports: () => imports11,
  index: () => index11,
  server: () => page_server_ts_exports9,
  server_id: () => server_id10,
  stylesheets: () => stylesheets11
});
var index11, component_cache10, component10, server_id10, imports11, stylesheets11, fonts11;
var init__11 = __esm({
  ".svelte-kit/output/server/nodes/10.js"() {
    init_page_server_ts9();
    index11 = 10;
    component10 = async () => component_cache10 ??= (await Promise.resolve().then(() => (init_page_svelte8(), page_svelte_exports8))).default;
    server_id10 = "src/routes/profile/+page.server.ts";
    imports11 = ["_app/immutable/nodes/10.b115b2cd.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets11 = [];
    fonts11 = [];
  }
});

// .svelte-kit/output/server/entries/pages/sites/_page.server.ts.js
var page_server_ts_exports10 = {};
__export(page_server_ts_exports10, {
  actions: () => actions7,
  load: () => load10
});
var load10, actions7;
var init_page_server_ts10 = __esm({
  ".svelte-kit/output/server/entries/pages/sites/_page.server.ts.js"() {
    init_prisma();
    init_chunks();
    init_guards();
    init_audit();
    load10 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const sites = await prisma2.site.findMany({
        orderBy: { createdAt: "desc" },
        include: {
          _count: {
            select: { rooms: true }
          }
        }
      });
      return { sites };
    };
    actions7 = {
      create: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const name = formData2.get("name");
        if (!name || name.trim() === "") {
          return fail(400, { error: "Site name is required" });
        }
        const site = await prisma2.site.create({
          data: {
            name: name.trim(),
            orgId: event.locals.user.orgId
          }
        });
        await logAudit(event.locals.user.id, "SITE_CREATED", {
          siteId: site.id,
          name: site.name
        });
        return { success: true, site };
      },
      delete: async (event) => {
        if (!isManagerOrAbove(event)) {
          return fail(403, { error: "Permission denied. Only managers can delete sites." });
        }
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const siteId = formData2.get("siteId");
        if (!siteId) {
          return fail(400, { error: "Site ID is required" });
        }
        const site = await prisma2.site.findUnique({
          where: { id: siteId },
          select: { name: true }
        });
        await prisma2.site.delete({
          where: { id: siteId }
        });
        await logAudit(event.locals.user.id, "SITE_DELETED", {
          siteId,
          name: site?.name
        });
        return { success: true };
      },
      update: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const siteId = formData2.get("siteId");
        const name = formData2.get("name");
        if (!siteId) {
          return fail(400, { error: "Site ID is required" });
        }
        if (!name || name.trim() === "") {
          return fail(400, { error: "Site name is required" });
        }
        const site = await prisma2.site.update({
          where: { id: siteId },
          data: { name: name.trim() }
        });
        return { success: true, site };
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/sites/_page.svelte.js
var page_svelte_exports9 = {};
__export(page_svelte_exports9, {
  default: () => Page9
});
var Page9;
var init_page_svelte9 = __esm({
  ".svelte-kit/output/server/entries/pages/sites/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page9 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let sites;
      let { data } = $$props;
      let editingSiteId = null;
      let editingSiteName = "";
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      sites = data.sites || [];
      return `${$$result.head += `<!-- HEAD_svelte-w7e4y3_START -->${$$result.title = `<title>Sites \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-w7e4y3_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div data-svelte-h="svelte-ylins"><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">Sites</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">Manage your facility locations</p></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ NEW SITE")}</button></div>  ${``}  ${sites.length > 0 ? `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">${each(sites, (site) => {
        return `${editingSiteId === site.id ? ` <div class="bg-spore-white rounded-xl p-6 ring-2 ring-spore-orange"><form method="POST" action="?/update"><input type="hidden" name="siteId"${add_attribute("value", site.id, 0)}> <div class="mb-4"><input type="text" name="name" class="w-full px-4 py-3 rounded-lg border border-spore-orange bg-spore-cream/20 text-spore-dark focus:outline-none focus:ring-2 focus:ring-spore-orange text-lg font-bold" required${add_attribute("value", editingSiteName, 0)}></div> <div class="flex gap-2"><button type="submit" ${!editingSiteName.trim() ? "disabled" : ""} class="flex-1 bg-spore-forest text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("SAVE")}</button> <button type="button" class="px-4 py-2 rounded-lg font-bold text-sm text-spore-steel hover:bg-spore-cream transition-colors" data-svelte-h="svelte-vhk55s">CANCEL</button> </div></form> </div>` : ` <div class="bg-spore-white rounded-xl p-6 hover:shadow-lg transition-all group relative"><a href="${"/sites/" + escape(site.id, true)}" class="absolute inset-0 z-0"></a> <div class="relative z-10 pointer-events-none"><div class="flex justify-between items-start mb-4"><div class="w-12 h-12 bg-spore-forest/10 rounded-xl flex items-center justify-center" data-svelte-h="svelte-qmlk65"><span class="text-2xl">\u{1F3E2}</span></div> <div class="flex gap-2 pointer-events-auto"><button class="text-spore-steel/40 hover:text-spore-orange transition-colors opacity-0 group-hover:opacity-100" data-svelte-h="svelte-s97alz">\u270F\uFE0F</button> <form method="POST" action="?/delete"><input type="hidden" name="siteId"${add_attribute("value", site.id, 0)}> <button type="submit" class="text-spore-steel/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" data-svelte-h="svelte-9vz145">\u2715
										</button></form> </div></div> <h3 class="text-lg font-bold text-spore-dark group-hover:text-spore-forest transition-colors">${escape(site.name)}</h3> <p class="text-sm text-spore-steel mt-1">${escape(site._count?.rooms || 0)} room${escape(site._count?.rooms !== 1 ? "s" : "")}</p> <div class="mt-4 pt-4 border-t border-spore-cream/50"><span class="text-xs text-spore-steel">Created ${escape(new Date(site.createdAt).toLocaleDateString())}</span> </div></div> </div>`}`;
      })}</div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-n08cxc">\u{1F3E2}</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-1r1pntd">No sites yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-1itm7tw">Create your first site to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-1vkd0hb">+ CREATE SITE</button></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/11.js
var __exports12 = {};
__export(__exports12, {
  component: () => component11,
  fonts: () => fonts12,
  imports: () => imports12,
  index: () => index12,
  server: () => page_server_ts_exports10,
  server_id: () => server_id11,
  stylesheets: () => stylesheets12
});
var index12, component_cache11, component11, server_id11, imports12, stylesheets12, fonts12;
var init__12 = __esm({
  ".svelte-kit/output/server/nodes/11.js"() {
    init_page_server_ts10();
    index12 = 11;
    component11 = async () => component_cache11 ??= (await Promise.resolve().then(() => (init_page_svelte9(), page_svelte_exports9))).default;
    server_id11 = "src/routes/sites/+page.server.ts";
    imports12 = ["_app/immutable/nodes/11.ef43df9c.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets12 = [];
    fonts12 = [];
  }
});

// .svelte-kit/output/server/entries/pages/sites/_id_/_page.server.ts.js
var page_server_ts_exports11 = {};
__export(page_server_ts_exports11, {
  actions: () => actions8,
  load: () => load11
});
var load11, actions8;
var init_page_server_ts11 = __esm({
  ".svelte-kit/output/server/entries/pages/sites/_id_/_page.server.ts.js"() {
    init_prisma();
    init_chunks();
    init_guards();
    load11 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const { id } = event.params;
      const site = await prisma2.site.findUnique({
        where: { id },
        include: {
          rooms: {
            orderBy: [
              { building: "asc" },
              { floor: "asc" },
              { name: "asc" }
            ],
            include: {
              _count: {
                select: { assets: true }
              }
            }
          }
        }
      });
      if (!site) {
        throw error(404, "Site not found");
      }
      const roomsByBuilding = site.rooms.reduce((acc, room) => {
        const building2 = room.building || "Unassigned";
        if (!acc[building2]) {
          acc[building2] = [];
        }
        acc[building2].push(room);
        return acc;
      }, {});
      return { site, roomsByBuilding };
    };
    actions8 = {
      createRoom: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const { id: siteId } = event.params;
        const name = formData2.get("name");
        const building2 = formData2.get("building");
        const floor = formData2.get("floor");
        if (!name || name.trim() === "") {
          return fail(400, { error: "Room name is required" });
        }
        const room = await prisma2.room.create({
          data: {
            name: name.trim(),
            building: building2?.trim() || null,
            floor: floor ? parseInt(floor) : null,
            siteId
          }
        });
        return { success: true, room };
      },
      updateSite: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const { id } = event.params;
        const name = formData2.get("name");
        if (!name || name.trim() === "") {
          return fail(400, { error: "Site name is required" });
        }
        const site = await prisma2.site.update({
          where: { id },
          data: { name: name.trim() }
        });
        return { success: true, site };
      },
      deleteRoom: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const roomId = formData2.get("roomId");
        if (!roomId) {
          return fail(400, { error: "Room ID is required" });
        }
        await prisma2.room.delete({
          where: { id: roomId }
        });
        return { success: true };
      },
      updateRoom: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const roomId = formData2.get("roomId");
        const name = formData2.get("name");
        const building2 = formData2.get("building");
        const floor = formData2.get("floor");
        if (!roomId) {
          return fail(400, { error: "Room ID is required" });
        }
        if (!name || name.trim() === "") {
          return fail(400, { error: "Room name is required" });
        }
        const room = await prisma2.room.update({
          where: { id: roomId },
          data: {
            name: name.trim(),
            building: building2?.trim() || null,
            floor: floor ? parseInt(floor) : null
          }
        });
        return { success: true, room };
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/sites/_id_/_page.svelte.js
var page_svelte_exports10 = {};
__export(page_svelte_exports10, {
  default: () => Page10
});
var Page10;
var init_page_svelte10 = __esm({
  ".svelte-kit/output/server/entries/pages/sites/_id_/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page10 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let site;
      let roomsByBuilding;
      let buildingNames;
      let { data } = $$props;
      let editingRoomId = null;
      let editingRoom = { name: "", building: "", floor: "" };
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      site = data.site;
      roomsByBuilding = data.roomsByBuilding || {};
      buildingNames = Object.keys(roomsByBuilding).sort();
      return `<div class="max-w-7xl mx-auto px-4 py-10"> <div class="mb-6" data-svelte-h="svelte-14m0uw6"><a href="/sites" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">\u2190 Back to Sites</a></div>  <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight">${escape(site.name)}</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${escape(site.rooms?.length || 0)} room${escape(site.rooms?.length !== 1 ? "s" : "")}</p></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ ADD ROOM")}</button></div>  ${``}  ${buildingNames.length > 0 ? `<div class="space-y-8">${each(buildingNames, (building2) => {
        return `<div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark px-6 py-4"><h2 class="text-lg font-bold text-spore-cream">${escape(building2 === "Unassigned" ? "Unassigned Rooms" : `Building ${building2}`)}</h2> <p class="text-spore-cream/60 text-sm">${escape(roomsByBuilding[building2].length)} room${escape(roomsByBuilding[building2].length !== 1 ? "s" : "")} </p></div>  <div class="p-6"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">${each(roomsByBuilding[building2], (room) => {
          return `${editingRoomId === room.id ? ` <div class="bg-spore-cream/20 rounded-lg p-4 border-2 border-spore-orange"><form method="POST" action="?/updateRoom"><input type="hidden" name="roomId"${add_attribute("value", room.id, 0)}> <div class="space-y-3"><input type="text" name="name" placeholder="Room name" class="w-full px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange" required${add_attribute("value", editingRoom.name, 0)}> <div class="grid grid-cols-2 gap-2"><input type="text" name="building" placeholder="Building" class="px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", editingRoom.building, 0)}> <input type="number" name="floor" placeholder="Floor" class="px-3 py-2 rounded border border-spore-cream bg-white text-spore-dark text-sm focus:outline-none focus:ring-2 focus:ring-spore-orange"${add_attribute("value", editingRoom.floor, 0)}></div> <div class="flex gap-2"><button type="submit" ${!editingRoom.name.trim() ? "disabled" : ""} class="flex-1 bg-spore-forest text-white px-3 py-2 rounded font-bold text-xs hover:bg-spore-forest/90 disabled:opacity-50 transition-colors">${escape("SAVE")}</button> <button type="button" class="px-3 py-2 rounded font-bold text-xs text-spore-steel hover:bg-spore-cream transition-colors" data-svelte-h="svelte-je9169">CANCEL
													</button></div> </div></form> </div>` : ` <div class="bg-spore-cream/20 rounded-lg p-4 border border-spore-cream/50 group hover:border-spore-orange/50 transition-colors"><div class="flex justify-between items-start"><div><h3 class="font-bold text-spore-dark">Room ${escape(room.name)}</h3> <p class="text-sm text-spore-steel mt-1">${room.floor ? `Floor ${escape(room.floor)}` : ``} ${room._count?.assets ? `<span class="ml-2">\u2022 ${escape(room._count.assets)} asset${escape(room._count.assets !== 1 ? "s" : "")}</span>` : ``} </p></div> <div class="flex gap-2"><button class="text-spore-steel/40 hover:text-spore-orange transition-colors opacity-0 group-hover:opacity-100" data-svelte-h="svelte-hw6ud4">\u270F\uFE0F</button> <form method="POST" action="?/deleteRoom"><input type="hidden" name="roomId"${add_attribute("value", room.id, 0)}> <button type="submit" class="text-spore-steel/40 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100" data-svelte-h="svelte-1wwci4s">\u2715
													</button></form> </div></div> <div class="mt-4 pt-3 border-t border-spore-cream/50"><a href="${"/assets?room=" + escape(room.id, true)}" class="text-xs font-semibold text-spore-orange hover:text-spore-orange/80">View Assets \u2192
											</a></div> </div>`}`;
        })} </div></div> </div>`;
      })}</div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1vg2ihf">\u{1F6AA}</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-1vqwohh">No rooms yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-1qkbz3q">Add rooms to this site to start tracking assets</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-1aornih">+ ADD ROOM</button></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/12.js
var __exports13 = {};
__export(__exports13, {
  component: () => component12,
  fonts: () => fonts13,
  imports: () => imports13,
  index: () => index13,
  server: () => page_server_ts_exports11,
  server_id: () => server_id12,
  stylesheets: () => stylesheets13
});
var index13, component_cache12, component12, server_id12, imports13, stylesheets13, fonts13;
var init__13 = __esm({
  ".svelte-kit/output/server/nodes/12.js"() {
    init_page_server_ts11();
    index13 = 12;
    component12 = async () => component_cache12 ??= (await Promise.resolve().then(() => (init_page_svelte10(), page_svelte_exports10))).default;
    server_id12 = "src/routes/sites/[id]/+page.server.ts";
    imports13 = ["_app/immutable/nodes/12.6e7d8dc2.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets13 = [];
    fonts13 = [];
  }
});

// .svelte-kit/output/server/entries/pages/users/_page.server.ts.js
var page_server_ts_exports12 = {};
__export(page_server_ts_exports12, {
  actions: () => actions9,
  load: () => load12
});
var load12, actions9;
var init_page_server_ts12 = __esm({
  ".svelte-kit/output/server/entries/pages/users/_page.server.ts.js"() {
    init_prisma();
    init_auth();
    init_chunks();
    init_audit();
    load12 = async (event) => {
      const { locals } = event;
      if (!locals.user || !canManageUsers(locals.user.role)) {
        throw error(403, "Access denied. Admin privileges required.");
      }
      const prisma2 = createRequestPrisma(event);
      const users = await prisma2.user.findMany({
        where: { orgId: locals.user.orgId },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true
        }
      });
      return { users };
    };
    actions9 = {
      create: async (event) => {
        const { locals, request } = event;
        if (!locals.user || !canManageUsers(locals.user.role)) {
          return fail(403, { error: "Access denied" });
        }
        const prisma2 = createRequestPrisma(event);
        const formData2 = await request.formData();
        const email = formData2.get("email");
        const firstName = formData2.get("firstName");
        const lastName = formData2.get("lastName");
        const role = formData2.get("role");
        const password = formData2.get("password");
        if (!email?.trim()) {
          return fail(400, { error: "Email is required" });
        }
        if (!password || password.length < 8) {
          return fail(400, { error: "Password must be at least 8 characters" });
        }
        if (!["ADMIN", "MANAGER", "TECHNICIAN"].includes(role)) {
          return fail(400, { error: "Invalid role" });
        }
        const existing = await prisma2.user.findUnique({
          where: { email: email.toLowerCase().trim() }
        });
        if (existing) {
          return fail(400, { error: "Email already in use" });
        }
        const hashedPassword = await hashPassword(password);
        const newUser = await prisma2.user.create({
          data: {
            email: email.toLowerCase().trim(),
            password: hashedPassword,
            firstName: firstName?.trim() || null,
            lastName: lastName?.trim() || null,
            role,
            orgId: locals.user.orgId
          }
        });
        await logAudit(locals.user.id, "USER_CREATED", {
          newUserId: newUser.id,
          email: newUser.email,
          role
        });
        return { success: true };
      },
      updateRole: async (event) => {
        const { locals, request } = event;
        if (!locals.user || !canManageUsers(locals.user.role)) {
          return fail(403, { error: "Access denied" });
        }
        const prisma2 = createRequestPrisma(event);
        const formData2 = await request.formData();
        const userId = formData2.get("userId");
        const role = formData2.get("role");
        if (!userId)
          return fail(400, { error: "User ID required" });
        if (!["ADMIN", "MANAGER", "TECHNICIAN"].includes(role)) {
          return fail(400, { error: "Invalid role" });
        }
        if (userId === locals.user.id) {
          return fail(400, { error: "Can't change your own role" });
        }
        const targetUser = await prisma2.user.findUnique({
          where: { id: userId },
          select: { email: true, role: true }
        });
        await prisma2.user.update({
          where: { id: userId, orgId: locals.user.orgId },
          data: { role }
        });
        await logAudit(locals.user.id, "USER_ROLE_CHANGED", {
          targetUserId: userId,
          email: targetUser?.email,
          oldRole: targetUser?.role,
          newRole: role
        });
        return { success: true };
      },
      delete: async (event) => {
        const { locals, request } = event;
        if (!locals.user || !canManageUsers(locals.user.role)) {
          return fail(403, { error: "Access denied" });
        }
        const prisma2 = createRequestPrisma(event);
        const formData2 = await request.formData();
        const userId = formData2.get("userId");
        if (!userId)
          return fail(400, { error: "User ID required" });
        if (userId === locals.user.id) {
          return fail(400, { error: "Can't delete your own account" });
        }
        const targetUser = await prisma2.user.findUnique({
          where: { id: userId },
          select: { email: true }
        });
        await prisma2.user.delete({
          where: { id: userId, orgId: locals.user.orgId }
        });
        await logAudit(locals.user.id, "USER_DELETED", {
          deletedUserId: userId,
          email: targetUser?.email
        });
        return { success: true };
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/users/_page.svelte.js
var page_svelte_exports11 = {};
__export(page_svelte_exports11, {
  default: () => Page11
});
function getRoleBadgeColor(role) {
  switch (role) {
    case "ADMIN":
      return "bg-spore-orange text-white";
    case "MANAGER":
      return "bg-spore-forest text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
var Page11;
var init_page_svelte11 = __esm({
  ".svelte-kit/output/server/entries/pages/users/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page11 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let users;
      let { data } = $$props;
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      users = data.users || [];
      return `<div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-10"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-t6iemi">Users</h1> <p class="text-spore-cream/60 mt-2 text-sm font-medium">${escape(users.length)} team member${escape(users.length !== 1 ? "s" : "")}</p></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold tracking-wide">${escape("+ ADD USER")}</button></div>  ${``}  ${users.length > 0 ? `<div class="bg-spore-white rounded-xl overflow-hidden"><div class="overflow-x-auto"><table class="min-w-full"><thead class="bg-spore-dark" data-svelte-h="svelte-12sxbb2"><tr><th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">User</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Email</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Role</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Joined</th> <th class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(users, (user) => {
        return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><span class="text-sm font-bold text-spore-dark">${escape(user.firstName || "")} ${escape(user.lastName || "")} ${!user.firstName && !user.lastName ? `<span class="text-spore-steel" data-svelte-h="svelte-6cnpz3">(No name)</span>` : ``} </span></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(user.email)}</td> <td class="px-6 py-4 whitespace-nowrap"><form method="POST" action="?/updateRole" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <select name="role"${add_attribute("value", user.role, 0)} class="${"px-2 py-1 text-xs font-bold uppercase rounded-full border-0 cursor-pointer " + escape(getRoleBadgeColor(user.role), true)}"><option value="TECHNICIAN" data-svelte-h="svelte-1npbobm">Technician</option><option value="MANAGER" data-svelte-h="svelte-17d1rxs">Manager</option><option value="ADMIN" data-svelte-h="svelte-uoqvo8">Admin</option></select> </form></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel">${escape(new Date(user.createdAt).toLocaleDateString())}</td> <td class="px-6 py-4 whitespace-nowrap text-sm"><form method="POST" action="?/delete" class="inline"><input type="hidden" name="userId"${add_attribute("value", user.id, 0)}> <button type="submit" class="text-red-500 hover:text-red-400 font-bold transition-colors" data-svelte-h="svelte-gvkpdz">Delete</button> </form></td> </tr>`;
      })}</tbody></table></div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl"><div class="text-5xl mb-4" data-svelte-h="svelte-1i6rpvs">\u{1F465}</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-xk78eh">No users yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-1iuc5bd">Add team members to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 transition-colors text-sm font-bold" data-svelte-h="svelte-174euj2">+ ADD USER</button></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/13.js
var __exports14 = {};
__export(__exports14, {
  component: () => component13,
  fonts: () => fonts14,
  imports: () => imports14,
  index: () => index14,
  server: () => page_server_ts_exports12,
  server_id: () => server_id13,
  stylesheets: () => stylesheets14
});
var index14, component_cache13, component13, server_id13, imports14, stylesheets14, fonts14;
var init__14 = __esm({
  ".svelte-kit/output/server/nodes/13.js"() {
    init_page_server_ts12();
    index14 = 13;
    component13 = async () => component_cache13 ??= (await Promise.resolve().then(() => (init_page_svelte11(), page_svelte_exports11))).default;
    server_id13 = "src/routes/users/+page.server.ts";
    imports14 = ["_app/immutable/nodes/13.7d8c37e9.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets14 = [];
    fonts14 = [];
  }
});

// .svelte-kit/output/server/chunks/websocket-handler.js
async function broadcastToOrg(orgId, message) {
  try {
    const response = await fetch(DEV_BROADCAST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orgId, message })
    });
    if (response.ok) {
      console.log("[WS] Broadcast sent via HTTP API");
      return;
    }
  } catch (e3) {
  }
  if (typeof globalThis.__wsBroadcast === "function") {
    globalThis.__wsBroadcast(orgId, message);
    console.log("[WS] Broadcast sent via global function");
  } else {
    console.warn("[WS] Broadcast not available");
  }
}
var DEV_BROADCAST_URL;
var init_websocket_handler = __esm({
  ".svelte-kit/output/server/chunks/websocket-handler.js"() {
    DEV_BROADCAST_URL = "http://localhost:3001/api/broadcast";
  }
});

// .svelte-kit/output/server/entries/pages/work-orders/_page.server.ts.js
var page_server_ts_exports13 = {};
__export(page_server_ts_exports13, {
  actions: () => actions10,
  load: () => load13
});
var load13, actions10;
var init_page_server_ts13 = __esm({
  ".svelte-kit/output/server/entries/pages/work-orders/_page.server.ts.js"() {
    init_prisma();
    init_websocket_handler();
    init_guards();
    init_chunks();
    init_audit();
    load13 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const myOnly = event.url.searchParams.get("my") === "true";
      const userId = event.locals.user.id;
      const workOrders = await prisma2.workOrder.findMany({
        where: myOnly ? { assignedToId: userId } : void 0,
        include: {
          asset: {
            select: {
              id: true,
              name: true
            }
          },
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true
            }
          }
        },
        orderBy: {
          createdAt: "desc"
        }
      });
      const assets2 = await prisma2.asset.findMany({
        include: {
          room: {
            include: {
              site: { select: { name: true } }
            }
          }
        },
        orderBy: { name: "asc" }
      });
      const users = await prisma2.user.findMany({
        where: { orgId: event.locals.user.orgId },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true
        },
        orderBy: { firstName: "asc" }
      });
      return { workOrders, assets: assets2, users, myOnly };
    };
    actions10 = {
      /**
       * Create a new Work Order
       */
      create: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const data = await event.request.formData();
        const title = data.get("title");
        const description = data.get("description");
        const assetId = data.get("assetId");
        const failureMode = data.get("failureMode") || "General";
        if (!title || !assetId) {
          return { success: false, error: "Title and asset are required." };
        }
        const orgId = event.locals.user.orgId;
        try {
          const newWo = await prisma2.workOrder.create({
            data: {
              title: title.trim(),
              description: description?.trim() || "",
              assetId,
              failureMode,
              orgId,
              status: "PENDING"
            },
            select: {
              id: true,
              title: true,
              status: true,
              assetId: true,
              orgId: true,
              createdAt: true
            }
          });
          broadcastToOrg(orgId, {
            type: "WO_NEW",
            payload: newWo
          });
          await logAudit(event.locals.user.id, "WORK_ORDER_CREATED", {
            workOrderId: newWo.id,
            title: newWo.title,
            assetId: newWo.assetId
          });
          return { success: true, workOrder: newWo };
        } catch (e3) {
          console.error("Error creating work order:", e3);
          return { success: false, error: "Failed to create work order." };
        }
      },
      /** * Handles updating the status of a Work Order.
       * This is the core workflow trigger for the real-time system.
       */
      updateStatus: async (event) => {
        const { request } = event;
        const prisma2 = createRequestPrisma(event);
        const data = await request.formData();
        const woId = data.get("workOrderId");
        const newStatus = data.get("status");
        if (!woId || !newStatus) {
          return { success: false, error: "Missing ID or status." };
        }
        try {
          const updatedWo = await prisma2.workOrder.update({
            where: { id: woId },
            data: { status: newStatus },
            // Select specific fields for the broadcast payload
            select: {
              id: true,
              title: true,
              status: true,
              assetId: true,
              orgId: true
            }
          });
          if (!updatedWo) {
            return { success: false, error: "Work order not found." };
          }
          broadcastToOrg(updatedWo.orgId, {
            type: "WO_UPDATE",
            payload: updatedWo
          });
          await logAudit(event.locals.user.id, "WORK_ORDER_STATUS_CHANGED", {
            workOrderId: updatedWo.id,
            title: updatedWo.title,
            newStatus
          });
          return { success: true, updatedWo };
        } catch (e3) {
          console.error("Error updating WO status:", e3);
          return { success: false, error: "Database transaction failed." };
        }
      },
      assign: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const data = await event.request.formData();
        const woId = data.get("workOrderId");
        const assignedToId = data.get("assignedToId");
        if (!woId) {
          return fail(400, { error: "Work order ID required" });
        }
        try {
          const updatedWo = await prisma2.workOrder.update({
            where: { id: woId },
            data: { assignedToId: assignedToId || null },
            select: {
              id: true,
              title: true,
              status: true,
              assignedToId: true,
              orgId: true,
              assignedTo: {
                select: { firstName: true, lastName: true }
              }
            }
          });
          broadcastToOrg(updatedWo.orgId, {
            type: "WO_UPDATE",
            payload: updatedWo
          });
          await logAudit(event.locals.user.id, "WORK_ORDER_ASSIGNED", {
            workOrderId: updatedWo.id,
            title: updatedWo.title,
            assignedToId: assignedToId || null,
            assignedToName: updatedWo.assignedTo ? `${updatedWo.assignedTo.firstName || ""} ${updatedWo.assignedTo.lastName || ""}`.trim() : null
          });
          return { success: true };
        } catch (e3) {
          console.error("Error assigning WO:", e3);
          return fail(500, { error: "Failed to assign work order" });
        }
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/work-orders/_page.svelte.js
var page_svelte_exports12 = {};
__export(page_svelte_exports12, {
  default: () => Page12
});
function getUserName2(user) {
  if (!user)
    return "Unassigned";
  if (user.firstName || user.lastName) {
    return [user.firstName, user.lastName].filter(Boolean).join(" ");
  }
  return user.email || "Unknown";
}
var Page12;
var init_page_svelte12 = __esm({
  ".svelte-kit/output/server/entries/pages/work-orders/_page.svelte.js"() {
    init_ssr();
    init_websocket();
    init_devalue();
    init_stores();
    Page12 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let $$unsubscribe_page;
      $$unsubscribe_page = subscribe(page, (value) => value);
      let { data } = $$props;
      let workOrders = data.workOrders || [];
      data.assets || [];
      let users = data.users || [];
      let myOnly = data.myOnly || false;
      let wsConnected = false;
      let lastUpdate = null;
      let showCreateForm = false;
      const unsubscribe = wsStore.subscribe((state) => {
        wsConnected = state.isConnected;
        if (state.messages.length > 0) {
          const latest = state.messages[0];
          if (latest.type === "WO_UPDATE" && latest.payload) {
            const updated2 = latest.payload;
            workOrders = workOrders.map((wo) => {
              if (wo.id === updated2.id) {
                lastUpdate = `${updated2.title} \u2192 ${updated2.status}`;
                return { ...wo, ...updated2 };
              }
              return wo;
            });
          }
          if (latest.type === "WO_NEW" && latest.payload) {
            const newWo = latest.payload;
            if (!workOrders.some((wo) => wo.id === newWo.id)) {
              workOrders = [newWo, ...workOrders];
              lastUpdate = `New: ${newWo.title}`;
            }
          }
        }
      });
      onDestroy(() => unsubscribe());
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      {
        if (data.workOrders)
          workOrders = data.workOrders;
      }
      {
        if (data.assets)
          data.assets;
      }
      {
        if (data.users)
          users = data.users;
      }
      myOnly = data.myOnly || false;
      $$unsubscribe_page();
      return `${$$result.head += `<!-- HEAD_svelte-178cqdl_START -->${$$result.title = `<title>Work Orders \u2014 Spore CMMS</title>`, ""}<!-- HEAD_svelte-178cqdl_END -->`, ""} <div class="max-w-7xl mx-auto px-4 py-10"> <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6"><div><h1 class="text-4xl font-extrabold text-spore-cream tracking-tight" data-svelte-h="svelte-hmu04k">Work Orders</h1> <div class="flex items-center gap-3 mt-2"><span class="${"flex items-center gap-2 text-sm font-medium " + escape(
        wsConnected ? "text-spore-orange" : "text-spore-cream/50",
        true
      )}" role="status" aria-live="polite"><span class="${"w-2 h-2 rounded-full " + escape(
        wsConnected ? "bg-spore-orange animate-pulse" : "bg-spore-cream/30",
        true
      )}" aria-hidden="true"></span> ${escape(wsConnected ? "Live updates enabled" : "Connecting...")}</span> ${lastUpdate ? `<span class="text-sm font-medium text-spore-orange animate-pulse" role="status" aria-live="polite">${escape(lastUpdate)}</span>` : ``}</div></div> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 focus:ring-offset-spore-steel transition-colors text-sm font-bold tracking-wide"${add_attribute("aria-expanded", showCreateForm, 0)} aria-controls="create-form">${escape("+ NEW WORK ORDER")}</button></div>  <div class="flex items-center gap-3 mb-6"><span class="text-sm font-medium text-spore-cream/70" data-svelte-h="svelte-snu8mb">All</span> <a${add_attribute("href", myOnly ? "/work-orders" : "/work-orders?my=true", 0)} class="${"relative inline-flex h-6 w-11 items-center rounded-full transition-colors " + escape(myOnly ? "bg-spore-orange" : "bg-spore-steel/50", true)}" role="switch"${add_attribute("aria-checked", myOnly, 0)}><span class="${"inline-block h-4 w-4 transform rounded-full bg-white transition-transform " + escape(myOnly ? "translate-x-6" : "translate-x-1", true)}"></span></a> <span class="text-sm font-medium text-spore-cream/70" data-svelte-h="svelte-10q70yy">My Work Orders</span></div>  ${``}  ${workOrders && workOrders.length > 0 ? `<div class="bg-spore-white rounded-xl shadow-sm border border-spore-cream/50 overflow-hidden"> <div class="hidden md:block overflow-x-auto"><table class="min-w-full" role="table" aria-label="Work orders list"><thead class="bg-spore-dark" data-svelte-h="svelte-d57t8v"><tr><th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Title</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Status</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Assigned</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Asset</th> <th scope="col" class="px-6 py-4 text-left text-xs font-bold text-spore-cream uppercase tracking-wider">Actions</th></tr></thead> <tbody class="divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
        return `<tr class="hover:bg-spore-cream/20 transition-colors"><td class="px-6 py-4 whitespace-nowrap"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-sm font-bold text-spore-dark hover:text-spore-orange transition-colors focus:outline-none focus:underline">${escape(workOrder.title)} </a></td> <td class="px-6 py-4 whitespace-nowrap"><span class="${"px-3 py-1.5 inline-flex text-xs font-bold uppercase tracking-wide rounded-full " + escape(
          workOrder.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "PENDING" ? "bg-spore-steel text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
          true
        ) + " " + escape(
          workOrder.status === "CANCELLED" ? "bg-red-600 text-white" : "",
          true
        )}">${escape(workOrder.status.replace("_", " "))} </span></td> <td class="px-6 py-4 whitespace-nowrap"><form method="POST" action="?/assign" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="text-sm bg-transparent border-0 text-spore-steel cursor-pointer hover:text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange rounded"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
          return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName2(user))}</option>`;
        })}</select> </form></td> <td class="px-6 py-4 whitespace-nowrap text-sm text-spore-steel font-medium">${escape(workOrder.asset?.name || "N/A")}</td> <td class="px-6 py-4 whitespace-nowrap text-sm font-bold space-x-4"><form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="text-spore-orange hover:text-spore-orange/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed" ${workOrder.status === "IN_PROGRESS" ? "disabled" : ""} title="${"Start working on " + escape(workOrder.title, true)}" aria-label="${"Start work order: " + escape(workOrder.title, true)}">Start
										</button></form> <form method="POST" action="?/updateStatus" class="inline"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="text-spore-forest hover:text-spore-forest/70 focus:outline-none focus:underline disabled:opacity-30 disabled:cursor-not-allowed" ${workOrder.status === "COMPLETED" ? "disabled" : ""} title="${"Mark " + escape(workOrder.title, true) + " as completed"}" aria-label="${"Complete work order: " + escape(workOrder.title, true)}">Complete
										</button></form> <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="text-spore-steel hover:text-spore-dark focus:outline-none focus:underline" title="${"View details for " + escape(workOrder.title, true)}">View
									</a></td> </tr>`;
      })}</tbody></table></div>  <div class="md:hidden divide-y divide-spore-cream/50">${each(workOrders, (workOrder) => {
        return `<div class="p-4 hover:bg-spore-cream/10 transition-colors"><div class="flex items-start justify-between mb-3"><h3 class="text-base font-bold text-spore-dark flex-1 mr-3"><a href="${"/work-orders/" + escape(workOrder.id, true)}" class="hover:text-spore-orange transition-colors focus:outline-none focus:underline">${escape(workOrder.title)} </a></h3> <span class="${"px-3 py-1.5 text-xs font-bold uppercase tracking-wide rounded-full " + escape(
          workOrder.status === "COMPLETED" ? "bg-spore-forest text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "IN_PROGRESS" ? "bg-spore-orange text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "PENDING" ? "bg-spore-steel text-white" : "",
          true
        ) + " " + escape(
          workOrder.status === "ON_HOLD" ? "bg-spore-cream text-spore-steel" : "",
          true
        ) + " " + escape(
          workOrder.status === "CANCELLED" ? "bg-red-600 text-white" : "",
          true
        )}">${escape(workOrder.status.replace("_", " "))} </span></div> <div class="space-y-2 mb-4"><div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-1x2hujd">Asset:</span> <span class="text-sm text-spore-dark">${escape(workOrder.asset?.name || "N/A")}</span></div> <div class="flex items-center justify-between"><span class="text-sm font-medium text-spore-steel" data-svelte-h="svelte-1es34l">Assigned:</span> <form method="POST" action="?/assign" class="flex-1 max-w-[150px]"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <select name="assignedToId"${add_attribute("value", workOrder.assignedToId || "", 0)} class="w-full text-sm bg-spore-cream/30 border border-spore-cream/50 rounded-lg px-2 py-1 text-spore-dark focus:outline-none focus:ring-1 focus:ring-spore-orange"><option value="" data-svelte-h="svelte-nkh85j">Unassigned</option>${each(users, (user) => {
          return `<option${add_attribute("value", user.id, 0)}>${escape(getUserName2(user))}</option>`;
        })}</select></form> </div></div> <div class="flex gap-2 text-sm font-bold"><form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="IN_PROGRESS"> <button type="submit" class="w-full bg-spore-orange text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-orange/90 focus:outline-none focus:ring-1 focus:ring-spore-orange disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${workOrder.status === "IN_PROGRESS" ? "disabled" : ""} aria-label="${"Start work order: " + escape(workOrder.title, true)}">Start
								</button></form> <form method="POST" action="?/updateStatus" class="flex-1"><input type="hidden" name="workOrderId"${add_attribute("value", workOrder.id, 0)}> <input type="hidden" name="status" value="COMPLETED"> <button type="submit" class="w-full bg-spore-forest text-white py-2 px-3 rounded-lg font-medium hover:bg-spore-forest/90 focus:outline-none focus:ring-1 focus:ring-spore-forest disabled:opacity-30 disabled:cursor-not-allowed transition-colors" ${workOrder.status === "COMPLETED" ? "disabled" : ""} aria-label="${"Complete work order: " + escape(workOrder.title, true)}">Complete
								</button></form> <a href="${"/work-orders/" + escape(workOrder.id, true)}" class="flex-1 bg-spore-cream text-spore-dark py-2 px-3 rounded-lg font-medium text-center hover:bg-spore-cream/70 focus:outline-none focus:ring-1 focus:ring-spore-cream transition-colors">View
							</a></div> </div>`;
      })}</div></div>` : `<div class="text-center py-16 bg-spore-white rounded-xl" role="status"><div class="text-5xl mb-4" aria-hidden="true" data-svelte-h="svelte-idje0l">\u{1F4CB}</div> <h3 class="text-xl font-bold text-spore-dark mb-2" data-svelte-h="svelte-14qcuvf">No work orders yet</h3> <p class="text-spore-steel mb-6" data-svelte-h="svelte-jrvcoi">Create your first work order to get started</p> <button class="bg-spore-orange text-white px-6 py-3 rounded-xl hover:bg-spore-orange/90 focus:outline-none focus:ring-2 focus:ring-spore-orange focus:ring-offset-2 transition-colors text-sm font-bold" data-svelte-h="svelte-19pqfzv">+ CREATE WORK ORDER</button></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/14.js
var __exports15 = {};
__export(__exports15, {
  component: () => component14,
  fonts: () => fonts15,
  imports: () => imports15,
  index: () => index15,
  server: () => page_server_ts_exports13,
  server_id: () => server_id14,
  stylesheets: () => stylesheets15
});
var index15, component_cache14, component14, server_id14, imports15, stylesheets15, fonts15;
var init__15 = __esm({
  ".svelte-kit/output/server/nodes/14.js"() {
    init_page_server_ts13();
    index15 = 14;
    component14 = async () => component_cache14 ??= (await Promise.resolve().then(() => (init_page_svelte12(), page_svelte_exports12))).default;
    server_id14 = "src/routes/work-orders/+page.server.ts";
    imports15 = ["_app/immutable/nodes/14.6b04277f.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/websocket.7498009b.js", "_app/immutable/chunks/index.40078100.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/stores.a8838f7a.js"];
    stylesheets15 = [];
    fonts15 = [];
  }
});

// .svelte-kit/output/server/entries/pages/work-orders/_id_/_page.server.ts.js
var page_server_ts_exports14 = {};
__export(page_server_ts_exports14, {
  actions: () => actions11,
  load: () => load14
});
var load14, actions11;
var init_page_server_ts14 = __esm({
  ".svelte-kit/output/server/entries/pages/work-orders/_id_/_page.server.ts.js"() {
    init_prisma();
    init_websocket_handler();
    init_chunks();
    init_guards();
    init_audit();
    load14 = async (event) => {
      requireAuth(event);
      const prisma2 = createRequestPrisma(event);
      const { id } = event.params;
      const workOrder = await prisma2.workOrder.findUnique({
        where: { id },
        include: {
          asset: {
            include: {
              room: {
                include: {
                  site: { select: { id: true, name: true } }
                }
              }
            }
          }
        }
      });
      if (!workOrder) {
        throw error(404, "Work order not found");
      }
      const assets2 = await prisma2.asset.findMany({
        include: {
          room: {
            include: {
              site: { select: { name: true } }
            }
          }
        },
        orderBy: { name: "asc" }
      });
      return { workOrder, assets: assets2 };
    };
    actions11 = {
      updateStatus: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const { id } = event.params;
        const newStatus = formData2.get("status");
        if (!newStatus) {
          return fail(400, { error: "Status is required" });
        }
        const updatedWo = await prisma2.workOrder.update({
          where: { id },
          data: { status: newStatus },
          select: {
            id: true,
            title: true,
            status: true,
            assetId: true,
            orgId: true
          }
        });
        broadcastToOrg(updatedWo.orgId, {
          type: "WO_UPDATE",
          payload: updatedWo
        });
        return { success: true, workOrder: updatedWo };
      },
      update: async (event) => {
        const prisma2 = createRequestPrisma(event);
        const formData2 = await event.request.formData();
        const { id } = event.params;
        const title = formData2.get("title");
        const description = formData2.get("description");
        const assetId = formData2.get("assetId");
        const failureMode = formData2.get("failureMode");
        if (!title || title.trim() === "") {
          return fail(400, { error: "Title is required" });
        }
        if (!assetId) {
          return fail(400, { error: "Asset is required" });
        }
        const workOrder = await prisma2.workOrder.update({
          where: { id },
          data: {
            title: title.trim(),
            description: description?.trim() || "",
            assetId,
            failureMode: failureMode || "General"
          }
        });
        return { success: true, workOrder };
      },
      delete: async (event) => {
        if (!isManagerOrAbove(event)) {
          return fail(403, { error: "Permission denied. Only managers can delete work orders." });
        }
        const prisma2 = createRequestPrisma(event);
        const { id } = event.params;
        const wo = await prisma2.workOrder.findUnique({
          where: { id },
          select: { title: true }
        });
        await prisma2.workOrder.delete({
          where: { id }
        });
        await logAudit(event.locals.user.id, "WORK_ORDER_DELETED", {
          workOrderId: id,
          title: wo?.title
        });
        throw redirect(303, "/work-orders");
      }
    };
  }
});

// .svelte-kit/output/server/entries/pages/work-orders/_id_/_page.svelte.js
var page_svelte_exports13 = {};
__export(page_svelte_exports13, {
  default: () => Page13
});
function getStatusColor2(status) {
  switch (status) {
    case "COMPLETED":
      return "bg-spore-forest text-white";
    case "IN_PROGRESS":
      return "bg-spore-orange text-white";
    case "PENDING":
      return "bg-spore-steel text-white";
    case "ON_HOLD":
      return "bg-spore-cream text-spore-steel";
    case "CANCELLED":
      return "bg-red-600 text-white";
    default:
      return "bg-spore-steel text-white";
  }
}
var Page13;
var init_page_svelte13 = __esm({
  ".svelte-kit/output/server/entries/pages/work-orders/_id_/_page.svelte.js"() {
    init_ssr();
    init_devalue();
    Page13 = create_ssr_component(($$result, $$props, $$bindings, slots) => {
      let workOrder;
      let { data } = $$props;
      const statuses = ["PENDING", "IN_PROGRESS", "ON_HOLD", "COMPLETED", "CANCELLED"];
      if ($$props.data === void 0 && $$bindings.data && data !== void 0)
        $$bindings.data(data);
      workOrder = data.workOrder;
      data.assets || [];
      return `<div class="max-w-4xl mx-auto px-4 py-10"> <div class="mb-6" data-svelte-h="svelte-1wn93l1"><a href="/work-orders" class="text-spore-cream/60 hover:text-spore-cream text-sm font-medium">\u2190 Back to Work Orders</a></div> ${` <div class="bg-spore-white rounded-xl overflow-hidden"> <div class="bg-spore-dark p-6"><div class="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4"><div><h1 class="text-2xl font-extrabold text-spore-cream">${escape(workOrder.title)}</h1> <p class="text-spore-cream/60 mt-1 text-sm">Created ${escape(new Date(workOrder.createdAt).toLocaleDateString())}</p></div> <span class="${"px-4 py-2 text-sm font-bold uppercase tracking-wide rounded-full " + escape(getStatusColor2(workOrder.status), true)}">${escape(workOrder.status.replace("_", " "))}</span></div></div>  <div class="p-6 space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-2 gap-6"><div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-exijn3">Asset</h3> <p class="text-spore-dark font-semibold">${escape(workOrder.asset?.name || "Unassigned")}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-2zeft2">Location</h3> <p class="text-spore-dark font-semibold">${workOrder.asset?.room ? `${escape(workOrder.asset.room.site?.name)} \u2022 Room ${escape(workOrder.asset.room.name)} ${workOrder.asset.room.building ? `\u2022 ${escape(workOrder.asset.room.building)}` : ``} ${workOrder.asset.room.floor ? `\u2022 Floor ${escape(workOrder.asset.room.floor)}` : ``}` : `No location`}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-acu4w0">Failure Mode</h3> <p class="text-spore-dark font-semibold">${escape(workOrder.failureMode || "General")}</p></div> <div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-11fnt6e">Last Updated</h3> <p class="text-spore-dark font-semibold">${escape(new Date(workOrder.updatedAt).toLocaleString())}</p></div></div>  ${workOrder.description ? `<div><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-2" data-svelte-h="svelte-rq73nx">Description</h3> <p class="text-spore-dark whitespace-pre-wrap">${escape(workOrder.description)}</p></div>` : ``}  <div class="border-t border-spore-cream pt-6"><h3 class="text-xs font-bold text-spore-steel uppercase tracking-wide mb-4" data-svelte-h="svelte-c3uwlf">Change Status</h3> <div class="flex flex-wrap gap-2">${each(statuses, (status) => {
        return `<form method="POST" action="?/updateStatus"><input type="hidden" name="status"${add_attribute("value", status, 0)}> <button type="submit" ${workOrder.status === status ? "disabled" : ""} class="${"px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-30 disabled:cursor-not-allowed " + escape(getStatusColor2(status), true) + " hover:opacity-80"}">${escape(status.replace("_", " "))}</button> </form>`;
      })}</div></div>  <div class="border-t border-spore-cream pt-6 flex gap-4"><button class="bg-spore-forest text-white px-6 py-3 rounded-lg font-bold text-sm hover:bg-spore-forest/90 transition-colors" data-svelte-h="svelte-e0q83b">EDIT WORK ORDER</button> <form method="POST" action="?/delete" data-svelte-h="svelte-bqtu42"><button type="submit" class="px-6 py-3 rounded-lg font-bold text-sm text-red-600 border border-red-200 hover:bg-red-50 transition-colors" onclick="return confirm('Are you sure you want to delete this work order?')">DELETE</button></form></div></div></div>`}</div>`;
    });
  }
});

// .svelte-kit/output/server/nodes/15.js
var __exports16 = {};
__export(__exports16, {
  component: () => component15,
  fonts: () => fonts16,
  imports: () => imports16,
  index: () => index16,
  server: () => page_server_ts_exports14,
  server_id: () => server_id15,
  stylesheets: () => stylesheets16
});
var index16, component_cache15, component15, server_id15, imports16, stylesheets16, fonts16;
var init__16 = __esm({
  ".svelte-kit/output/server/nodes/15.js"() {
    init_page_server_ts14();
    index16 = 15;
    component15 = async () => component_cache15 ??= (await Promise.resolve().then(() => (init_page_svelte13(), page_svelte_exports13))).default;
    server_id15 = "src/routes/work-orders/[id]/+page.server.ts";
    imports16 = ["_app/immutable/nodes/15.28f25a79.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/each.12b2b3cf.js", "_app/immutable/chunks/index.7311d585.js", "_app/immutable/chunks/forms.9ef250d9.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js"];
    stylesheets16 = [];
    fonts16 = [];
  }
});

// .svelte-kit/output/server/entries/endpoints/api/activity/_server.ts.js
var server_ts_exports = {};
__export(server_ts_exports, {
  GET: () => GET
});
var activityCache, CACHE_TTL, GET;
var init_server_ts = __esm({
  ".svelte-kit/output/server/entries/endpoints/api/activity/_server.ts.js"() {
    init_chunks();
    init_prisma();
    activityCache = /* @__PURE__ */ new Map();
    CACHE_TTL = 5e3;
    GET = async ({ locals, url }) => {
      try {
        const orgId = locals.user?.orgId;
        if (!orgId) {
          return json({ error: "Unauthorized" }, { status: 401 });
        }
        const now = Date.now();
        const cacheKey = orgId;
        const cached = activityCache.get(cacheKey);
        if (cached && now - cached.timestamp < CACHE_TTL) {
          return json({
            activities: cached.activities,
            cached: true
          });
        }
        const prisma2 = createRequestPrisma({ locals });
        const recentWorkOrders = await prisma2.workOrder.findMany({
          where: {
            orgId,
            updatedAt: {
              gte: new Date(now - 6e4)
              // Last minute of activity
            }
          },
          include: {
            asset: {
              include: {
                room: true
              }
            },
            assignedTo: true
          },
          orderBy: {
            updatedAt: "desc"
          },
          take: 20
        });
        const activities = recentWorkOrders.map((wo) => ({
          type: "WO_UPDATE",
          payload: {
            id: wo.id,
            title: wo.title,
            status: wo.status,
            assetName: wo.asset?.name || "Unknown Asset",
            assignedTo: wo.assignedTo?.firstName || wo.assignedTo?.email || "Unassigned"
          },
          timestamp: wo.updatedAt.getTime()
        }));
        activityCache.set(cacheKey, {
          activities,
          timestamp: now
        });
        return json({
          activities,
          cached: false
        });
      } catch (error2) {
        console.error("[Activity API] Error:", error2);
        return json({ error: "Internal server error" }, { status: 500 });
      }
    };
  }
});

// .svelte-kit/output/server/entries/endpoints/api/debug/env/_server.ts.js
var server_ts_exports2 = {};
__export(server_ts_exports2, {
  GET: () => GET2
});
var GET2;
var init_server_ts2 = __esm({
  ".svelte-kit/output/server/entries/endpoints/api/debug/env/_server.ts.js"() {
    GET2 = async ({ locals }) => {
      if (true) {
        return new Response(JSON.stringify({ error: "Debug endpoint only available in production" }), {
          status: 403,
          headers: { "Content-Type": "application/json" }
        });
      }
      const debug = {
        timestamp: (/* @__PURE__ */ new Date()).toISOString(),
        environment: "development",
        hasDatabaseUrl: !!process.env.DATABASE_URL,
        databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + "...",
        platform: typeof globalThis.navigator !== "undefined" ? "cloudflare" : "node",
        user: locals.user ? {
          id: locals.user.id,
          email: locals.user.email,
          orgId: locals.user.orgId
        } : null,
        headers: {
          "user-agent": typeof globalThis.request !== "undefined" ? globalThis.request.headers.get("user-agent") : "N/A"
        }
      };
      return new Response(JSON.stringify(debug, null, 2), {
        headers: { "Content-Type": "application/json" }
      });
    };
  }
});

// .svelte-kit/output/server/chunks/internal.js
init_ssr();
init_environment();
var base = "";
var assets = base;
var initial = { base, assets };
function reset() {
  base = initial.base;
  assets = initial.assets;
}
var public_env = {};
function set_private_env(environment) {
}
function set_public_env(environment) {
  public_env = environment;
}
function afterUpdate() {
}
var Root = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { stores } = $$props;
  let { page: page2 } = $$props;
  let { constructors } = $$props;
  let { components = [] } = $$props;
  let { form } = $$props;
  let { data_0 = null } = $$props;
  let { data_1 = null } = $$props;
  {
    setContext("__svelte__", stores);
  }
  afterUpdate(stores.page.notify);
  if ($$props.stores === void 0 && $$bindings.stores && stores !== void 0)
    $$bindings.stores(stores);
  if ($$props.page === void 0 && $$bindings.page && page2 !== void 0)
    $$bindings.page(page2);
  if ($$props.constructors === void 0 && $$bindings.constructors && constructors !== void 0)
    $$bindings.constructors(constructors);
  if ($$props.components === void 0 && $$bindings.components && components !== void 0)
    $$bindings.components(components);
  if ($$props.form === void 0 && $$bindings.form && form !== void 0)
    $$bindings.form(form);
  if ($$props.data_0 === void 0 && $$bindings.data_0 && data_0 !== void 0)
    $$bindings.data_0(data_0);
  if ($$props.data_1 === void 0 && $$bindings.data_1 && data_1 !== void 0)
    $$bindings.data_1(data_1);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      stores.page.set(page2);
    }
    $$rendered = `  ${constructors[1] ? `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {
        default: () => {
          return `${validate_component(constructors[1] || missing_component, "svelte:component").$$render(
            $$result,
            { data: data_1, form, this: components[1] },
            {
              this: ($$value) => {
                components[1] = $$value;
                $$settled = false;
              }
            },
            {}
          )}`;
        }
      }
    )}` : `${validate_component(constructors[0] || missing_component, "svelte:component").$$render(
      $$result,
      { data: data_0, form, this: components[0] },
      {
        this: ($$value) => {
          components[0] = $$value;
          $$settled = false;
        }
      },
      {}
    )}`} ${``}`;
  } while (!$$settled);
  return $$rendered;
});
var options = {
  app_template_contains_nonce: false,
  csp: { "mode": "auto", "directives": { "upgrade-insecure-requests": false, "block-all-mixed-content": false }, "reportOnly": { "upgrade-insecure-requests": false, "block-all-mixed-content": false } },
  csrf_check_origin: true,
  track_server_fetches: false,
  embedded: false,
  env_public_prefix: "PUBLIC_",
  env_private_prefix: "",
  hooks: null,
  // added lazily, via `get_hooks`
  preload_strategy: "modulepreload",
  root: Root,
  service_worker: false,
  templates: {
    app: ({ head, body, assets: assets2, nonce, env }) => '<!DOCTYPE html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<link rel="icon" href="' + assets2 + '/favicon.png" />\n		<meta name="viewport" content="width=device-width" />\n		' + head + '\n	</head>\n	<body data-sveltekit-preload-data="hover">\n		<div style="display: contents">' + body + "</div>\n	</body>\n</html>",
    error: ({ status, message }) => '<!doctype html>\n<html lang="en">\n	<head>\n		<meta charset="utf-8" />\n		<title>' + message + `</title>

		<style>
			body {
				--bg: white;
				--fg: #222;
				--divider: #ccc;
				background: var(--bg);
				color: var(--fg);
				font-family:
					system-ui,
					-apple-system,
					BlinkMacSystemFont,
					'Segoe UI',
					Roboto,
					Oxygen,
					Ubuntu,
					Cantarell,
					'Open Sans',
					'Helvetica Neue',
					sans-serif;
				display: flex;
				align-items: center;
				justify-content: center;
				height: 100vh;
				margin: 0;
			}

			.error {
				display: flex;
				align-items: center;
				max-width: 32rem;
				margin: 0 1rem;
			}

			.status {
				font-weight: 200;
				font-size: 3rem;
				line-height: 1;
				position: relative;
				top: -0.05rem;
			}

			.message {
				border-left: 1px solid var(--divider);
				padding: 0 0 0 1rem;
				margin: 0 0 0 1rem;
				min-height: 2.5rem;
				display: flex;
				align-items: center;
			}

			.message h1 {
				font-weight: 400;
				font-size: 1em;
				margin: 0;
			}

			@media (prefers-color-scheme: dark) {
				body {
					--bg: #222;
					--fg: #ddd;
					--divider: #666;
				}
			}
		</style>
	</head>
	<body>
		<div class="error">
			<span class="status">` + status + '</span>\n			<div class="message">\n				<h1>' + message + "</h1>\n			</div>\n		</div>\n	</body>\n</html>\n"
  },
  version_hash: "14ljd3q"
};
function get_hooks() {
  return Promise.resolve().then(() => (init_hooks_server(), hooks_server_exports));
}

// .svelte-kit/output/server/index.js
init_chunks();
init_devalue();
init_index2();
var import_cookie = __toESM(require_dist(), 1);
var set_cookie_parser = __toESM(require_set_cookie(), 1);
var DEV = false;
var SVELTE_KIT_ASSETS = "/_svelte_kit_assets";
var ENDPOINT_METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"];
var PAGE_METHODS = ["GET", "POST", "HEAD"];
function negotiate(accept, types) {
  const parts = [];
  accept.split(",").forEach((str, i) => {
    const match = /([^/]+)\/([^;]+)(?:;q=([0-9.]+))?/.exec(str);
    if (match) {
      const [, type, subtype, q = "1"] = match;
      parts.push({ type, subtype, q: +q, i });
    }
  });
  parts.sort((a, b2) => {
    if (a.q !== b2.q) {
      return b2.q - a.q;
    }
    if (a.subtype === "*" !== (b2.subtype === "*")) {
      return a.subtype === "*" ? 1 : -1;
    }
    if (a.type === "*" !== (b2.type === "*")) {
      return a.type === "*" ? 1 : -1;
    }
    return a.i - b2.i;
  });
  let accepted;
  let min_priority = Infinity;
  for (const mimetype of types) {
    const [type, subtype] = mimetype.split("/");
    const priority = parts.findIndex(
      (part) => (part.type === type || part.type === "*") && (part.subtype === subtype || part.subtype === "*")
    );
    if (priority !== -1 && priority < min_priority) {
      accepted = mimetype;
      min_priority = priority;
    }
  }
  return accepted;
}
function is_content_type(request, ...types) {
  const type = request.headers.get("content-type")?.split(";", 1)[0].trim() ?? "";
  return types.includes(type.toLowerCase());
}
function is_form_content_type(request) {
  return is_content_type(
    request,
    "application/x-www-form-urlencoded",
    "multipart/form-data",
    "text/plain"
  );
}
function exec(match, params, matchers) {
  const result = {};
  const values = match.slice(1);
  const values_needing_match = values.filter((value) => value !== void 0);
  let buffered = 0;
  for (let i = 0; i < params.length; i += 1) {
    const param = params[i];
    let value = values[i - buffered];
    if (param.chained && param.rest && buffered) {
      value = values.slice(i - buffered, i + 1).filter((s22) => s22).join("/");
      buffered = 0;
    }
    if (value === void 0) {
      if (param.rest)
        result[param.name] = "";
      continue;
    }
    if (!param.matcher || matchers[param.matcher](value)) {
      result[param.name] = value;
      const next_param = params[i + 1];
      const next_value = values[i + 1];
      if (next_param && !next_param.rest && next_param.optional && next_value && param.chained) {
        buffered = 0;
      }
      if (!next_param && !next_value && Object.keys(result).length === values_needing_match.length) {
        buffered = 0;
      }
      continue;
    }
    if (param.optional && param.chained) {
      buffered++;
      continue;
    }
    return;
  }
  if (buffered)
    return;
  return result;
}
function coalesce_to_error(err) {
  return err instanceof Error || err && /** @type {any} */
  err.name && /** @type {any} */
  err.message ? (
    /** @type {Error} */
    err
  ) : new Error(JSON.stringify(err));
}
function normalize_error(error2) {
  return (
    /** @type {import('../runtime/control.js').Redirect | import('../runtime/control.js').HttpError | Error} */
    error2
  );
}
function method_not_allowed(mod, method) {
  return text(`${method} method not allowed`, {
    status: 405,
    headers: {
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
      // "The server must generate an Allow header field in a 405 status code response"
      allow: allowed_methods(mod).join(", ")
    }
  });
}
function allowed_methods(mod) {
  const allowed = ENDPOINT_METHODS.filter((method) => method in mod);
  if ("GET" in mod || "HEAD" in mod)
    allowed.push("HEAD");
  return allowed;
}
function static_error_page(options2, status, message) {
  let page2 = options2.templates.error({ status, message });
  return text(page2, {
    headers: { "content-type": "text/html; charset=utf-8" },
    status
  });
}
async function handle_fatal_error(event, options2, error2) {
  error2 = error2 instanceof HttpError ? error2 : coalesce_to_error(error2);
  const status = error2 instanceof HttpError ? error2.status : 500;
  const body = await handle_error_and_jsonify(event, options2, error2);
  const type = negotiate(event.request.headers.get("accept") || "text/html", [
    "application/json",
    "text/html"
  ]);
  if (event.isDataRequest || type === "application/json") {
    return json(body, {
      status
    });
  }
  return static_error_page(options2, status, body.message);
}
async function handle_error_and_jsonify(event, options2, error2) {
  if (error2 instanceof HttpError) {
    return error2.body;
  }
  return await options2.hooks.handleError({ error: error2, event }) ?? {
    message: event.route.id === null && error2 instanceof NotFound ? "Not Found" : "Internal Error"
  };
}
function redirect_response(status, location) {
  const response = new Response(void 0, {
    status,
    headers: { location }
  });
  return response;
}
function clarify_devalue_error(event, error2) {
  if (error2.path) {
    return `Data returned from \`load\` while rendering ${event.route.id} is not serializable: ${error2.message} (data${error2.path})`;
  }
  if (error2.path === "") {
    return `Data returned from \`load\` while rendering ${event.route.id} is not a plain object`;
  }
  return error2.message;
}
function stringify_uses(node) {
  const uses = [];
  if (node.uses && node.uses.dependencies.size > 0) {
    uses.push(`"dependencies":${JSON.stringify(Array.from(node.uses.dependencies))}`);
  }
  if (node.uses && node.uses.params.size > 0) {
    uses.push(`"params":${JSON.stringify(Array.from(node.uses.params))}`);
  }
  if (node.uses?.parent)
    uses.push('"parent":1');
  if (node.uses?.route)
    uses.push('"route":1');
  if (node.uses?.url)
    uses.push('"url":1');
  return `"uses":{${uses.join(",")}}`;
}
function warn_with_callsite(message, offset = 0) {
  console.warn(message);
}
async function render_endpoint(event, mod, state) {
  const method = (
    /** @type {import('types').HttpMethod} */
    event.request.method
  );
  let handler = mod[method] || mod.fallback;
  if (method === "HEAD" && mod.GET && !mod.HEAD) {
    handler = mod.GET;
  }
  if (!handler) {
    return method_not_allowed(mod, method);
  }
  const prerender = mod.prerender ?? state.prerender_default;
  if (prerender && (mod.POST || mod.PATCH || mod.PUT || mod.DELETE)) {
    throw new Error("Cannot prerender endpoints that have mutative methods");
  }
  if (state.prerendering && !prerender) {
    if (state.depth > 0) {
      throw new Error(`${event.route.id} is not prerenderable`);
    } else {
      return new Response(void 0, { status: 204 });
    }
  }
  try {
    let response = await handler(
      /** @type {import('@sveltejs/kit').RequestEvent<Record<string, any>>} */
      event
    );
    if (!(response instanceof Response)) {
      throw new Error(
        `Invalid response from route ${event.url.pathname}: handler should return a Response object`
      );
    }
    if (state.prerendering) {
      response = new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: new Headers(response.headers)
      });
      response.headers.set("x-sveltekit-prerender", String(prerender));
    }
    return response;
  } catch (e3) {
    if (e3 instanceof Redirect) {
      return new Response(void 0, {
        status: e3.status,
        headers: { location: e3.location }
      });
    }
    throw e3;
  }
}
function is_endpoint_request(event) {
  const { method, headers } = event.request;
  if (ENDPOINT_METHODS.includes(method) && !PAGE_METHODS.includes(method)) {
    return true;
  }
  if (method === "POST" && headers.get("x-sveltekit-action") === "true")
    return false;
  const accept = event.request.headers.get("accept") ?? "*/*";
  return negotiate(accept, ["*", "text/html"]) !== "text/html";
}
function compact(arr) {
  return arr.filter(
    /** @returns {val is NonNullable<T>} */
    (val) => val != null
  );
}
var SCHEME = /^[a-z][a-z\d+\-.]+:/i;
var absolute = /^([a-z]+:)?\/?\//;
function resolve(base2, path) {
  if (SCHEME.test(path))
    return path;
  if (path[0] === "#")
    return base2 + path;
  const base_match = absolute.exec(base2);
  const path_match = absolute.exec(path);
  if (!base_match) {
    throw new Error(`bad base path: "${base2}"`);
  }
  const baseparts = path_match ? [] : base2.slice(base_match[0].length).split("/");
  const pathparts = path_match ? path.slice(path_match[0].length).split("/") : path.split("/");
  baseparts.pop();
  for (let i = 0; i < pathparts.length; i += 1) {
    const part = pathparts[i];
    if (part === ".")
      continue;
    else if (part === "..")
      baseparts.pop();
    else
      baseparts.push(part);
  }
  const prefix = path_match && path_match[0] || base_match && base_match[0] || "";
  return `${prefix}${baseparts.join("/")}`;
}
function normalize_path(path, trailing_slash) {
  if (path === "/" || trailing_slash === "ignore")
    return path;
  if (trailing_slash === "never") {
    return path.endsWith("/") ? path.slice(0, -1) : path;
  } else if (trailing_slash === "always" && !path.endsWith("/")) {
    return path + "/";
  }
  return path;
}
function decode_pathname(pathname) {
  return pathname.split("%25").map(decodeURI).join("%25");
}
function decode_params(params) {
  for (const key2 in params) {
    params[key2] = decodeURIComponent(params[key2]);
  }
  return params;
}
var tracked_url_properties = (
  /** @type {const} */
  [
    "href",
    "pathname",
    "search",
    "searchParams",
    "toString",
    "toJSON"
  ]
);
function make_trackable(url, callback) {
  const tracked = new URL(url);
  for (const property of tracked_url_properties) {
    Object.defineProperty(tracked, property, {
      get() {
        callback();
        return url[property];
      },
      enumerable: true,
      configurable: true
    });
  }
  {
    tracked[Symbol.for("nodejs.util.inspect.custom")] = (depth, opts, inspect) => {
      return inspect(url, opts);
    };
  }
  disable_hash(tracked);
  return tracked;
}
function disable_hash(url) {
  allow_nodejs_console_log(url);
  Object.defineProperty(url, "hash", {
    get() {
      throw new Error(
        "Cannot access event.url.hash. Consider using `$page.url.hash` inside a component instead"
      );
    }
  });
}
function disable_search(url) {
  allow_nodejs_console_log(url);
  for (const property of ["search", "searchParams"]) {
    Object.defineProperty(url, property, {
      get() {
        throw new Error(`Cannot access url.${property} on a page with prerendering enabled`);
      }
    });
  }
}
function allow_nodejs_console_log(url) {
  {
    url[Symbol.for("nodejs.util.inspect.custom")] = (depth, opts, inspect) => {
      return inspect(new URL(url), opts);
    };
  }
}
var DATA_SUFFIX = "/__data.json";
function has_data_suffix(pathname) {
  return pathname.endsWith(DATA_SUFFIX);
}
function add_data_suffix(pathname) {
  return pathname.replace(/\/$/, "") + DATA_SUFFIX;
}
function strip_data_suffix(pathname) {
  return pathname.slice(0, -DATA_SUFFIX.length);
}
function is_action_json_request(event) {
  const accept = negotiate(event.request.headers.get("accept") ?? "*/*", [
    "application/json",
    "text/html"
  ]);
  return accept === "application/json" && event.request.method === "POST";
}
async function handle_action_json_request(event, options2, server2) {
  const actions12 = server2?.actions;
  if (!actions12) {
    const no_actions_error = error(405, "POST method not allowed. No actions exist for this page");
    return action_json(
      {
        type: "error",
        error: await handle_error_and_jsonify(event, options2, no_actions_error)
      },
      {
        status: no_actions_error.status,
        headers: {
          // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
          // "The server must generate an Allow header field in a 405 status code response"
          allow: "GET"
        }
      }
    );
  }
  check_named_default_separate(actions12);
  try {
    const data = await call_action(event, actions12);
    if (false)
      ;
    if (data instanceof ActionFailure) {
      return action_json({
        type: "failure",
        status: data.status,
        // @ts-expect-error we assign a string to what is supposed to be an object. That's ok
        // because we don't use the object outside, and this way we have better code navigation
        // through knowing where the related interface is used.
        data: stringify_action_response(
          data.data,
          /** @type {string} */
          event.route.id
        )
      });
    } else {
      return action_json({
        type: "success",
        status: data ? 200 : 204,
        // @ts-expect-error see comment above
        data: stringify_action_response(
          data,
          /** @type {string} */
          event.route.id
        )
      });
    }
  } catch (e3) {
    const err = normalize_error(e3);
    if (err instanceof Redirect) {
      return action_json_redirect(err);
    }
    return action_json(
      {
        type: "error",
        error: await handle_error_and_jsonify(event, options2, check_incorrect_fail_use(err))
      },
      {
        status: err instanceof HttpError ? err.status : 500
      }
    );
  }
}
function check_incorrect_fail_use(error2) {
  return error2 instanceof ActionFailure ? new Error('Cannot "throw fail()". Use "return fail()"') : error2;
}
function action_json_redirect(redirect2) {
  return action_json({
    type: "redirect",
    status: redirect2.status,
    location: redirect2.location
  });
}
function action_json(data, init2) {
  return json(data, init2);
}
function is_action_request(event) {
  return event.request.method === "POST";
}
async function handle_action_request(event, server2) {
  const actions12 = server2?.actions;
  if (!actions12) {
    event.setHeaders({
      // https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/405
      // "The server must generate an Allow header field in a 405 status code response"
      allow: "GET"
    });
    return {
      type: "error",
      error: error(405, "POST method not allowed. No actions exist for this page")
    };
  }
  check_named_default_separate(actions12);
  try {
    const data = await call_action(event, actions12);
    if (false)
      ;
    if (data instanceof ActionFailure) {
      return {
        type: "failure",
        status: data.status,
        data: data.data
      };
    } else {
      return {
        type: "success",
        status: 200,
        // @ts-expect-error this will be removed upon serialization, so `undefined` is the same as omission
        data
      };
    }
  } catch (e3) {
    const err = normalize_error(e3);
    if (err instanceof Redirect) {
      return {
        type: "redirect",
        status: err.status,
        location: err.location
      };
    }
    return {
      type: "error",
      error: check_incorrect_fail_use(err)
    };
  }
}
function check_named_default_separate(actions12) {
  if (actions12.default && Object.keys(actions12).length > 1) {
    throw new Error(
      "When using named actions, the default action cannot be used. See the docs for more info: https://kit.svelte.dev/docs/form-actions#named-actions"
    );
  }
}
async function call_action(event, actions12) {
  const url = new URL(event.request.url);
  let name = "default";
  for (const param of url.searchParams) {
    if (param[0].startsWith("/")) {
      name = param[0].slice(1);
      if (name === "default") {
        throw new Error('Cannot use reserved action name "default"');
      }
      break;
    }
  }
  const action = actions12[name];
  if (!action) {
    throw new Error(`No action with name '${name}' found`);
  }
  if (!is_form_content_type(event.request)) {
    throw new Error(
      `Actions expect form-encoded data (received ${event.request.headers.get("content-type")})`
    );
  }
  return action(event);
}
function uneval_action_response(data, route_id) {
  return try_deserialize(data, uneval, route_id);
}
function stringify_action_response(data, route_id) {
  return try_deserialize(data, stringify, route_id);
}
function try_deserialize(data, fn, route_id) {
  try {
    return fn(data);
  } catch (e3) {
    const error2 = (
      /** @type {any} */
      e3
    );
    if ("path" in error2) {
      let message = `Data returned from action inside ${route_id} is not serializable: ${error2.message}`;
      if (error2.path !== "")
        message += ` (data.${error2.path})`;
      throw new Error(message);
    }
    throw error2;
  }
}
async function unwrap_promises(object, id) {
  for (const key2 in object) {
    if (typeof object[key2]?.then === "function") {
      return Object.fromEntries(
        await Promise.all(Object.entries(object).map(async ([key3, value]) => [key3, await value]))
      );
    }
  }
  return object;
}
var INVALIDATED_PARAM = "x-sveltekit-invalidated";
var TRAILING_SLASH_PARAM = "x-sveltekit-trailing-slash";
async function load_server_data({
  event,
  state,
  node,
  parent,
  // TODO 2.0: Remove this
  track_server_fetches
}) {
  if (!node?.server)
    return null;
  const uses = {
    dependencies: /* @__PURE__ */ new Set(),
    params: /* @__PURE__ */ new Set(),
    parent: false,
    route: false,
    url: false
  };
  const url = make_trackable(event.url, () => {
    uses.url = true;
  });
  if (state.prerendering) {
    disable_search(url);
  }
  const result = await node.server.load?.call(null, {
    ...event,
    fetch: (info, init2) => {
      const url2 = new URL(info instanceof Request ? info.url : info, event.url);
      if (track_server_fetches) {
        uses.dependencies.add(url2.href);
      }
      return event.fetch(info, init2);
    },
    /** @param {string[]} deps */
    depends: (...deps) => {
      for (const dep of deps) {
        const { href } = new URL(dep, event.url);
        uses.dependencies.add(href);
      }
    },
    params: new Proxy(event.params, {
      get: (target, key2) => {
        uses.params.add(key2);
        return target[
          /** @type {string} */
          key2
        ];
      }
    }),
    parent: async () => {
      uses.parent = true;
      return parent();
    },
    route: new Proxy(event.route, {
      get: (target, key2) => {
        uses.route = true;
        return target[
          /** @type {'id'} */
          key2
        ];
      }
    }),
    url
  });
  const data = result ? await unwrap_promises(result, node.server_id) : null;
  return {
    type: "data",
    data,
    uses,
    slash: node.server.trailingSlash
  };
}
async function load_data({
  event,
  fetched,
  node,
  parent,
  server_data_promise,
  state,
  resolve_opts,
  csr
}) {
  const server_data_node = await server_data_promise;
  if (!node?.universal?.load) {
    return server_data_node?.data ?? null;
  }
  const result = await node.universal.load.call(null, {
    url: event.url,
    params: event.params,
    data: server_data_node?.data ?? null,
    route: event.route,
    fetch: create_universal_fetch(event, state, fetched, csr, resolve_opts),
    setHeaders: event.setHeaders,
    depends: () => {
    },
    parent
  });
  const data = result ? await unwrap_promises(result, node.universal_id) : null;
  return data;
}
function b64_encode(buffer) {
  if (globalThis.Buffer) {
    return Buffer.from(buffer).toString("base64");
  }
  const little_endian = new Uint8Array(new Uint16Array([1]).buffer)[0] > 0;
  return btoa(
    new TextDecoder(little_endian ? "utf-16le" : "utf-16be").decode(
      new Uint16Array(new Uint8Array(buffer))
    )
  );
}
function create_universal_fetch(event, state, fetched, csr, resolve_opts) {
  const universal_fetch = async (input, init2) => {
    const cloned_body = input instanceof Request && input.body ? input.clone().body : null;
    const cloned_headers = input instanceof Request && [...input.headers].length ? new Headers(input.headers) : init2?.headers;
    let response = await event.fetch(input, init2);
    const url = new URL(input instanceof Request ? input.url : input, event.url);
    const same_origin = url.origin === event.url.origin;
    let dependency;
    if (same_origin) {
      if (state.prerendering) {
        dependency = { response, body: null };
        state.prerendering.dependencies.set(url.pathname, dependency);
      }
    } else {
      const mode = input instanceof Request ? input.mode : init2?.mode ?? "cors";
      if (mode === "no-cors") {
        response = new Response("", {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      } else {
        const acao = response.headers.get("access-control-allow-origin");
        if (!acao || acao !== event.url.origin && acao !== "*") {
          throw new Error(
            `CORS error: ${acao ? "Incorrect" : "No"} 'Access-Control-Allow-Origin' header is present on the requested resource`
          );
        }
      }
    }
    const proxy = new Proxy(response, {
      get(response2, key2, _receiver) {
        async function push_fetched(body, is_b64) {
          const status_number = Number(response2.status);
          if (isNaN(status_number)) {
            throw new Error(
              `response.status is not a number. value: "${response2.status}" type: ${typeof response2.status}`
            );
          }
          fetched.push({
            url: same_origin ? url.href.slice(event.url.origin.length) : url.href,
            method: event.request.method,
            request_body: (
              /** @type {string | ArrayBufferView | undefined} */
              input instanceof Request && cloned_body ? await stream_to_string(cloned_body) : init2?.body
            ),
            request_headers: cloned_headers,
            response_body: body,
            response: response2,
            is_b64
          });
        }
        if (key2 === "arrayBuffer") {
          return async () => {
            const buffer = await response2.arrayBuffer();
            if (dependency) {
              dependency.body = new Uint8Array(buffer);
            }
            if (buffer instanceof ArrayBuffer) {
              await push_fetched(b64_encode(buffer), true);
            }
            return buffer;
          };
        }
        async function text2() {
          const body = await response2.text();
          if (!body || typeof body === "string") {
            await push_fetched(body, false);
          }
          if (dependency) {
            dependency.body = body;
          }
          return body;
        }
        if (key2 === "text") {
          return text2;
        }
        if (key2 === "json") {
          return async () => {
            return JSON.parse(await text2());
          };
        }
        return Reflect.get(response2, key2, response2);
      }
    });
    if (csr) {
      const get = response.headers.get;
      response.headers.get = (key2) => {
        const lower = key2.toLowerCase();
        const value = get.call(response.headers, lower);
        if (value && !lower.startsWith("x-sveltekit-")) {
          const included = resolve_opts.filterSerializedResponseHeaders(lower, value);
          if (!included) {
            throw new Error(
              `Failed to get response header "${lower}" \u2014 it must be included by the \`filterSerializedResponseHeaders\` option: https://kit.svelte.dev/docs/hooks#server-hooks-handle (at ${event.route.id})`
            );
          }
        }
        return value;
      };
    }
    return proxy;
  };
  return (input, init2) => {
    const response = universal_fetch(input, init2);
    response.catch(() => {
    });
    return response;
  };
}
async function stream_to_string(stream) {
  let result = "";
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  while (true) {
    const { done, value } = await reader.read();
    if (done) {
      break;
    }
    result += decoder.decode(value);
  }
  return result;
}
function hash2(...values) {
  let hash22 = 5381;
  for (const value of values) {
    if (typeof value === "string") {
      let i = value.length;
      while (i)
        hash22 = hash22 * 33 ^ value.charCodeAt(--i);
    } else if (ArrayBuffer.isView(value)) {
      const buffer = new Uint8Array(value.buffer, value.byteOffset, value.byteLength);
      let i = buffer.length;
      while (i)
        hash22 = hash22 * 33 ^ buffer[--i];
    } else {
      throw new TypeError("value must be a string or TypedArray");
    }
  }
  return (hash22 >>> 0).toString(36);
}
var escape_html_attr_dict = {
  "&": "&amp;",
  '"': "&quot;"
};
var escape_html_attr_regex = new RegExp(
  // special characters
  `[${Object.keys(escape_html_attr_dict).join("")}]|[\\ud800-\\udbff](?![\\udc00-\\udfff])|[\\ud800-\\udbff][\\udc00-\\udfff]|[\\udc00-\\udfff]`,
  "g"
);
function escape_html_attr(str) {
  const escaped_str = str.replace(escape_html_attr_regex, (match) => {
    if (match.length === 2) {
      return match;
    }
    return escape_html_attr_dict[match] ?? `&#${match.charCodeAt(0)};`;
  });
  return `"${escaped_str}"`;
}
var replacements = {
  "<": "\\u003C",
  "\u2028": "\\u2028",
  "\u2029": "\\u2029"
};
var pattern = new RegExp(`[${Object.keys(replacements).join("")}]`, "g");
function serialize_data(fetched, filter, prerendering = false) {
  const headers = {};
  let cache_control = null;
  let age = null;
  let varyAny = false;
  for (const [key2, value] of fetched.response.headers) {
    if (filter(key2, value)) {
      headers[key2] = value;
    }
    if (key2 === "cache-control")
      cache_control = value;
    else if (key2 === "age")
      age = value;
    else if (key2 === "vary" && value.trim() === "*")
      varyAny = true;
  }
  const payload = {
    status: fetched.response.status,
    statusText: fetched.response.statusText,
    headers,
    body: fetched.response_body
  };
  const safe_payload = JSON.stringify(payload).replace(pattern, (match) => replacements[match]);
  const attrs = [
    'type="application/json"',
    "data-sveltekit-fetched",
    `data-url=${escape_html_attr(fetched.url)}`
  ];
  if (fetched.is_b64) {
    attrs.push("data-b64");
  }
  if (fetched.request_headers || fetched.request_body) {
    const values = [];
    if (fetched.request_headers) {
      values.push([...new Headers(fetched.request_headers)].join(","));
    }
    if (fetched.request_body) {
      values.push(fetched.request_body);
    }
    attrs.push(`data-hash="${hash2(...values)}"`);
  }
  if (!prerendering && fetched.method === "GET" && cache_control && !varyAny) {
    const match = /s-maxage=(\d+)/g.exec(cache_control) ?? /max-age=(\d+)/g.exec(cache_control);
    if (match) {
      const ttl = +match[1] - +(age ?? "0");
      attrs.push(`data-ttl="${ttl}"`);
    }
  }
  return `<script ${attrs.join(" ")}>${safe_payload}<\/script>`;
}
var s = JSON.stringify;
var encoder$2 = new TextEncoder();
function sha256(data) {
  if (!key[0])
    precompute();
  const out = init.slice(0);
  const array2 = encode(data);
  for (let i = 0; i < array2.length; i += 16) {
    const w2 = array2.subarray(i, i + 16);
    let tmp;
    let a;
    let b2;
    let out0 = out[0];
    let out1 = out[1];
    let out2 = out[2];
    let out3 = out[3];
    let out4 = out[4];
    let out5 = out[5];
    let out6 = out[6];
    let out7 = out[7];
    for (let i2 = 0; i2 < 64; i2++) {
      if (i2 < 16) {
        tmp = w2[i2];
      } else {
        a = w2[i2 + 1 & 15];
        b2 = w2[i2 + 14 & 15];
        tmp = w2[i2 & 15] = (a >>> 7 ^ a >>> 18 ^ a >>> 3 ^ a << 25 ^ a << 14) + (b2 >>> 17 ^ b2 >>> 19 ^ b2 >>> 10 ^ b2 << 15 ^ b2 << 13) + w2[i2 & 15] + w2[i2 + 9 & 15] | 0;
      }
      tmp = tmp + out7 + (out4 >>> 6 ^ out4 >>> 11 ^ out4 >>> 25 ^ out4 << 26 ^ out4 << 21 ^ out4 << 7) + (out6 ^ out4 & (out5 ^ out6)) + key[i2];
      out7 = out6;
      out6 = out5;
      out5 = out4;
      out4 = out3 + tmp | 0;
      out3 = out2;
      out2 = out1;
      out1 = out0;
      out0 = tmp + (out1 & out2 ^ out3 & (out1 ^ out2)) + (out1 >>> 2 ^ out1 >>> 13 ^ out1 >>> 22 ^ out1 << 30 ^ out1 << 19 ^ out1 << 10) | 0;
    }
    out[0] = out[0] + out0 | 0;
    out[1] = out[1] + out1 | 0;
    out[2] = out[2] + out2 | 0;
    out[3] = out[3] + out3 | 0;
    out[4] = out[4] + out4 | 0;
    out[5] = out[5] + out5 | 0;
    out[6] = out[6] + out6 | 0;
    out[7] = out[7] + out7 | 0;
  }
  const bytes = new Uint8Array(out.buffer);
  reverse_endianness(bytes);
  return base64(bytes);
}
var init = new Uint32Array(8);
var key = new Uint32Array(64);
function precompute() {
  function frac(x2) {
    return (x2 - Math.floor(x2)) * 4294967296;
  }
  let prime = 2;
  for (let i = 0; i < 64; prime++) {
    let is_prime = true;
    for (let factor = 2; factor * factor <= prime; factor++) {
      if (prime % factor === 0) {
        is_prime = false;
        break;
      }
    }
    if (is_prime) {
      if (i < 8) {
        init[i] = frac(prime ** (1 / 2));
      }
      key[i] = frac(prime ** (1 / 3));
      i++;
    }
  }
}
function reverse_endianness(bytes) {
  for (let i = 0; i < bytes.length; i += 4) {
    const a = bytes[i + 0];
    const b2 = bytes[i + 1];
    const c2 = bytes[i + 2];
    const d = bytes[i + 3];
    bytes[i + 0] = d;
    bytes[i + 1] = c2;
    bytes[i + 2] = b2;
    bytes[i + 3] = a;
  }
}
function encode(str) {
  const encoded = encoder$2.encode(str);
  const length = encoded.length * 8;
  const size = 512 * Math.ceil((length + 65) / 512);
  const bytes = new Uint8Array(size / 8);
  bytes.set(encoded);
  bytes[encoded.length] = 128;
  reverse_endianness(bytes);
  const words = new Uint32Array(bytes.buffer);
  words[words.length - 2] = Math.floor(length / 4294967296);
  words[words.length - 1] = length;
  return words;
}
var chars2 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
function base64(bytes) {
  const l2 = bytes.length;
  let result = "";
  let i;
  for (i = 2; i < l2; i += 3) {
    result += chars2[bytes[i - 2] >> 2];
    result += chars2[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += chars2[(bytes[i - 1] & 15) << 2 | bytes[i] >> 6];
    result += chars2[bytes[i] & 63];
  }
  if (i === l2 + 1) {
    result += chars2[bytes[i - 2] >> 2];
    result += chars2[(bytes[i - 2] & 3) << 4];
    result += "==";
  }
  if (i === l2) {
    result += chars2[bytes[i - 2] >> 2];
    result += chars2[(bytes[i - 2] & 3) << 4 | bytes[i - 1] >> 4];
    result += chars2[(bytes[i - 1] & 15) << 2];
    result += "=";
  }
  return result;
}
var array = new Uint8Array(16);
function generate_nonce() {
  crypto.getRandomValues(array);
  return base64(array);
}
var quoted = /* @__PURE__ */ new Set([
  "self",
  "unsafe-eval",
  "unsafe-hashes",
  "unsafe-inline",
  "none",
  "strict-dynamic",
  "report-sample",
  "wasm-unsafe-eval",
  "script"
]);
var crypto_pattern = /^(nonce|sha\d\d\d)-/;
var BaseProvider = class {
  /** @type {boolean} */
  #use_hashes;
  /** @type {boolean} */
  #script_needs_csp;
  /** @type {boolean} */
  #style_needs_csp;
  /** @type {import('types').CspDirectives} */
  #directives;
  /** @type {import('types').Csp.Source[]} */
  #script_src;
  /** @type {import('types').Csp.Source[]} */
  #style_src;
  /** @type {string} */
  #nonce;
  /**
   * @param {boolean} use_hashes
   * @param {import('types').CspDirectives} directives
   * @param {string} nonce
   */
  constructor(use_hashes, directives, nonce) {
    this.#use_hashes = use_hashes;
    this.#directives = directives;
    const d = this.#directives;
    this.#script_src = [];
    this.#style_src = [];
    const effective_script_src = d["script-src"] || d["default-src"];
    const effective_style_src = d["style-src"] || d["default-src"];
    this.#script_needs_csp = !!effective_script_src && effective_script_src.filter((value) => value !== "unsafe-inline").length > 0;
    this.#style_needs_csp = !!effective_style_src && effective_style_src.filter((value) => value !== "unsafe-inline").length > 0;
    this.script_needs_nonce = this.#script_needs_csp && !this.#use_hashes;
    this.style_needs_nonce = this.#style_needs_csp && !this.#use_hashes;
    this.#nonce = nonce;
  }
  /** @param {string} content */
  add_script(content) {
    if (this.#script_needs_csp) {
      if (this.#use_hashes) {
        this.#script_src.push(`sha256-${sha256(content)}`);
      } else if (this.#script_src.length === 0) {
        this.#script_src.push(`nonce-${this.#nonce}`);
      }
    }
  }
  /** @param {string} content */
  add_style(content) {
    if (this.#style_needs_csp) {
      if (this.#use_hashes) {
        this.#style_src.push(`sha256-${sha256(content)}`);
      } else if (this.#style_src.length === 0) {
        this.#style_src.push(`nonce-${this.#nonce}`);
      }
    }
  }
  /**
   * @param {boolean} [is_meta]
   */
  get_header(is_meta = false) {
    const header = [];
    const directives = { ...this.#directives };
    if (this.#style_src.length > 0) {
      directives["style-src"] = [
        ...directives["style-src"] || directives["default-src"] || [],
        ...this.#style_src
      ];
    }
    if (this.#script_src.length > 0) {
      directives["script-src"] = [
        ...directives["script-src"] || directives["default-src"] || [],
        ...this.#script_src
      ];
    }
    for (const key2 in directives) {
      if (is_meta && (key2 === "frame-ancestors" || key2 === "report-uri" || key2 === "sandbox")) {
        continue;
      }
      const value = (
        /** @type {string[] | true} */
        directives[key2]
      );
      if (!value)
        continue;
      const directive = [key2];
      if (Array.isArray(value)) {
        value.forEach((value2) => {
          if (quoted.has(value2) || crypto_pattern.test(value2)) {
            directive.push(`'${value2}'`);
          } else {
            directive.push(value2);
          }
        });
      }
      header.push(directive.join(" "));
    }
    return header.join("; ");
  }
};
var CspProvider = class extends BaseProvider {
  get_meta() {
    const content = this.get_header(true);
    if (!content) {
      return;
    }
    return `<meta http-equiv="content-security-policy" content=${escape_html_attr(content)}>`;
  }
};
var CspReportOnlyProvider = class extends BaseProvider {
  /**
   * @param {boolean} use_hashes
   * @param {import('types').CspDirectives} directives
   * @param {string} nonce
   */
  constructor(use_hashes, directives, nonce) {
    super(use_hashes, directives, nonce);
    if (Object.values(directives).filter((v) => !!v).length > 0) {
      const has_report_to = directives["report-to"]?.length ?? 0 > 0;
      const has_report_uri = directives["report-uri"]?.length ?? 0 > 0;
      if (!has_report_to && !has_report_uri) {
        throw Error(
          "`content-security-policy-report-only` must be specified with either the `report-to` or `report-uri` directives, or both"
        );
      }
    }
  }
};
var Csp = class {
  /** @readonly */
  nonce = generate_nonce();
  /** @type {CspProvider} */
  csp_provider;
  /** @type {CspReportOnlyProvider} */
  report_only_provider;
  /**
   * @param {import('./types.js').CspConfig} config
   * @param {import('./types.js').CspOpts} opts
   */
  constructor({ mode, directives, reportOnly }, { prerender }) {
    const use_hashes = mode === "hash" || mode === "auto" && prerender;
    this.csp_provider = new CspProvider(use_hashes, directives, this.nonce);
    this.report_only_provider = new CspReportOnlyProvider(use_hashes, reportOnly, this.nonce);
  }
  get script_needs_nonce() {
    return this.csp_provider.script_needs_nonce || this.report_only_provider.script_needs_nonce;
  }
  get style_needs_nonce() {
    return this.csp_provider.style_needs_nonce || this.report_only_provider.style_needs_nonce;
  }
  /** @param {string} content */
  add_script(content) {
    this.csp_provider.add_script(content);
    this.report_only_provider.add_script(content);
  }
  /** @param {string} content */
  add_style(content) {
    this.csp_provider.add_style(content);
    this.report_only_provider.add_style(content);
  }
};
function defer() {
  let fulfil;
  let reject;
  const promise = new Promise((f2, r3) => {
    fulfil = f2;
    reject = r3;
  });
  return { promise, fulfil, reject };
}
function create_async_iterator() {
  const deferred = [defer()];
  return {
    iterator: {
      [Symbol.asyncIterator]() {
        return {
          next: async () => {
            const next = await deferred[0].promise;
            if (!next.done)
              deferred.shift();
            return next;
          }
        };
      }
    },
    push: (value) => {
      deferred[deferred.length - 1].fulfil({
        value,
        done: false
      });
      deferred.push(defer());
    },
    done: () => {
      deferred[deferred.length - 1].fulfil({ done: true });
    }
  };
}
var updated = {
  ...readable(false),
  check: () => false
};
var encoder$1 = new TextEncoder();
async function render_response({
  branch,
  fetched,
  options: options2,
  manifest: manifest2,
  state,
  page_config,
  status,
  error: error2 = null,
  event,
  resolve_opts,
  action_result
}) {
  if (state.prerendering) {
    if (options2.csp.mode === "nonce") {
      throw new Error('Cannot use prerendering if config.kit.csp.mode === "nonce"');
    }
    if (options2.app_template_contains_nonce) {
      throw new Error("Cannot use prerendering if page template contains %sveltekit.nonce%");
    }
  }
  const { client } = manifest2._;
  const modulepreloads = new Set(client.imports);
  const stylesheets17 = new Set(client.stylesheets);
  const fonts17 = new Set(client.fonts);
  const link_header_preloads = /* @__PURE__ */ new Set();
  const inline_styles = /* @__PURE__ */ new Map();
  let rendered;
  const form_value = action_result?.type === "success" || action_result?.type === "failure" ? action_result.data ?? null : null;
  let base$1 = base;
  let assets$1 = assets;
  let base_expression = s(base);
  if (!state.prerendering?.fallback) {
    const segments = event.url.pathname.slice(base.length).split("/").slice(2);
    base$1 = segments.map(() => "..").join("/") || ".";
    base_expression = `new URL(${s(base$1)}, location).pathname.slice(0, -1)`;
    if (!assets || assets[0] === "/" && assets !== SVELTE_KIT_ASSETS) {
      assets$1 = base$1;
    }
  }
  if (page_config.ssr) {
    const props = {
      stores: {
        page: writable(null),
        navigating: writable(null),
        updated
      },
      constructors: await Promise.all(branch.map(({ node }) => node.component())),
      form: form_value
    };
    let data2 = {};
    for (let i = 0; i < branch.length; i += 1) {
      data2 = { ...data2, ...branch[i].data };
      props[`data_${i}`] = data2;
    }
    props.page = {
      error: error2,
      params: (
        /** @type {Record<string, any>} */
        event.params
      ),
      route: event.route,
      status,
      url: event.url,
      data: data2,
      form: form_value
    };
    {
      try {
        rendered = options2.root.render(props);
      } finally {
        reset();
      }
    }
    for (const { node } of branch) {
      for (const url of node.imports)
        modulepreloads.add(url);
      for (const url of node.stylesheets)
        stylesheets17.add(url);
      for (const url of node.fonts)
        fonts17.add(url);
      if (node.inline_styles) {
        Object.entries(await node.inline_styles()).forEach(([k2, v]) => inline_styles.set(k2, v));
      }
    }
  } else {
    rendered = { head: "", html: "", css: { code: "", map: null } };
  }
  let head = "";
  let body = rendered.html;
  const csp = new Csp(options2.csp, {
    prerender: !!state.prerendering
  });
  const prefixed = (path) => {
    if (path.startsWith("/")) {
      return base + path;
    }
    return `${assets$1}/${path}`;
  };
  if (inline_styles.size > 0) {
    const content = Array.from(inline_styles.values()).join("\n");
    const attributes = [];
    if (csp.style_needs_nonce)
      attributes.push(` nonce="${csp.nonce}"`);
    csp.add_style(content);
    head += `
	<style${attributes.join("")}>${content}</style>`;
  }
  for (const dep of stylesheets17) {
    const path = prefixed(dep);
    const attributes = ['rel="stylesheet"'];
    if (inline_styles.has(dep)) {
      attributes.push("disabled", 'media="(max-width: 0)"');
    } else {
      if (resolve_opts.preload({ type: "css", path })) {
        const preload_atts = ['rel="preload"', 'as="style"'];
        link_header_preloads.add(`<${encodeURI(path)}>; ${preload_atts.join(";")}; nopush`);
      }
    }
    head += `
		<link href="${path}" ${attributes.join(" ")}>`;
  }
  for (const dep of fonts17) {
    const path = prefixed(dep);
    if (resolve_opts.preload({ type: "font", path })) {
      const ext = dep.slice(dep.lastIndexOf(".") + 1);
      const attributes = [
        'rel="preload"',
        'as="font"',
        `type="font/${ext}"`,
        `href="${path}"`,
        "crossorigin"
      ];
      head += `
		<link ${attributes.join(" ")}>`;
    }
  }
  const global = `__sveltekit_${options2.version_hash}`;
  const { data, chunks } = get_data(
    event,
    options2,
    branch.map((b2) => b2.server_data),
    global
  );
  if (page_config.ssr && page_config.csr) {
    body += `
			${fetched.map(
      (item) => serialize_data(item, resolve_opts.filterSerializedResponseHeaders, !!state.prerendering)
    ).join("\n			")}`;
  }
  if (page_config.csr) {
    const included_modulepreloads = Array.from(modulepreloads, (dep) => prefixed(dep)).filter(
      (path) => resolve_opts.preload({ type: "js", path })
    );
    for (const path of included_modulepreloads) {
      link_header_preloads.add(`<${encodeURI(path)}>; rel="modulepreload"; nopush`);
      if (options2.preload_strategy !== "modulepreload") {
        head += `
		<link rel="preload" as="script" crossorigin="anonymous" href="${path}">`;
      } else if (state.prerendering) {
        head += `
		<link rel="modulepreload" href="${path}">`;
      }
    }
    const blocks = [];
    const properties = [
      assets && `assets: ${s(assets)}`,
      `base: ${base_expression}`,
      `env: ${s(public_env)}`
    ].filter(Boolean);
    if (chunks) {
      blocks.push("const deferred = new Map();");
      properties.push(`defer: (id) => new Promise((fulfil, reject) => {
							deferred.set(id, { fulfil, reject });
						})`);
      properties.push(`resolve: ({ id, data, error }) => {
							const { fulfil, reject } = deferred.get(id);
							deferred.delete(id);

							if (error) reject(error);
							else fulfil(data);
						}`);
    }
    blocks.push(`${global} = {
						${properties.join(",\n						")}
					};`);
    const args = ["app", "element"];
    blocks.push("const element = document.currentScript.parentElement;");
    if (page_config.ssr) {
      const serialized = { form: "null", error: "null" };
      blocks.push(`const data = ${data};`);
      if (form_value) {
        serialized.form = uneval_action_response(
          form_value,
          /** @type {string} */
          event.route.id
        );
      }
      if (error2) {
        serialized.error = uneval(error2);
      }
      const hydrate = [
        `node_ids: [${branch.map(({ node }) => node.index).join(", ")}]`,
        "data",
        `form: ${serialized.form}`,
        `error: ${serialized.error}`
      ];
      if (status !== 200) {
        hydrate.push(`status: ${status}`);
      }
      if (options2.embedded) {
        hydrate.push(`params: ${uneval(event.params)}`, `route: ${s(event.route)}`);
      }
      args.push(`{
							${hydrate.join(",\n							")}
						}`);
    }
    blocks.push(`Promise.all([
						import(${s(prefixed(client.start))}),
						import(${s(prefixed(client.app))})
					]).then(([kit, app]) => {
						kit.start(${args.join(", ")});
					});`);
    if (options2.service_worker) {
      const opts = "";
      blocks.push(`if ('serviceWorker' in navigator) {
						addEventListener('load', function () {
							navigator.serviceWorker.register('${prefixed("service-worker.js")}'${opts});
						});
					}`);
    }
    const init_app = `
				{
					${blocks.join("\n\n					")}
				}
			`;
    csp.add_script(init_app);
    body += `
			<script${csp.script_needs_nonce ? ` nonce="${csp.nonce}"` : ""}>${init_app}<\/script>
		`;
  }
  const headers = new Headers({
    "x-sveltekit-page": "true",
    "content-type": "text/html"
  });
  if (state.prerendering) {
    const http_equiv = [];
    const csp_headers = csp.csp_provider.get_meta();
    if (csp_headers) {
      http_equiv.push(csp_headers);
    }
    if (state.prerendering.cache) {
      http_equiv.push(`<meta http-equiv="cache-control" content="${state.prerendering.cache}">`);
    }
    if (http_equiv.length > 0) {
      head = http_equiv.join("\n") + head;
    }
  } else {
    const csp_header = csp.csp_provider.get_header();
    if (csp_header) {
      headers.set("content-security-policy", csp_header);
    }
    const report_only_header = csp.report_only_provider.get_header();
    if (report_only_header) {
      headers.set("content-security-policy-report-only", report_only_header);
    }
    if (link_header_preloads.size) {
      headers.set("link", Array.from(link_header_preloads).join(", "));
    }
  }
  head += rendered.head;
  const html = options2.templates.app({
    head,
    body,
    assets: assets$1,
    nonce: (
      /** @type {string} */
      csp.nonce
    ),
    env: public_env
  });
  const transformed = await resolve_opts.transformPageChunk({
    html,
    done: true
  }) || "";
  if (!chunks) {
    headers.set("etag", `"${hash2(transformed)}"`);
  }
  return !chunks ? text(transformed, {
    status,
    headers
  }) : new Response(
    new ReadableStream({
      async start(controller) {
        controller.enqueue(encoder$1.encode(transformed + "\n"));
        for await (const chunk of chunks) {
          controller.enqueue(encoder$1.encode(chunk));
        }
        controller.close();
      },
      type: "bytes"
    }),
    {
      headers: {
        "content-type": "text/html"
      }
    }
  );
}
function get_data(event, options2, nodes, global) {
  let promise_id = 1;
  let count = 0;
  const { iterator, push, done } = create_async_iterator();
  function replacer(thing) {
    if (typeof thing?.then === "function") {
      const id = promise_id++;
      count += 1;
      thing.then(
        /** @param {any} data */
        (data) => ({ data })
      ).catch(
        /** @param {any} error */
        async (error2) => ({
          error: await handle_error_and_jsonify(event, options2, error2)
        })
      ).then(
        /**
         * @param {{data: any; error: any}} result
         */
        async ({ data, error: error2 }) => {
          count -= 1;
          let str;
          try {
            str = uneval({ id, data, error: error2 }, replacer);
          } catch (e3) {
            error2 = await handle_error_and_jsonify(
              event,
              options2,
              new Error(`Failed to serialize promise while rendering ${event.route.id}`)
            );
            data = void 0;
            str = uneval({ id, data, error: error2 }, replacer);
          }
          push(`<script>${global}.resolve(${str})<\/script>
`);
          if (count === 0)
            done();
        }
      );
      return `${global}.defer(${id})`;
    }
  }
  try {
    const strings = nodes.map((node) => {
      if (!node)
        return "null";
      return `{"type":"data","data":${uneval(node.data, replacer)},${stringify_uses(node)}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
    });
    return {
      data: `[${strings.join(",")}]`,
      chunks: count > 0 ? iterator : null
    };
  } catch (e3) {
    throw new Error(clarify_devalue_error(
      event,
      /** @type {any} */
      e3
    ));
  }
}
function get_option(nodes, option) {
  return nodes.reduce(
    (value, node) => {
      return (
        /** @type {Value} TypeScript's too dumb to understand this */
        node?.universal?.[option] ?? node?.server?.[option] ?? value
      );
    },
    /** @type {Value | undefined} */
    void 0
  );
}
async function respond_with_error({
  event,
  options: options2,
  manifest: manifest2,
  state,
  status,
  error: error2,
  resolve_opts
}) {
  if (event.request.headers.get("x-sveltekit-error")) {
    return static_error_page(
      options2,
      status,
      /** @type {Error} */
      error2.message
    );
  }
  const fetched = [];
  try {
    const branch = [];
    const default_layout = await manifest2._.nodes[0]();
    const ssr = get_option([default_layout], "ssr") ?? true;
    const csr = get_option([default_layout], "csr") ?? true;
    if (ssr) {
      state.error = true;
      const server_data_promise = load_server_data({
        event,
        state,
        node: default_layout,
        parent: async () => ({}),
        track_server_fetches: options2.track_server_fetches
      });
      const server_data = await server_data_promise;
      const data = await load_data({
        event,
        fetched,
        node: default_layout,
        parent: async () => ({}),
        resolve_opts,
        server_data_promise,
        state,
        csr
      });
      branch.push(
        {
          node: default_layout,
          server_data,
          data
        },
        {
          node: await manifest2._.nodes[1](),
          // 1 is always the root error
          data: null,
          server_data: null
        }
      );
    }
    return await render_response({
      options: options2,
      manifest: manifest2,
      state,
      page_config: {
        ssr,
        csr: get_option([default_layout], "csr") ?? true
      },
      status,
      error: await handle_error_and_jsonify(event, options2, error2),
      branch,
      fetched,
      event,
      resolve_opts
    });
  } catch (e3) {
    if (e3 instanceof Redirect) {
      return redirect_response(e3.status, e3.location);
    }
    return static_error_page(
      options2,
      e3 instanceof HttpError ? e3.status : 500,
      (await handle_error_and_jsonify(event, options2, e3)).message
    );
  }
}
function once(fn) {
  let done = false;
  let result;
  return () => {
    if (done)
      return result;
    done = true;
    return result = fn();
  };
}
var encoder2 = new TextEncoder();
async function render_data(event, route, options2, manifest2, state, invalidated_data_nodes, trailing_slash) {
  if (!route.page) {
    return new Response(void 0, {
      status: 404
    });
  }
  try {
    const node_ids = [...route.page.layouts, route.page.leaf];
    const invalidated = invalidated_data_nodes ?? node_ids.map(() => true);
    let aborted = false;
    const url = new URL(event.url);
    url.pathname = normalize_path(url.pathname, trailing_slash);
    const new_event = { ...event, url };
    const functions = node_ids.map((n2, i) => {
      return once(async () => {
        try {
          if (aborted) {
            return (
              /** @type {import('types').ServerDataSkippedNode} */
              {
                type: "skip"
              }
            );
          }
          const node = n2 == void 0 ? n2 : await manifest2._.nodes[n2]();
          return load_server_data({
            event: new_event,
            state,
            node,
            parent: async () => {
              const data2 = {};
              for (let j = 0; j < i; j += 1) {
                const parent = (
                  /** @type {import('types').ServerDataNode | null} */
                  await functions[j]()
                );
                if (parent) {
                  Object.assign(data2, parent.data);
                }
              }
              return data2;
            },
            track_server_fetches: options2.track_server_fetches
          });
        } catch (e3) {
          aborted = true;
          throw e3;
        }
      });
    });
    const promises = functions.map(async (fn, i) => {
      if (!invalidated[i]) {
        return (
          /** @type {import('types').ServerDataSkippedNode} */
          {
            type: "skip"
          }
        );
      }
      return fn();
    });
    let length = promises.length;
    const nodes = await Promise.all(
      promises.map(
        (p2, i) => p2.catch(async (error2) => {
          if (error2 instanceof Redirect) {
            throw error2;
          }
          length = Math.min(length, i + 1);
          return (
            /** @type {import('types').ServerErrorNode} */
            {
              type: "error",
              error: await handle_error_and_jsonify(event, options2, error2),
              status: error2 instanceof HttpError ? error2.status : void 0
            }
          );
        })
      )
    );
    const { data, chunks } = get_data_json(event, options2, nodes);
    if (!chunks) {
      return json_response(data);
    }
    return new Response(
      new ReadableStream({
        async start(controller) {
          controller.enqueue(encoder2.encode(data));
          for await (const chunk of chunks) {
            controller.enqueue(encoder2.encode(chunk));
          }
          controller.close();
        },
        type: "bytes"
      }),
      {
        headers: {
          // we use a proprietary content type to prevent buffering.
          // the `text` prefix makes it inspectable
          "content-type": "text/sveltekit-data",
          "cache-control": "private, no-store"
        }
      }
    );
  } catch (e3) {
    const error2 = normalize_error(e3);
    if (error2 instanceof Redirect) {
      return redirect_json_response(error2);
    } else {
      return json_response(await handle_error_and_jsonify(event, options2, error2), 500);
    }
  }
}
function json_response(json2, status = 200) {
  return text(typeof json2 === "string" ? json2 : JSON.stringify(json2), {
    status,
    headers: {
      "content-type": "application/json",
      "cache-control": "private, no-store"
    }
  });
}
function redirect_json_response(redirect2) {
  return json_response({
    type: "redirect",
    location: redirect2.location
  });
}
function get_data_json(event, options2, nodes) {
  let promise_id = 1;
  let count = 0;
  const { iterator, push, done } = create_async_iterator();
  const reducers = {
    /** @param {any} thing */
    Promise: (thing) => {
      if (typeof thing?.then === "function") {
        const id = promise_id++;
        count += 1;
        let key2 = "data";
        thing.catch(
          /** @param {any} e */
          async (e3) => {
            key2 = "error";
            return handle_error_and_jsonify(
              event,
              options2,
              /** @type {any} */
              e3
            );
          }
        ).then(
          /** @param {any} value */
          async (value) => {
            let str;
            try {
              str = stringify(value, reducers);
            } catch (e3) {
              const error2 = await handle_error_and_jsonify(
                event,
                options2,
                new Error(`Failed to serialize promise while rendering ${event.route.id}`)
              );
              key2 = "error";
              str = stringify(error2, reducers);
            }
            count -= 1;
            push(`{"type":"chunk","id":${id},"${key2}":${str}}
`);
            if (count === 0)
              done();
          }
        );
        return id;
      }
    }
  };
  try {
    const strings = nodes.map((node) => {
      if (!node)
        return "null";
      if (node.type === "error" || node.type === "skip") {
        return JSON.stringify(node);
      }
      return `{"type":"data","data":${stringify(node.data, reducers)},${stringify_uses(
        node
      )}${node.slash ? `,"slash":${JSON.stringify(node.slash)}` : ""}}`;
    });
    return {
      data: `{"type":"data","nodes":[${strings.join(",")}]}
`,
      chunks: count > 0 ? iterator : null
    };
  } catch (e3) {
    throw new Error(clarify_devalue_error(
      event,
      /** @type {any} */
      e3
    ));
  }
}
var MAX_DEPTH = 10;
async function render_page(event, page2, options2, manifest2, state, resolve_opts) {
  if (state.depth > MAX_DEPTH) {
    return text(`Not found: ${event.url.pathname}`, {
      status: 404
      // TODO in some cases this should be 500. not sure how to differentiate
    });
  }
  if (is_action_json_request(event)) {
    const node = await manifest2._.nodes[page2.leaf]();
    return handle_action_json_request(event, options2, node?.server);
  }
  try {
    const nodes = await Promise.all([
      // we use == here rather than === because [undefined] serializes as "[null]"
      ...page2.layouts.map((n2) => n2 == void 0 ? n2 : manifest2._.nodes[n2]()),
      manifest2._.nodes[page2.leaf]()
    ]);
    const leaf_node = (
      /** @type {import('types').SSRNode} */
      nodes.at(-1)
    );
    let status = 200;
    let action_result = void 0;
    if (is_action_request(event)) {
      action_result = await handle_action_request(event, leaf_node.server);
      if (action_result?.type === "redirect") {
        return redirect_response(action_result.status, action_result.location);
      }
      if (action_result?.type === "error") {
        const error2 = action_result.error;
        status = error2 instanceof HttpError ? error2.status : 500;
      }
      if (action_result?.type === "failure") {
        status = action_result.status;
      }
    }
    const should_prerender_data = nodes.some((node) => node?.server);
    const data_pathname = add_data_suffix(event.url.pathname);
    const should_prerender = get_option(nodes, "prerender") ?? false;
    if (should_prerender) {
      const mod = leaf_node.server;
      if (mod?.actions) {
        throw new Error("Cannot prerender pages with actions");
      }
    } else if (state.prerendering) {
      return new Response(void 0, {
        status: 204
      });
    }
    state.prerender_default = should_prerender;
    const fetched = [];
    if (get_option(nodes, "ssr") === false && !state.prerendering) {
      return await render_response({
        branch: [],
        fetched,
        page_config: {
          ssr: false,
          csr: get_option(nodes, "csr") ?? true
        },
        status,
        error: null,
        event,
        options: options2,
        manifest: manifest2,
        state,
        resolve_opts
      });
    }
    const branch = [];
    let load_error = null;
    const server_promises = nodes.map((node, i) => {
      if (load_error) {
        throw load_error;
      }
      return Promise.resolve().then(async () => {
        try {
          if (node === leaf_node && action_result?.type === "error") {
            throw action_result.error;
          }
          return await load_server_data({
            event,
            state,
            node,
            parent: async () => {
              const data = {};
              for (let j = 0; j < i; j += 1) {
                const parent = await server_promises[j];
                if (parent)
                  Object.assign(data, await parent.data);
              }
              return data;
            },
            track_server_fetches: options2.track_server_fetches
          });
        } catch (e3) {
          load_error = /** @type {Error} */
          e3;
          throw load_error;
        }
      });
    });
    const csr = get_option(nodes, "csr") ?? true;
    const load_promises = nodes.map((node, i) => {
      if (load_error)
        throw load_error;
      return Promise.resolve().then(async () => {
        try {
          return await load_data({
            event,
            fetched,
            node,
            parent: async () => {
              const data = {};
              for (let j = 0; j < i; j += 1) {
                Object.assign(data, await load_promises[j]);
              }
              return data;
            },
            resolve_opts,
            server_data_promise: server_promises[i],
            state,
            csr
          });
        } catch (e3) {
          load_error = /** @type {Error} */
          e3;
          throw load_error;
        }
      });
    });
    for (const p2 of server_promises)
      p2.catch(() => {
      });
    for (const p2 of load_promises)
      p2.catch(() => {
      });
    for (let i = 0; i < nodes.length; i += 1) {
      const node = nodes[i];
      if (node) {
        try {
          const server_data = await server_promises[i];
          const data = await load_promises[i];
          branch.push({ node, server_data, data });
        } catch (e3) {
          const err = normalize_error(e3);
          if (err instanceof Redirect) {
            if (state.prerendering && should_prerender_data) {
              const body = JSON.stringify({
                type: "redirect",
                location: err.location
              });
              state.prerendering.dependencies.set(data_pathname, {
                response: text(body),
                body
              });
            }
            return redirect_response(err.status, err.location);
          }
          const status2 = err instanceof HttpError ? err.status : 500;
          const error2 = await handle_error_and_jsonify(event, options2, err);
          while (i--) {
            if (page2.errors[i]) {
              const index17 = (
                /** @type {number} */
                page2.errors[i]
              );
              const node2 = await manifest2._.nodes[index17]();
              let j = i;
              while (!branch[j])
                j -= 1;
              return await render_response({
                event,
                options: options2,
                manifest: manifest2,
                state,
                resolve_opts,
                page_config: { ssr: true, csr: true },
                status: status2,
                error: error2,
                branch: compact(branch.slice(0, j + 1)).concat({
                  node: node2,
                  data: null,
                  server_data: null
                }),
                fetched
              });
            }
          }
          return static_error_page(options2, status2, error2.message);
        }
      } else {
        branch.push(null);
      }
    }
    if (state.prerendering && should_prerender_data) {
      let { data, chunks } = get_data_json(
        event,
        options2,
        branch.map((node) => node?.server_data)
      );
      if (chunks) {
        for await (const chunk of chunks) {
          data += chunk;
        }
      }
      state.prerendering.dependencies.set(data_pathname, {
        response: text(data),
        body: data
      });
    }
    return await render_response({
      event,
      options: options2,
      manifest: manifest2,
      state,
      resolve_opts,
      page_config: {
        csr: get_option(nodes, "csr") ?? true,
        ssr: get_option(nodes, "ssr") ?? true
      },
      status,
      error: null,
      branch: compact(branch),
      action_result,
      fetched
    });
  } catch (e3) {
    return await respond_with_error({
      event,
      options: options2,
      manifest: manifest2,
      state,
      status: 500,
      error: e3,
      resolve_opts
    });
  }
}
function deprecate_missing_path(opts, method) {
  if (opts.path === void 0) {
    warn_with_callsite(
      `Calling \`cookies.${method}(...)\` without specifying a \`path\` is deprecated, and will be disallowed in SvelteKit 2.0. Relative paths can be used`,
      1
    );
  }
  if (opts.path === "") {
    warn_with_callsite(
      `Calling \`cookies.${method}(...)\` with \`path: ''\` will behave differently in SvelteKit 2.0. Instead of using the browser default behaviour, it will set the cookie path to the current pathname`,
      1
    );
  }
}
function get_cookies(request, url, trailing_slash) {
  const header = request.headers.get("cookie") ?? "";
  const initial_cookies = (0, import_cookie.parse)(header, { decode: (value) => value });
  const normalized_url = normalize_path(url.pathname, trailing_slash);
  const default_path = normalized_url.split("/").slice(0, -1).join("/") || "/";
  const new_cookies = {};
  const defaults = {
    httpOnly: true,
    sameSite: "lax",
    secure: url.hostname === "localhost" && url.protocol === "http:" ? false : true
  };
  const cookies = {
    // The JSDoc param annotations appearing below for get, set and delete
    // are necessary to expose the `cookie` library types to
    // typescript users. `@type {import('@sveltejs/kit').Cookies}` above is not
    // sufficient to do so.
    /**
     * @param {string} name
     * @param {import('cookie').CookieParseOptions} opts
     */
    get(name, opts) {
      const c2 = new_cookies[name];
      if (c2 && domain_matches(url.hostname, c2.options.domain) && path_matches(url.pathname, c2.options.path)) {
        return c2.value;
      }
      const decoder = opts?.decode || decodeURIComponent;
      const req_cookies = (0, import_cookie.parse)(header, { decode: decoder });
      const cookie = req_cookies[name];
      return cookie;
    },
    /**
     * @param {import('cookie').CookieParseOptions} opts
     */
    getAll(opts) {
      const decoder = opts?.decode || decodeURIComponent;
      const cookies2 = (0, import_cookie.parse)(header, { decode: decoder });
      for (const c2 of Object.values(new_cookies)) {
        if (domain_matches(url.hostname, c2.options.domain) && path_matches(url.pathname, c2.options.path)) {
          cookies2[c2.name] = c2.value;
        }
      }
      return Object.entries(cookies2).map(([name, value]) => ({ name, value }));
    },
    /**
     * @param {string} name
     * @param {string} value
     * @param {import('cookie').CookieSerializeOptions} opts
     */
    set(name, value, opts = {}) {
      deprecate_missing_path(opts, "set");
      set_internal(name, value, { ...defaults, ...opts });
    },
    /**
     * @param {string} name
     * @param {import('cookie').CookieSerializeOptions} opts
     */
    delete(name, opts = {}) {
      deprecate_missing_path(opts, "delete");
      cookies.set(name, "", {
        path: default_path,
        // TODO 2.0 remove this
        ...opts,
        maxAge: 0
      });
    },
    /**
     * @param {string} name
     * @param {string} value
     * @param {import('cookie').CookieSerializeOptions} opts
     */
    serialize(name, value, opts = {}) {
      deprecate_missing_path(opts, "serialize");
      return (0, import_cookie.serialize)(name, value, {
        ...defaults,
        ...opts
      });
    }
  };
  function get_cookie_header(destination, header2) {
    const combined_cookies = {
      // cookies sent by the user agent have lowest precedence
      ...initial_cookies
    };
    for (const key2 in new_cookies) {
      const cookie = new_cookies[key2];
      if (!domain_matches(destination.hostname, cookie.options.domain))
        continue;
      if (!path_matches(destination.pathname, cookie.options.path))
        continue;
      const encoder22 = cookie.options.encode || encodeURIComponent;
      combined_cookies[cookie.name] = encoder22(cookie.value);
    }
    if (header2) {
      const parsed = (0, import_cookie.parse)(header2, { decode: (value) => value });
      for (const name in parsed) {
        combined_cookies[name] = parsed[name];
      }
    }
    return Object.entries(combined_cookies).map(([name, value]) => `${name}=${value}`).join("; ");
  }
  function set_internal(name, value, opts) {
    let path = opts.path;
    if (!opts.domain || opts.domain === url.hostname) {
      if (path) {
        if (path[0] === ".")
          path = resolve(url.pathname, path);
      } else {
        path = default_path;
      }
    }
    new_cookies[name] = {
      name,
      value,
      options: {
        ...opts,
        path
      }
    };
  }
  return { cookies, new_cookies, get_cookie_header, set_internal };
}
function domain_matches(hostname, constraint) {
  if (!constraint)
    return true;
  const normalized = constraint[0] === "." ? constraint.slice(1) : constraint;
  if (hostname === normalized)
    return true;
  return hostname.endsWith("." + normalized);
}
function path_matches(path, constraint) {
  if (!constraint)
    return true;
  const normalized = constraint.endsWith("/") ? constraint.slice(0, -1) : constraint;
  if (path === normalized)
    return true;
  return path.startsWith(normalized + "/");
}
function add_cookies_to_headers(headers, cookies) {
  for (const new_cookie of cookies) {
    const { name, value, options: options2 } = new_cookie;
    headers.append("set-cookie", (0, import_cookie.serialize)(name, value, options2));
  }
}
function create_fetch({ event, options: options2, manifest: manifest2, state, get_cookie_header, set_internal }) {
  const server_fetch = async (info, init2) => {
    const original_request = normalize_fetch_input(info, init2, event.url);
    let mode = (info instanceof Request ? info.mode : init2?.mode) ?? "cors";
    let credentials = (info instanceof Request ? info.credentials : init2?.credentials) ?? "same-origin";
    return options2.hooks.handleFetch({
      event,
      request: original_request,
      fetch: async (info2, init3) => {
        const request = normalize_fetch_input(info2, init3, event.url);
        const url = new URL(request.url);
        if (!request.headers.has("origin")) {
          request.headers.set("origin", event.url.origin);
        }
        if (info2 !== original_request) {
          mode = (info2 instanceof Request ? info2.mode : init3?.mode) ?? "cors";
          credentials = (info2 instanceof Request ? info2.credentials : init3?.credentials) ?? "same-origin";
        }
        if ((request.method === "GET" || request.method === "HEAD") && (mode === "no-cors" && url.origin !== event.url.origin || url.origin === event.url.origin)) {
          request.headers.delete("origin");
        }
        if (url.origin !== event.url.origin) {
          if (`.${url.hostname}`.endsWith(`.${event.url.hostname}`) && credentials !== "omit") {
            const cookie = get_cookie_header(url, request.headers.get("cookie"));
            if (cookie)
              request.headers.set("cookie", cookie);
          }
          return fetch(request);
        }
        const prefix = assets || base;
        const decoded = decodeURIComponent(url.pathname);
        const filename = (decoded.startsWith(prefix) ? decoded.slice(prefix.length) : decoded).slice(1);
        const filename_html = `${filename}/index.html`;
        const is_asset = manifest2.assets.has(filename);
        const is_asset_html = manifest2.assets.has(filename_html);
        if (is_asset || is_asset_html) {
          const file = is_asset ? filename : filename_html;
          if (state.read) {
            const type = is_asset ? manifest2.mimeTypes[filename.slice(filename.lastIndexOf("."))] : "text/html";
            return new Response(state.read(file), {
              headers: type ? { "content-type": type } : {}
            });
          }
          return await fetch(request);
        }
        if (credentials !== "omit") {
          const cookie = get_cookie_header(url, request.headers.get("cookie"));
          if (cookie) {
            request.headers.set("cookie", cookie);
          }
          const authorization = event.request.headers.get("authorization");
          if (authorization && !request.headers.has("authorization")) {
            request.headers.set("authorization", authorization);
          }
        }
        if (!request.headers.has("accept")) {
          request.headers.set("accept", "*/*");
        }
        if (!request.headers.has("accept-language")) {
          request.headers.set(
            "accept-language",
            /** @type {string} */
            event.request.headers.get("accept-language")
          );
        }
        const response = await respond(request, options2, manifest2, {
          ...state,
          depth: state.depth + 1
        });
        const set_cookie = response.headers.get("set-cookie");
        if (set_cookie) {
          for (const str of set_cookie_parser.splitCookiesString(set_cookie)) {
            const { name, value, ...options3 } = set_cookie_parser.parseString(str);
            set_internal(
              name,
              value,
              /** @type {import('cookie').CookieSerializeOptions} */
              options3
            );
          }
        }
        return response;
      }
    });
  };
  return (input, init2) => {
    const response = server_fetch(input, init2);
    response.catch(() => {
    });
    return response;
  };
}
function normalize_fetch_input(info, init2, url) {
  if (info instanceof Request) {
    return info;
  }
  return new Request(typeof info === "string" ? new URL(info, url) : info, init2);
}
function validator(expected) {
  function validate(module, file) {
    if (!module)
      return;
    for (const key2 in module) {
      if (key2[0] === "_" || expected.has(key2))
        continue;
      const values = [...expected.values()];
      const hint = hint_for_supported_files(key2, file?.slice(file.lastIndexOf("."))) ?? `valid exports are ${values.join(", ")}, or anything with a '_' prefix`;
      throw new Error(`Invalid export '${key2}'${file ? ` in ${file}` : ""} (${hint})`);
    }
  }
  return validate;
}
function hint_for_supported_files(key2, ext = ".js") {
  const supported_files = [];
  if (valid_layout_exports.has(key2)) {
    supported_files.push(`+layout${ext}`);
  }
  if (valid_page_exports.has(key2)) {
    supported_files.push(`+page${ext}`);
  }
  if (valid_layout_server_exports.has(key2)) {
    supported_files.push(`+layout.server${ext}`);
  }
  if (valid_page_server_exports.has(key2)) {
    supported_files.push(`+page.server${ext}`);
  }
  if (valid_server_exports.has(key2)) {
    supported_files.push(`+server${ext}`);
  }
  if (supported_files.length > 0) {
    return `'${key2}' is a valid export in ${supported_files.slice(0, -1).join(", ")}${supported_files.length > 1 ? " or " : ""}${supported_files.at(-1)}`;
  }
}
var valid_layout_exports = /* @__PURE__ */ new Set([
  "load",
  "prerender",
  "csr",
  "ssr",
  "trailingSlash",
  "config"
]);
var valid_page_exports = /* @__PURE__ */ new Set([...valid_layout_exports, "entries"]);
var valid_layout_server_exports = /* @__PURE__ */ new Set([...valid_layout_exports]);
var valid_page_server_exports = /* @__PURE__ */ new Set([...valid_layout_server_exports, "actions", "entries"]);
var valid_server_exports = /* @__PURE__ */ new Set([
  "GET",
  "POST",
  "PATCH",
  "PUT",
  "DELETE",
  "OPTIONS",
  "HEAD",
  "fallback",
  "prerender",
  "trailingSlash",
  "config",
  "entries"
]);
var validate_layout_exports = validator(valid_layout_exports);
var validate_page_exports = validator(valid_page_exports);
var validate_layout_server_exports = validator(valid_layout_server_exports);
var validate_page_server_exports = validator(valid_page_server_exports);
var validate_server_exports = validator(valid_server_exports);
var default_transform = ({ html }) => html;
var default_filter = () => false;
var default_preload = ({ type }) => type === "js" || type === "css";
var page_methods = /* @__PURE__ */ new Set(["GET", "HEAD", "POST"]);
var allowed_page_methods = /* @__PURE__ */ new Set(["GET", "HEAD", "OPTIONS"]);
async function respond(request, options2, manifest2, state) {
  const url = new URL(request.url);
  if (options2.csrf_check_origin) {
    const forbidden = is_form_content_type(request) && (request.method === "POST" || request.method === "PUT" || request.method === "PATCH" || request.method === "DELETE") && request.headers.get("origin") !== url.origin;
    if (forbidden) {
      const csrf_error = error(403, `Cross-site ${request.method} form submissions are forbidden`);
      if (request.headers.get("accept") === "application/json") {
        return json(csrf_error.body, { status: csrf_error.status });
      }
      return text(csrf_error.body.message, { status: csrf_error.status });
    }
  }
  let decoded;
  try {
    decoded = decode_pathname(url.pathname);
  } catch {
    return text("Malformed URI", { status: 400 });
  }
  let route = null;
  let params = {};
  if (base && !state.prerendering?.fallback) {
    if (!decoded.startsWith(base)) {
      return text("Not found", { status: 404 });
    }
    decoded = decoded.slice(base.length) || "/";
  }
  const is_data_request = has_data_suffix(decoded);
  let invalidated_data_nodes;
  if (is_data_request) {
    decoded = strip_data_suffix(decoded) || "/";
    url.pathname = strip_data_suffix(url.pathname) + (url.searchParams.get(TRAILING_SLASH_PARAM) === "1" ? "/" : "") || "/";
    url.searchParams.delete(TRAILING_SLASH_PARAM);
    invalidated_data_nodes = url.searchParams.get(INVALIDATED_PARAM)?.split("").map((node) => node === "1");
    url.searchParams.delete(INVALIDATED_PARAM);
  }
  if (!state.prerendering?.fallback) {
    const matchers = await manifest2._.matchers();
    for (const candidate of manifest2._.routes) {
      const match = candidate.pattern.exec(decoded);
      if (!match)
        continue;
      const matched = exec(match, candidate.params, matchers);
      if (matched) {
        route = candidate;
        params = decode_params(matched);
        break;
      }
    }
  }
  let trailing_slash = void 0;
  const headers = {};
  let cookies_to_add = {};
  const event = {
    // @ts-expect-error `cookies` and `fetch` need to be created after the `event` itself
    cookies: null,
    // @ts-expect-error
    fetch: null,
    getClientAddress: state.getClientAddress || (() => {
      throw new Error(
        `${"@sveltejs/adapter-cloudflare"} does not specify getClientAddress. Please raise an issue`
      );
    }),
    locals: {},
    params,
    platform: state.platform,
    request,
    route: { id: route?.id ?? null },
    setHeaders: (new_headers) => {
      for (const key2 in new_headers) {
        const lower = key2.toLowerCase();
        const value = new_headers[key2];
        if (lower === "set-cookie") {
          throw new Error(
            "Use `event.cookies.set(name, value, options)` instead of `event.setHeaders` to set cookies"
          );
        } else if (lower in headers) {
          throw new Error(`"${key2}" header is already set`);
        } else {
          headers[lower] = value;
          if (state.prerendering && lower === "cache-control") {
            state.prerendering.cache = /** @type {string} */
            value;
          }
        }
      }
    },
    url,
    isDataRequest: is_data_request,
    isSubRequest: state.depth > 0
  };
  let resolve_opts = {
    transformPageChunk: default_transform,
    filterSerializedResponseHeaders: default_filter,
    preload: default_preload
  };
  try {
    if (route) {
      if (url.pathname === base || url.pathname === base + "/") {
        trailing_slash = "always";
      } else if (route.page) {
        const nodes = await Promise.all([
          // we use == here rather than === because [undefined] serializes as "[null]"
          ...route.page.layouts.map((n2) => n2 == void 0 ? n2 : manifest2._.nodes[n2]()),
          manifest2._.nodes[route.page.leaf]()
        ]);
        if (DEV)
          ;
        trailing_slash = get_option(nodes, "trailingSlash");
      } else if (route.endpoint) {
        const node = await route.endpoint();
        trailing_slash = node.trailingSlash;
        if (DEV)
          ;
      }
      if (!is_data_request) {
        const normalized = normalize_path(url.pathname, trailing_slash ?? "never");
        if (normalized !== url.pathname && !state.prerendering?.fallback) {
          return new Response(void 0, {
            status: 308,
            headers: {
              "x-sveltekit-normalize": "1",
              location: (
                // ensure paths starting with '//' are not treated as protocol-relative
                (normalized.startsWith("//") ? url.origin + normalized : normalized) + (url.search === "?" ? "" : url.search)
              )
            }
          });
        }
      }
    }
    const { cookies, new_cookies, get_cookie_header, set_internal } = get_cookies(
      request,
      url,
      trailing_slash ?? "never"
    );
    cookies_to_add = new_cookies;
    event.cookies = cookies;
    event.fetch = create_fetch({
      event,
      options: options2,
      manifest: manifest2,
      state,
      get_cookie_header,
      set_internal
    });
    if (state.prerendering && !state.prerendering.fallback)
      disable_search(url);
    const response = await options2.hooks.handle({
      event,
      resolve: (event2, opts) => resolve2(event2, opts).then((response2) => {
        for (const key2 in headers) {
          const value = headers[key2];
          response2.headers.set(
            key2,
            /** @type {string} */
            value
          );
        }
        add_cookies_to_headers(response2.headers, Object.values(cookies_to_add));
        if (state.prerendering && event2.route.id !== null) {
          response2.headers.set("x-sveltekit-routeid", encodeURI(event2.route.id));
        }
        return response2;
      })
    });
    if (response.status === 200 && response.headers.has("etag")) {
      let if_none_match_value = request.headers.get("if-none-match");
      if (if_none_match_value?.startsWith('W/"')) {
        if_none_match_value = if_none_match_value.substring(2);
      }
      const etag = (
        /** @type {string} */
        response.headers.get("etag")
      );
      if (if_none_match_value === etag) {
        const headers2 = new Headers({ etag });
        for (const key2 of [
          "cache-control",
          "content-location",
          "date",
          "expires",
          "vary",
          "set-cookie"
        ]) {
          const value = response.headers.get(key2);
          if (value)
            headers2.set(key2, value);
        }
        return new Response(void 0, {
          status: 304,
          headers: headers2
        });
      }
    }
    if (is_data_request && response.status >= 300 && response.status <= 308) {
      const location = response.headers.get("location");
      if (location) {
        return redirect_json_response(new Redirect(
          /** @type {any} */
          response.status,
          location
        ));
      }
    }
    return response;
  } catch (e3) {
    if (e3 instanceof Redirect) {
      const response = is_data_request ? redirect_json_response(e3) : route?.page && is_action_json_request(event) ? action_json_redirect(e3) : redirect_response(e3.status, e3.location);
      add_cookies_to_headers(response.headers, Object.values(cookies_to_add));
      return response;
    }
    return await handle_fatal_error(event, options2, e3);
  }
  async function resolve2(event2, opts) {
    try {
      if (opts) {
        if ("ssr" in opts) {
          throw new Error(
            "ssr has been removed, set it in the appropriate +layout.js instead. See the PR for more information: https://github.com/sveltejs/kit/pull/6197"
          );
        }
        resolve_opts = {
          transformPageChunk: opts.transformPageChunk || default_transform,
          filterSerializedResponseHeaders: opts.filterSerializedResponseHeaders || default_filter,
          preload: opts.preload || default_preload
        };
      }
      if (state.prerendering?.fallback) {
        return await render_response({
          event: event2,
          options: options2,
          manifest: manifest2,
          state,
          page_config: { ssr: false, csr: true },
          status: 200,
          error: null,
          branch: [],
          fetched: [],
          resolve_opts
        });
      }
      if (route) {
        const method = (
          /** @type {import('types').HttpMethod} */
          event2.request.method
        );
        let response;
        if (is_data_request) {
          response = await render_data(
            event2,
            route,
            options2,
            manifest2,
            state,
            invalidated_data_nodes,
            trailing_slash ?? "never"
          );
        } else if (route.endpoint && (!route.page || is_endpoint_request(event2))) {
          response = await render_endpoint(event2, await route.endpoint(), state);
        } else if (route.page) {
          if (page_methods.has(method)) {
            response = await render_page(event2, route.page, options2, manifest2, state, resolve_opts);
          } else {
            const allowed_methods2 = new Set(allowed_page_methods);
            const node = await manifest2._.nodes[route.page.leaf]();
            if (node?.server?.actions) {
              allowed_methods2.add("POST");
            }
            if (method === "OPTIONS") {
              response = new Response(null, {
                status: 204,
                headers: {
                  allow: Array.from(allowed_methods2.values()).join(", ")
                }
              });
            } else {
              const mod = [...allowed_methods2].reduce(
                (acc, curr) => {
                  acc[curr] = true;
                  return acc;
                },
                /** @type {Record<string, any>} */
                {}
              );
              response = method_not_allowed(mod, method);
            }
          }
        } else {
          throw new Error("This should never happen");
        }
        if (request.method === "GET" && route.page && route.endpoint) {
          const vary = response.headers.get("vary")?.split(",")?.map((v) => v.trim().toLowerCase());
          if (!(vary?.includes("accept") || vary?.includes("*"))) {
            response = new Response(response.body, {
              status: response.status,
              statusText: response.statusText,
              headers: new Headers(response.headers)
            });
            response.headers.append("Vary", "Accept");
          }
        }
        return response;
      }
      if (state.error && event2.isSubRequest) {
        return await fetch(request, {
          headers: {
            "x-sveltekit-error": "true"
          }
        });
      }
      if (state.error) {
        return text("Internal Server Error", {
          status: 500
        });
      }
      if (state.depth === 0) {
        return await respond_with_error({
          event: event2,
          options: options2,
          manifest: manifest2,
          state,
          status: 404,
          error: new NotFound(event2.url.pathname),
          resolve_opts
        });
      }
      if (state.prerendering) {
        return text("not found", { status: 404 });
      }
      return await fetch(request);
    } catch (e3) {
      return await handle_fatal_error(event2, options2, e3);
    } finally {
      event2.cookies.set = () => {
        throw new Error("Cannot use `cookies.set(...)` after the response has been generated");
      };
      event2.setHeaders = () => {
        throw new Error("Cannot use `setHeaders(...)` after the response has been generated");
      };
    }
  }
}
function filter_private_env(env, { public_prefix, private_prefix }) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([k2]) => k2.startsWith(private_prefix) && (public_prefix === "" || !k2.startsWith(public_prefix))
    )
  );
}
function filter_public_env(env, { public_prefix, private_prefix }) {
  return Object.fromEntries(
    Object.entries(env).filter(
      ([k2]) => k2.startsWith(public_prefix) && (private_prefix === "" || !k2.startsWith(private_prefix))
    )
  );
}
var Server = class {
  /** @type {import('types').SSROptions} */
  #options;
  /** @type {import('@sveltejs/kit').SSRManifest} */
  #manifest;
  /** @param {import('@sveltejs/kit').SSRManifest} manifest */
  constructor(manifest2) {
    this.#options = options;
    this.#manifest = manifest2;
  }
  /**
   * @param {{
   *   env: Record<string, string>
   * }} opts
   */
  async init({ env }) {
    set_private_env(
      filter_private_env(env, {
        public_prefix: this.#options.env_public_prefix,
        private_prefix: this.#options.env_private_prefix
      })
    );
    set_public_env(
      filter_public_env(env, {
        public_prefix: this.#options.env_public_prefix,
        private_prefix: this.#options.env_private_prefix
      })
    );
    if (!this.#options.hooks) {
      try {
        const module = await get_hooks();
        this.#options.hooks = {
          handle: module.handle || (({ event, resolve: resolve2 }) => resolve2(event)),
          handleError: module.handleError || (({ error: error2 }) => console.error(error2)),
          handleFetch: module.handleFetch || (({ request, fetch: fetch2 }) => fetch2(request))
        };
      } catch (error2) {
        {
          throw error2;
        }
      }
    }
  }
  /**
   * @param {Request} request
   * @param {import('types').RequestOptions} options
   */
  async respond(request, options2) {
    if (!(request instanceof Request)) {
      throw new Error(
        "The first argument to server.respond must be a Request object. See https://github.com/sveltejs/kit/pull/3384 for details"
      );
    }
    return respond(request, this.#options, this.#manifest, {
      ...options2,
      error: false,
      depth: 0
    });
  }
};

// .svelte-kit/cloudflare-tmp/manifest.js
var manifest = (() => {
  function __memo(fn) {
    let value;
    return () => value ??= value = fn();
  }
  return {
    appDir: "_app",
    appPath: "_app",
    assets: /* @__PURE__ */ new Set(["favicon.png", "favicon.svg"]),
    mimeTypes: { ".png": "image/png", ".svg": "image/svg+xml" },
    _: {
      client: { "start": "_app/immutable/entry/start.5abee6f6.js", "app": "_app/immutable/entry/app.1dc712b5.js", "imports": ["_app/immutable/entry/start.5abee6f6.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/singletons.bdb73ca0.js", "_app/immutable/chunks/index.40078100.js", "_app/immutable/chunks/parse.bee59afc.js", "_app/immutable/entry/app.1dc712b5.js", "_app/immutable/chunks/scheduler.150511e5.js", "_app/immutable/chunks/index.7311d585.js"], "stylesheets": [], "fonts": [] },
      nodes: [
        __memo(() => Promise.resolve().then(() => (init__(), __exports))),
        __memo(() => Promise.resolve().then(() => (init__2(), __exports2))),
        __memo(() => Promise.resolve().then(() => (init__3(), __exports3))),
        __memo(() => Promise.resolve().then(() => (init__4(), __exports4))),
        __memo(() => Promise.resolve().then(() => (init__5(), __exports5))),
        __memo(() => Promise.resolve().then(() => (init__6(), __exports6))),
        __memo(() => Promise.resolve().then(() => (init__7(), __exports7))),
        __memo(() => Promise.resolve().then(() => (init__8(), __exports8))),
        __memo(() => Promise.resolve().then(() => (init__9(), __exports9))),
        __memo(() => Promise.resolve().then(() => (init__10(), __exports10))),
        __memo(() => Promise.resolve().then(() => (init__11(), __exports11))),
        __memo(() => Promise.resolve().then(() => (init__12(), __exports12))),
        __memo(() => Promise.resolve().then(() => (init__13(), __exports13))),
        __memo(() => Promise.resolve().then(() => (init__14(), __exports14))),
        __memo(() => Promise.resolve().then(() => (init__15(), __exports15))),
        __memo(() => Promise.resolve().then(() => (init__16(), __exports16)))
      ],
      routes: [
        {
          id: "/",
          pattern: /^\/$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 2 },
          endpoint: null
        },
        {
          id: "/api/activity",
          pattern: /^\/api\/activity\/?$/,
          params: [],
          page: null,
          endpoint: __memo(() => Promise.resolve().then(() => (init_server_ts(), server_ts_exports)))
        },
        {
          id: "/api/debug/env",
          pattern: /^\/api\/debug\/env\/?$/,
          params: [],
          page: null,
          endpoint: __memo(() => Promise.resolve().then(() => (init_server_ts2(), server_ts_exports2)))
        },
        {
          id: "/assets",
          pattern: /^\/assets\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 3 },
          endpoint: null
        },
        {
          id: "/assets/[id]",
          pattern: /^\/assets\/([^/]+?)\/?$/,
          params: [{ "name": "id", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0], errors: [1], leaf: 4 },
          endpoint: null
        },
        {
          id: "/audit-log",
          pattern: /^\/audit-log\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 5 },
          endpoint: null
        },
        {
          id: "/auth/login",
          pattern: /^\/auth\/login\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 6 },
          endpoint: null
        },
        {
          id: "/auth/logout",
          pattern: /^\/auth\/logout\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 7 },
          endpoint: null
        },
        {
          id: "/auth/register",
          pattern: /^\/auth\/register\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 8 },
          endpoint: null
        },
        {
          id: "/dashboard",
          pattern: /^\/dashboard\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 9 },
          endpoint: null
        },
        {
          id: "/profile",
          pattern: /^\/profile\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 10 },
          endpoint: null
        },
        {
          id: "/sites",
          pattern: /^\/sites\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 11 },
          endpoint: null
        },
        {
          id: "/sites/[id]",
          pattern: /^\/sites\/([^/]+?)\/?$/,
          params: [{ "name": "id", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0], errors: [1], leaf: 12 },
          endpoint: null
        },
        {
          id: "/users",
          pattern: /^\/users\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 13 },
          endpoint: null
        },
        {
          id: "/work-orders",
          pattern: /^\/work-orders\/?$/,
          params: [],
          page: { layouts: [0], errors: [1], leaf: 14 },
          endpoint: null
        },
        {
          id: "/work-orders/[id]",
          pattern: /^\/work-orders\/([^/]+?)\/?$/,
          params: [{ "name": "id", "optional": false, "rest": false, "chained": false }],
          page: { layouts: [0], errors: [1], leaf: 15 },
          endpoint: null
        }
      ],
      matchers: async () => {
        return {};
      }
    }
  };
})();
var prerendered = /* @__PURE__ */ new Set([]);

// .svelte-kit/cloudflare-tmp/_worker.js
async function e(e3, t2) {
  let n2 = "string" != typeof t2 && "HEAD" === t2.method;
  n2 && (t2 = new Request(t2, { method: "GET" }));
  let r3 = await e3.match(t2);
  return n2 && r3 && (r3 = new Response(null, r3)), r3;
}
function t(e3, t2, n2, o2) {
  return ("string" == typeof t2 || "GET" === t2.method) && r(n2) && (n2.headers.has("Set-Cookie") && (n2 = new Response(n2.body, n2)).headers.append("Cache-Control", "private=Set-Cookie"), o2.waitUntil(e3.put(t2, n2.clone()))), n2;
}
var n = /* @__PURE__ */ new Set([200, 203, 204, 300, 301, 404, 405, 410, 414, 501]);
function r(e3) {
  if (!n.has(e3.status))
    return false;
  if (~(e3.headers.get("Vary") || "").indexOf("*"))
    return false;
  let t2 = e3.headers.get("Cache-Control") || "";
  return !/(private|no-cache|no-store)/i.test(t2);
}
function o(n2) {
  return async function(r3, o2) {
    let a = await e(n2, r3);
    if (a)
      return a;
    o2.defer((e3) => {
      t(n2, r3, e3, o2);
    });
  };
}
var s2 = caches.default;
var c = t.bind(0, s2);
var r2 = e.bind(0, s2);
var e2 = o.bind(0, s2);
var server = new Server(manifest);
var worker = {
  async fetch(req, env, context) {
    await server.init({ env });
    let pragma = req.headers.get("cache-control") || "";
    let res = !pragma.includes("no-cache") && await r2(req);
    if (res)
      return res;
    let { pathname, search } = new URL(req.url);
    try {
      pathname = decodeURIComponent(pathname);
    } catch {
    }
    const stripped_pathname = pathname.replace(/\/$/, "");
    let is_static_asset = false;
    const filename = stripped_pathname.substring(1);
    if (filename) {
      is_static_asset = manifest.assets.has(filename) || manifest.assets.has(filename + "/index.html");
    }
    let location = pathname.at(-1) === "/" ? stripped_pathname : pathname + "/";
    if (is_static_asset || prerendered.has(pathname)) {
      res = await env.ASSETS.fetch(req);
    } else if (location && prerendered.has(location)) {
      if (search)
        location += search;
      res = new Response("", {
        status: 308,
        headers: {
          location
        }
      });
    } else {
      res = await server.respond(req, {
        // @ts-ignore
        platform: { env, context, caches, cf: req.cf },
        getClientAddress() {
          return req.headers.get("cf-connecting-ip");
        }
      });
    }
    pragma = res.headers.get("cache-control") || "";
    return pragma && res.status < 400 ? c(req, res, context) : res;
  }
};
var worker_default = worker;
export {
  worker_default as default
};
/*! Bundled license information:

@prisma/client/runtime/index-browser.js:
  (*! Bundled license information:
  
  decimal.js/decimal.mjs:
    (*!
     *  decimal.js v10.4.3
     *  An arbitrary-precision Decimal type for JavaScript.
     *  https://github.com/MikeMcl/decimal.js
     *  Copyright (c) 2022 Michael Mclaughlin <M8ch88l@gmail.com>
     *  MIT Licence
     *)
  *)
*/
//# sourceMappingURL=_worker.js.map
