/**
 * ─────────────────────────────────────────────────────────────
 *  EVENT DETAILS for the live stream page.
 * ─────────────────────────────────────────────────────────────
 *  The YouTube link does NOT go here: paste it into stream.json,
 *  so pages that are already open pick it up without a refresh.
 *
 *  Phone numbers: digits only, with country code, e.g. 94771234567
 */
window.LIVE_CONFIG = {
  couple: "Gayathri & Ashen",
  bride: "Gayathri",
  groom: "Ashen",
  occasion: "Engagement",

  // When the ceremony runs, in Sri Lanka time (+05:30)
  start: "2026-10-16T09:00:00+05:30",
  end:   "2026-10-16T15:00:00+05:30",
  timeZone: "Asia/Colombo",
  timeZoneName: "Sri Lanka time",

  venue: "Hotel Chance Palace",
  address: "Mallehewa Road, Kottala, Veyangoda",
  mapsQuery: "Hotel Chance Palace, Mallehewa Road, Kottala, Veyangoda, Sri Lanka",

  // Where wishes from the "Send your blessings" form go (WhatsApp)
  contacts: [
    { side: "bride", name: "Gayathri", phone: "94777659731" },
    { side: "groom", name: "Ashen",    phone: "94784464128" }
  ],

  // Sister sites
  pageUrl:       "https://ourevenet.github.io/Engagement-Live-Stream/",
  invitationUrl: "https://ourevenet.github.io/Gayathri-Ashen/",
  galleryUrl:    "https://ourevenet.github.io/Engagement-Gallery/",

  // The live photo album (read-only here). Same public values as the
  // Engagement-Gallery config.js. Leave supabaseUrl empty to hide the strip.
  supabaseUrl: "https://omdpuisklqmnjskfxvnx.supabase.co",
  supabaseAnonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tZHB1aXNrbHFtbmpza2Z4dm54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTIwMTk4MjAsImV4cCI6MjEwNzU5NTgyMH0.MbMP2xL_-YZOBdFICO24aDPGJHbaazRg9Ho4eeGDarY", // public anon key, safe to expose
  bucket: "photos",

  // How often open pages look for a new stream link / new photos (seconds)
  streamCheckEvery: 30,
  photoCheckEvery: 20
};
