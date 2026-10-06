const { createAdminClient, createContextClient, verifyCredentials } = require("@supabase/server/core");
const ws = require("ws");

// Node < 22 has no native global WebSocket, which @supabase/realtime-js
// requires when constructing a SupabaseClient. Supply the `ws` package as
// the realtime transport so client creation doesn't throw on this runtime.
const REALTIME_SUPABASE_OPTIONS = { realtime: { transport: ws } };

// Admin client bypasses RLS and is stateless (persistSession: false,
// autoRefreshToken: false, detectSessionInUrl: false), so it's safe to
// create once at module load and reuse across requests.
let adminClient = null;
try {
  adminClient = createAdminClient({ supabaseOptions: REALTIME_SUPABASE_OPTIONS });
} catch (err) {
  console.error("[supabase middleware] failed to initialize admin client:", err);
  adminClient = null;
}

function extractToken(req) {
  const header = req.headers.authorization;
  if (!header) return null;
  const match = /^Bearer\s+(.+)$/i.exec(header);
  return match ? match[1] : null;
}

function extractApiKey(req) {
  return req.headers.apikey ?? null;
}

const UNAUTHORIZED_BODY = { error: { message: "Invalid or missing token", code: "unauthorized" } };
const SERVER_AUTH_SETUP_FAILED_BODY = { error: { message: "Server auth setup failed", code: "internal" } };

async function requireUser(req, res, next) {
  const token = extractToken(req);
  const apikey = extractApiKey(req);

  const { data, error } = await verifyCredentials({ token, apikey }, { auth: "user" });

  if (error) {
    // AuthError.status is always exactly 401 (bad/missing credentials) or
    // 500 (server-side auth failure, e.g. resolveEnv() failing because
    // SUPABASE_URL is missing) — don't collapse a genuine server misconfig
    // into a misleading "invalid token" 401.
    const body = error.status >= 500 ? SERVER_AUTH_SETUP_FAILED_BODY : UNAUTHORIZED_BODY;
    return res.status(error.status ?? 401).json(body);
  }
  if (!data || !data.userClaims) {
    return res.status(401).json(UNAUTHORIZED_BODY);
  }

  req.userId = data.userClaims.id;

  try {
    req.supabase = createContextClient({
      auth: { token: data.token, keyName: data.keyName },
      supabaseOptions: REALTIME_SUPABASE_OPTIONS,
    });
  } catch (err) {
    console.error("[supabase middleware] failed to create context client:", err);
    return res.status(500).json(SERVER_AUTH_SETUP_FAILED_BODY);
  }

  req.supabaseAdmin = adminClient;

  return next();
}

// NOTE: performs NO authentication — it only attaches the RLS-bypassing
// admin client. Safe for genuinely public/cached endpoints (e.g. duas,
// system templates). If a route needs auth, combine this with `requireUser`
// (or another auth gate); mounting `withAdmin` alone leaves the route open.
function withAdmin(req, res, next) {
  if (!adminClient) {
    return res.status(500).json(SERVER_AUTH_SETUP_FAILED_BODY);
  }
  req.supabaseAdmin = adminClient;
  return next();
}

module.exports = { requireUser, withAdmin };
