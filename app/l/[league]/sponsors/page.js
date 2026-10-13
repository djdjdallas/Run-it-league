import { Footer } from "@/components/footer"
import { SponsorBanner } from "@/components/sponsor-banner"
import { ArrowRight, Check, Handshake, Mail, Phone } from "lucide-react"
import { getSponsors } from "@/lib/queries"
import { resolveLeague, leagueWordmark } from "@/lib/leagues"
import { SEASON_TITLE } from "@/lib/season"

export async function generateMetadata({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  return {
    title: `Sponsors & Partners - ${league?.name || "Run It League"}`,
    description:
      "Sponsorship packages from $250 per season. Put your brand on the banner, the jumbotron, and the jerseys.",
  }
}

// Business contact for sponsorship and investment enquiries.
const CONTACT = {
  name: "Jordan Hill",
  role: "Founder, Run It Sports Ent.",
  email: "runitsportslv@gmail.com",
  phone: "+1 (702) 771-8473",
  phoneHref: "tel:+17027718473",
}

// Each tier includes everything in the tier before it. `includes` names that
// tier so the card can say so instead of repeating the whole list.
const PACKAGES = [
  {
    name: "Community Sponsor",
    price: "$250",
    tagline: "Entry level",
    term: "Per season",
    perks: [
      "Logo on the sponsor banner",
      "Logo on the Run It League website sponsor section",
      "One sponsor thank-you social media post",
      "Logo on a rotating halftime jumbotron slide",
    ],
  },
  {
    name: "Official Sponsor",
    price: "$500",
    tagline: "Supporting partner",
    term: "Per season",
    includes: "Community Sponsor",
    perks: [
      "Larger logo on a shared sponsor banner",
      "Two dedicated social media features",
      "Halftime jumbotron rotation at each scheduled game event",
      "Sponsor tag in one highlight or recap post",
    ],
  },
  {
    name: "Gold Sponsor",
    price: "$1,000",
    tagline: "Premium partner",
    term: "Per season",
    includes: "Official Sponsor",
    perks: [
      "Premium banner placement",
      "Dedicated jersey logo placement, subject to uniform availability",
      "Three dedicated social media features",
      "Featured halftime jumbotron slide",
      "Sponsored player-of-the-game recognition",
    ],
  },
  {
    name: "Platinum Sponsor",
    price: "$2,500",
    tagline: "Major partner",
    term: "Per season",
    includes: "Gold Sponsor",
    featured: true,
    perks: [
      "Most prominent available jersey placement",
      "Premium court-side banner positioning",
      "Weekly sponsor recognition in agreed social content",
      "Priority jumbotron exposure",
      "Featured sponsor integration into championship promotions",
    ],
  },
  {
    name: "Presenting Sponsor",
    price: "$5,000+",
    tagline: "Exclusive top-tier partnership",
    term: "Per season or negotiated annual agreement",
    exclusive: true,
    perks: [
      "“Run It League presented by [Your Brand]” branding, subject to agreement",
      "First-priority jersey and banner placements",
      "Dedicated jumbotron sponsor feature",
      "Prominent social media and video integration",
      "Championship presentation recognition",
      "First option to renew and discuss 2027 tournament sponsorship",
    ],
  },
]

// Prefills the email so every enquiry arrives already naming the package.
function mailtoFor(subject) {
  return `mailto:${CONTACT.email}?subject=${encodeURIComponent(subject)}`
}

export default async function SponsorsPage({ params }) {
  const { league: slug } = await params
  const league = await resolveLeague(slug)
  const sponsors = await getSponsors()
  const leagueName = league?.name || "Run It League"

  const tiers = PACKAGES.filter((p) => !p.exclusive)
  const presenting = PACKAGES.find((p) => p.exclusive)

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1">
        {/* ===== HERO ===== */}
        <section className="relative overflow-hidden bg-[#080808] py-20 md:py-28">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgb(var(--neon-2)/0.08)_0%,_transparent_70%)]" />
          <div className="container relative z-10 text-center">
            <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-6">
              Sponsors &amp; Partners &middot; {SEASON_TITLE}
            </p>
            <h1 className="font-display text-5xl md:text-7xl text-white mb-6">
              Put Your Brand <span className="text-neon neon-glow">On The Court</span>
            </h1>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Banner, jumbotron, jersey, and social placement in front of the {leagueName} community.
              Packages start at $250 per season.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="#packages"
                className="bg-neon text-black px-8 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors inline-flex items-center gap-2"
              >
                View Packages
                <ArrowRight className="h-4 w-4" />
              </a>
              <a
                href={mailtoFor("Run It League sponsorship")}
                className="border border-white/20 text-white px-8 py-3 font-bold uppercase tracking-wider text-sm hover:border-neon hover:text-neon transition-colors"
              >
                Talk To Us
              </a>
            </div>
          </div>
        </section>

        {/* ===== PACKAGES ===== */}
        <section id="packages" className="py-16 md:py-24 bg-[#0A0A0A] scroll-mt-28">
          <div className="container">
            <div className="mb-10 text-center">
              <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-3">
                Sponsorship Packages
              </p>
              <h2 className="font-display text-4xl md:text-5xl text-white">Pick Your Level</h2>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              {tiers.map((pkg) => (
                <div
                  key={pkg.name}
                  className={`relative flex flex-col bg-[#121212] border p-6 ${
                    pkg.featured ? "border-neon" : "border-white/10"
                  }`}
                >
                  {pkg.featured && (
                    <span className="absolute -top-3 left-6 bg-neon text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                      Most Exposure
                    </span>
                  )}
                  <p className="text-white/40 text-xs uppercase tracking-[0.2em] mb-2">{pkg.tagline}</p>
                  <h3 className="font-display text-2xl text-white mb-4">{pkg.name}</h3>
                  <p className="mb-1">
                    <span className="font-display text-4xl text-neon">{pkg.price}</span>
                  </p>
                  <p className="text-white/40 text-sm mb-6">{pkg.term}</p>

                  <ul className="space-y-3 text-sm flex-1 mb-8">
                    {pkg.includes && (
                      <li className="flex gap-2 text-white font-medium">
                        <Check className="h-4 w-4 text-neon shrink-0 mt-0.5" />
                        All {pkg.includes} benefits
                      </li>
                    )}
                    {pkg.perks.map((perk) => (
                      <li key={perk} className="flex gap-2 text-white/60">
                        <Check className="h-4 w-4 text-neon shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>

                  <a
                    href={mailtoFor(`${pkg.name} (${pkg.price}) - ${SEASON_TITLE}`)}
                    className={`text-center px-4 py-3 font-bold uppercase tracking-wider text-sm transition-colors ${
                      pkg.featured
                        ? "bg-neon text-black hover:bg-neon/90"
                        : "border border-white/20 text-white hover:border-neon hover:text-neon"
                    }`}
                  >
                    Get Started
                  </a>
                </div>
              ))}
            </div>

            {/* Presenting sponsor: one per season, so it gets its own band */}
            {presenting && (
              <div className="mt-4 border border-neon bg-[#121212] p-6 md:p-10">
                <div className="grid gap-8 lg:grid-cols-[1fr_2fr] lg:items-center">
                  <div>
                    <span className="inline-block bg-neon text-black px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider mb-4">
                      Exclusive &middot; One Brand
                    </span>
                    <h3 className="font-display text-3xl md:text-4xl text-white mb-3">{presenting.name}</h3>
                    <p className="font-display text-5xl text-neon mb-1">{presenting.price}</p>
                    <p className="text-white/40 text-sm mb-6">{presenting.term}</p>
                    <a
                      href={mailtoFor(`${presenting.name} enquiry - ${SEASON_TITLE}`)}
                      className="bg-neon text-black px-6 py-3 font-bold uppercase tracking-wider text-sm hover:bg-neon/90 transition-colors inline-flex items-center gap-2"
                    >
                      Request A Call
                      <ArrowRight className="h-4 w-4" />
                    </a>
                  </div>
                  <ul className="grid gap-3 sm:grid-cols-2 text-sm">
                    <li className="flex gap-2 text-white font-medium">
                      <Check className="h-4 w-4 text-neon shrink-0 mt-0.5" />
                      All Platinum Sponsor benefits
                    </li>
                    {presenting.perks.map((perk) => (
                      <li key={perk} className="flex gap-2 text-white/60">
                        <Check className="h-4 w-4 text-neon shrink-0 mt-0.5" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <p className="text-white/30 text-xs text-center mt-6">
              Jersey and banner placements are subject to availability and are assigned in tier order.
            </p>
          </div>
        </section>

        {/* ===== INVESTORS ===== */}
        <section className="py-16 md:py-24 bg-[#080808]">
          <div className="container">
            <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
              <div>
                <p className="text-white/40 text-xs font-bold uppercase tracking-[0.3em] mb-3">
                  Investors &amp; Long-Term Partners
                </p>
                <h2 className="font-display text-4xl md:text-5xl text-white mb-6">Grow The League With Us</h2>
                <p className="text-white/60 leading-relaxed mb-4">
                  Run It Sports Ent. is building Las Vegas&apos; most competitive adult basketball league,
                  featuring former pros. Beyond season sponsorship, we&apos;re open to conversations with
                  investors and multi-season partners who want to help us expand.
                </p>
                <p className="text-white/60 leading-relaxed">
                  Reach out directly and we&apos;ll set up a time to talk through where the league is headed.
                </p>
              </div>

              <div className="bg-[#121212] border border-white/10 p-6 md:p-8">
                <Handshake className="h-8 w-8 text-neon mb-4" />
                <p className="font-display text-2xl text-white">{CONTACT.name}</p>
                <p className="text-white/40 text-sm mb-6">{CONTACT.role}</p>
                <div className="space-y-3 text-sm">
                  <a
                    href={mailtoFor("Run It League investment / partnership")}
                    className="flex items-center gap-3 text-white/70 hover:text-neon transition-colors break-all"
                  >
                    <Mail className="h-4 w-4 text-neon shrink-0" />
                    {CONTACT.email}
                  </a>
                  <a
                    href={CONTACT.phoneHref}
                    className="flex items-center gap-3 text-white/70 hover:text-neon transition-colors"
                  >
                    <Phone className="h-4 w-4 text-neon shrink-0" />
                    {CONTACT.phone}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ===== CURRENT SPONSORS ===== */}
        <section className="py-16 md:py-20">
          <div className="container">
            <SponsorBanner sponsors={sponsors} />
          </div>
        </section>
      </main>

      <Footer wordmark={leagueWordmark(league)} />
    </div>
  )
}
