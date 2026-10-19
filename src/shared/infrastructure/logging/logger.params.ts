import { randomUUID } from 'node:crypto';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Params } from 'nestjs-pino';
import type { DestinationStream } from 'pino';
import type { Options } from 'pino-http';
import type { Env } from '../../../config/env.validation.js';

export const REQUEST_ID_HEADER = 'x-request-id';

// Accept a caller's ID only if it's short and plain: anything else (newlines, huge
// strings) could forge or bloat log lines, so we generate our own instead.
const SAFE_REQUEST_ID = /^[\w-]{1,64}$/;

/**
 * Structured JSON logs (pino) with a request ID on every line.
 * Never log secrets, money values or personal data: requests are logged as
 * id + method + path + status only, never headers, IPs, query strings or bodies.
 *
 * `destination` exists for tests, which read the real log lines from memory.
 */
export function loggerParams(
  env: Pick<Env, 'LOG_LEVEL' | 'NODE_ENV'>,
  destination?: DestinationStream,
): Params {
  const options: Options = {
    level: env.LOG_LEVEL,

    // Reuse the caller's ID (e.g. from the edge proxy) so one request can be followed
    // across systems; echo it back so a user can quote it in a bug report.
    genReqId: (req: IncomingMessage, res: ServerResponse) => {
      const incoming = req.headers[REQUEST_ID_HEADER];
      const id =
        typeof incoming === 'string' && SAFE_REQUEST_ID.test(incoming)
          ? incoming
          : randomUUID();
      res.setHeader(REQUEST_ID_HEADER, id);
      return id;
    },

    // Allowlist, not denylist: log only the fields we chose. pino-http's defaults log every
    // header (auth tokens, cookies, x-forwarded-for = the user's IP, which is personal data)
    // and the client address; a redact list only hides what someone remembered to list.
    // The query string is dropped too: it can carry personal data.
    serializers: {
      req: (req: { id: unknown; method: string; url: string }) => ({
        id: req.id,
        method: req.method,
        url: req.url.split('?')[0],
      }),
      res: (res: { statusCode: number }) => ({ statusCode: res.statusCode }),
    },

    // The platform calls /health every few seconds: logging each call would bury real traffic.
    autoLogging: {
      ignore: (req: IncomingMessage) =>
        req.url?.startsWith('/api/v1/health') ?? false,
    },

    // Human-friendly output only on a developer's machine; JSON everywhere else.
    // (pino-pretty is a dev dependency: it isn't in the production image.)
    transport:
      env.NODE_ENV === 'development' && !destination
        ? { target: 'pino-pretty', options: { singleLine: true } }
        : undefined,
  };

  return { pinoHttp: destination ? [options, destination] : options };
}
