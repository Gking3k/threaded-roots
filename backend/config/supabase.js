const {
  createClient,
} = require(
  "@supabase/supabase-js"
);

const supabaseUrl =
  process.env.SUPABASE_URL;

const supabaseSecretKey =
  process.env.SUPABASE_SECRET_KEY;

if (
  !supabaseUrl ||
  !supabaseSecretKey
) {
  throw new Error(
    "SUPABASE_URL and SUPABASE_SECRET_KEY must be configured."
  );
}

/*
 * This client is server-side only.
 *
 * The secret key has elevated privileges,
 * so it must never be imported by frontend
 * React code or sent to the browser.
 */
const supabase =
  createClient(
    supabaseUrl,
    supabaseSecretKey,
    {
      auth: {
        autoRefreshToken:
          false,

        persistSession:
          false,
      },
    }
  );

module.exports =
  supabase;