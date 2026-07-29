// ReadySetPrep browser configuration.
//
// Supabase is used ONLY for parent/guardian authentication.
// Cloudflare D1 stores ReadySetPrep profiles, students, assessments, and practice state.
// The Cloudflare Worker API should be deployed separately from the Pages repository.
//
// Never put a Supabase service-role key or Cloudflare API token in this file.
window.RSP_CONFIG = {
  supabaseUrl: 'YOUR_SUPABASE_URL',
  supabasePublishableKey: 'YOUR_SUPABASE_PUBLISHABLE_KEY',
  supabaseUrl: 'https://nugylalbogculcqcjljx.supabase.co',
  supabasePublishableKey: 'sb_publishable_NLzvtmkypdKmypcB4k658Q_xHS8p8iA',
  apiBaseUrl: 'https://api.readysetprep.ai'
};
