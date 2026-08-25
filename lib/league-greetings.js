// Greetings shown in the home page ticker, one per community the league
// serves. Many-at-once on purpose: a pan-ethnic league that put a single
// script in its chrome would be ranking its own communities.
//
// Romanised rather than native script, deliberately. Rendering native script
// here depends on the VISITOR having a font for it, and a visitor without one
// sees broken or boxed glyphs -- which is the worst possible outcome for the
// community being greeted. Burmese was the clearest failure in testing
// (မင်္ဂလာပါ shaped into detached marks), but the same risk applies to any
// complex script on an unknown device. Romanised text renders everywhere, in
// the league's own display face, and stays consistent with the Pacific
// greetings, which have no other written form in common use.
//
// To use native script instead, self-host the matching Noto subsets and set
// them as a fallback stack on the ticker -- then this list can carry both.
//
// BEFORE LAUNCH: have native speakers check spelling and diacritics. The
// macrons in MĀLŌ E LELEI and the ring in HÅFA ADAI are the easiest things to
// get subtly wrong, and this league's audience is exactly who would notice.
//
// Keyed by league slug so other leagues are unaffected.
const GREETINGS = {
  aapi: [
    "ALOHA",            // Hawaiian
    "MABUHAY",          // Filipino / Tagalog
    "TALOFA",           // Samoan
    "MĀLŌ E LELEI",     // Tongan
    "BULA",             // Fijian
    "HÅFA ADAI",        // Chamorro
    "KIA ORA",          // Maori
    "NI HAO",           // Mandarin
    "ANNYEONGHASEYO",   // Korean
    "KONNICHIWA",       // Japanese
    "SAWASDEE",         // Thai
    "XIN CHÀO",         // Vietnamese
    "MINGALABA",        // Burmese
    "NAMASTE",          // Hindi / Nepali
    "SELAMAT DATANG",   // Indonesian / Malay
  ],
}

export function greetingsFor(league) {
  return GREETINGS[league?.slug] || []
}
