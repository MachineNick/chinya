// ==========================================================
// WinzoIndia - Supabase Configuration
// ==========================================================
window.WINZO_SUPABASE_URL  = "https://radhhtprzskwbokdhcuj.supabase.co";
window.WINZO_SUPABASE_ANON = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJhZGhodHByenNrd2Jva2RoY3VqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMyMDA4MDMsImV4cCI6MjA5ODc3NjgwM30.SrvZGdXzbOTTeCNhwcUlVkyTlZlHDdcHEC1Pu8xm1jw";

(function initSupabase() {
  if (!window.supabase) {
    console.warn("[WinzoIndia] Supabase SDK not loaded.");
    return;
  }
  window.WINZO_SB = window.supabase.createClient(
    window.WINZO_SUPABASE_URL,
    window.WINZO_SUPABASE_ANON
  );
  console.info("[WinzoIndia] Supabase initialised.");
})();
