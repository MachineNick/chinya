// ==========================================================
// WinzoIndia - Supabase Configuration
// Keys are loaded from env.js (gitignored).
// ==========================================================
(function initSupabase() {
  var env = window.WINZO_ENV || {};
  var url  = env.SUPABASE_URL;
  var anon = env.SUPABASE_ANON;

  if (!url || !anon || url.startsWith("YOUR_")) {
    console.warn("[WinzoIndia] Supabase env not configured. Copy env.example.js → env.js and fill in keys.");
    return;
  }
  if (!window.supabase) {
    console.warn("[WinzoIndia] Supabase SDK not loaded.");
    return;
  }
  window.WINZO_SB = window.supabase.createClient(url, anon);
  console.info("[WinzoIndia] Supabase initialised.");
})();
