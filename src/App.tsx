import { FormEvent, useEffect, useRef, useState, type CSSProperties } from "react";
import { AnimatePresence, motion, type Variants } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "lenis";
import { cn } from "./utils/cn";

type PageKey = "home" | "events" | "media" | "gallery" | "contact";
type ShapeVariant = "hexagon" | "wave" | "squircle" | "rounded" | "teardrop" | "blob";
type ContactState = "idle" | "sending" | "success" | "error";

const NAV_ITEMS: Array<{ key: PageKey; label: string; href: string }> = [
  { key: "home", label: "Home", href: "#/" },
  { key: "events", label: "Events", href: "#/events" },
  { key: "media", label: "Media", href: "#/media" },
  { key: "gallery", label: "Gallery", href: "#/gallery" },
  { key: "contact", label: "Contact", href: "#/contact" },
];

const images = {
  hero: "/images/sec-hero-stage.jpg",
  video: "/images/hero-video.mp4",
  interview: "/images/sec-interview.jpg",
  networking: "/images/sec-networking.jpg",
  gala: "/images/sec-gala.jpg",
  backstage: "/images/sec-backstage.jpg",
  audience: "/images/sec-audience.jpg",
  venue: "/images/sec-venue.jpg",
  portrait: "/images/sec-editorial-portrait.jpg",
};

const colors = {
  red: "#ff6f61",
  blue: "#22c1c3",
  yellow: "#ffcb7d",
  green: "#8e7ef0",
  cream: "#fff7ee",
  soft: "#f7f3ef",
  ink: "#141414",
};

const pageVariants: Variants = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.65, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -18, transition: { duration: 0.32, ease: [0.65, 0, 0.35, 1] } },
};

const shapeStyles: Record<ShapeVariant, CSSProperties> = {
  hexagon: {
    clipPath: "polygon(24% 5%, 76% 5%, 100% 50%, 76% 95%, 24% 95%, 0% 50%)",
  },
  wave: {
    clipPath: "polygon(0% 20%, 20% 5%, 45% 16%, 70% 2%, 100% 20%, 100% 80%, 80% 95%, 55% 84%, 30% 98%, 0% 80%)",
  },
  squircle: {
    borderRadius: "38% 62% 46% 54% / 55% 45% 55% 45%",
  },
  rounded: {
    clipPath: "polygon(12% 0%, 88% 0%, 100% 20%, 100% 80%, 88% 100%, 12% 100%, 0% 80%, 0% 20%)",
  },
  teardrop: {
    clipPath: "polygon(50% 0%, 85% 32%, 72% 100%, 28% 100%, 15% 32%)",
  },
  blob: {
    borderRadius: "40% 60% 54% 46% / 45% 58% 42% 55%",
  },
};

const eventSeries: Array<{
  title: string;
  eyebrow: string;
  copy: string;
  image: string;
  color: string;
  shape: ShapeVariant;
}> = [
  {
    title: "Premiere Rooms",
    eyebrow: "Launches and unveilings",
    copy: "Atmospheric coverage for product reveals, red carpet arrivals, cultural premieres and brand-led moments.",
    image: images.hero,
    color: colors.red,
    shape: "hexagon",
  },
  {
    title: "Summit Signals",
    eyebrow: "Conferences and keynotes",
    copy: "Editorial event stories shaped around speakers, audience energy, stagecraft and the ideas that travel after the room clears.",
    image: images.audience,
    color: colors.yellow,
    shape: "wave",
  },
  {
    title: "Hospitality Notes",
    eyebrow: "Venues and guest experience",
    copy: "Cinematic hospitality edits that capture arrivals, service rituals, atmosphere, tablescapes and hidden details.",
    image: images.gala,
    color: colors.green,
    shape: "squircle",
  },
  {
    title: "Production Diaries",
    eyebrow: "Behind the scenes",
    copy: "Backstage reporting for crews, rehearsals, lighting checks, production builds and the craft behind live moments.",
    image: images.backstage,
    color: colors.blue,
    shape: "teardrop",
  },
];

const articles: Array<{
  title: string;
  tag: string;
  copy: string;
  image: string;
  color: string;
}> = [
  {
    title: "The conversation before the curtain rises",
    tag: "Interview",
    copy: "Short-form interviews shaped for executives, artists, hosts and guests who define the room.",
    image: images.interview,
    color: colors.blue,
  },
  {
    title: "How venues become characters",
    tag: "Venue Essay",
    copy: "A visual editorial format for luxury locations, hospitality teams and architectural atmosphere.",
    image: images.venue,
    color: colors.yellow,
  },
  {
    title: "Audience energy as the main edit",
    tag: "Field Notes",
    copy: "Fast, elegant coverage built around reactions, movement, sound checks and human texture.",
    image: images.networking,
    color: colors.green,
  },
];

const galleryItems: Array<{
  title: string;
  image: string;
  color: string;
  shape: ShapeVariant;
  className: string;
}> = [
  { title: "Main stage color wash", image: images.hero, color: colors.red, shape: "hexagon", className: "lg:col-span-5 lg:row-span-2" },
  { title: "Interview lounge", image: images.interview, color: colors.blue, shape: "wave", className: "lg:col-span-3" },
  { title: "Arrival atmosphere", image: images.venue, color: colors.yellow, shape: "squircle", className: "lg:col-span-4" },
  { title: "Hospitality detail", image: images.gala, color: colors.green, shape: "teardrop", className: "lg:col-span-4" },
  { title: "Audience movement", image: images.audience, color: colors.blue, shape: "rounded", className: "lg:col-span-4" },
  { title: "Production texture", image: images.backstage, color: colors.red, shape: "blob", className: "lg:col-span-4" },
];

function getCurrentPage(): PageKey {
  if (typeof window === "undefined") {
    return "home";
  }

  const slug = window.location.hash.replace(/^#\/?/, "") || "home";
  return NAV_ITEMS.some((item) => item.key === slug) ? (slug as PageKey) : "home";
}

function useHashPage() {
  const [page, setPage] = useState<PageKey>(getCurrentPage);

  useEffect(() => {
    const onHashChange = () => setPage(getCurrentPage());
    window.addEventListener("hashchange", onHashChange);
    onHashChange();
    return () => window.removeEventListener("hashchange", onHashChange);
  }, []);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [page]);

  return page;
}

function useLenisSmoothScroll() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.15,
      easing: (time: number) => Math.min(1, 1.001 - 2 ** (-10 * time)),
      smoothWheel: true,
      wheelMultiplier: 0.82,
    });

    let frame = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      frame = requestAnimationFrame(raf);
    };

    frame = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(frame);
      lenis.destroy();
    };
  }, []);
}

function useGsapScroll(page: PageKey, scopeRef: React.RefObject<HTMLDivElement | null>) {
  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const context = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
        gsap.fromTo(
          element,
          { opacity: 0, y: 60 },
          {
            opacity: 1,
            y: 0,
            duration: 1,
            ease: "power3.out",
            scrollTrigger: {
              trigger: element,
              start: "top 84%",
            },
          },
        );
      });

      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((element) => {
        const speed = Number.parseFloat(element.dataset.speed ?? "0.16");
        gsap.to(element, {
          yPercent: speed * -100,
          ease: "none",
          scrollTrigger: {
            trigger: element.parentElement ?? element,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      });
    }, scopeRef);

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 300);

    return () => {
      window.clearTimeout(refresh);
      context.revert();
    };
  }, [page, scopeRef]);
}

export default function App() {
  const page = useHashPage();
  const appRef = useRef<HTMLDivElement | null>(null);

  useLenisSmoothScroll();
  useGsapScroll(page, appRef);

  return (
    <div ref={appRef} className="min-h-screen min-w-0 overflow-x-hidden bg-[#fbfaf7] text-neutral-950 antialiased">
      <SiteNav page={page} />
      <AnimatePresence mode="wait">
        <motion.main key={page} variants={pageVariants} initial="initial" animate="animate" exit="exit" className="overflow-x-hidden">
          {renderPage(page)}
        </motion.main>
      </AnimatePresence>
      <SiteFooter />
      <CookieConsent />
    </div>
  );
}

function renderPage(page: PageKey) {
  switch (page) {
    case "events":
      return <EventsPage />;
    case "media":
      return <MediaPage />;
    case "gallery":
      return <GalleryPage />;
    case "contact":
      return <ContactPage />;
    case "home":
    default:
      return <HomePage />;
  }
}

function SiteNav({ page }: { page: PageKey }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 px-3 py-2 sm:px-5">
      <nav className="mx-auto flex h-14 w-full max-w-screen-2xl items-center justify-between rounded-full border border-white/75 bg-white/90 px-4 shadow-[0_12px_40px_rgba(20,20,20,0.08)] backdrop-blur-2xl sm:px-6">
        <a href="#/" className="flex items-center" aria-label="Special Events Channel home">
          <img src="/images/header-logo-transparent.png" alt="Special Events Channel logo" className="h-14 w-auto" />
        </a>

        <div className="hidden flex-1 items-center justify-center gap-2 rounded-full bg-neutral-100/80 px-2 py-1 lg:flex">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              className={cn(
                "rounded-full px-3 py-2 text-sm font-semibold text-neutral-500 transition-all duration-300 hover:text-neutral-950",
                page === item.key && "bg-white text-neutral-950 shadow-[0_8px_24px_rgba(20,20,20,0.08)]",
              )}
            >
              {item.label}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <a
            href="#/contact"
            className="hidden rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white transition-all duration-300 hover:bg-[#ff6f61] hover:shadow-[0_16px_34px_rgba(255,111,97,0.24)] lg:inline-flex"
          >
            Start a brief
          </a>
          <button
            type="button"
            aria-label="Toggle navigation"
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((open) => !open)}
            className="inline-flex h-10 w-10 flex-col items-center justify-center gap-1.5 rounded-full border border-neutral-200 bg-white text-neutral-950 transition hover:bg-neutral-100 lg:hidden"
          >
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
            <span className="block h-0.5 w-5 rounded-full bg-current" />
          </button>
        </div>
      </nav>
      <div
        className={cn(
          "no-scrollbar mx-auto mt-2 w-full max-w-screen-2xl overflow-hidden rounded-[28px] bg-white/90 p-3 shadow-[0_16px_50px_rgba(20,20,20,0.07)] backdrop-blur-2xl lg:hidden",
          mobileOpen ? "block" : "hidden",
        )}
      >
        <div className="flex flex-col gap-2">
          {NAV_ITEMS.map((item) => (
            <a
              key={item.key}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                "rounded-full px-4 py-3 text-sm font-black uppercase tracking-[0.18em] text-neutral-700 transition-all duration-300 hover:bg-neutral-100",
                page === item.key && "bg-neutral-950 text-white",
              )}
            >
              {item.label}
            </a>
          ))}
          <a
            href="#/contact"
            onClick={() => setMobileOpen(false)}
            className="rounded-full bg-neutral-950 px-4 py-3 text-sm font-bold uppercase tracking-[0.16em] text-white transition-all duration-300 hover:bg-[#ff6f61] sm:px-5"
          >
            Start a brief
          </a>
        </div>
      </div>
    </header>
  );
}

function HomePage() {
  return (
    <>
      <HeroSection />
      <ReferenceInspiredSystem />
      <EventsPreview />
      <MediaPreview />
      <GalleryPreview />
      <CtaBand />
    </>
  );
}

function HeroSection() {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const element = videoRef.current;
    if (!element) return;

    const playPromise = element.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        element.muted = true;
        element.play().catch(() => {
          // video autoplay blocked
        });
      });
    }
  }, []);

  return (
    <section className="relative isolate min-h-[100svh] overflow-hidden bg-[#fff7ee] pt-28">
      <video
        ref={videoRef}
        src={encodeURI(images.video)}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      >
        <source src={encodeURI(images.video)} type="video/mp4" />
      </video>
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,250,241,0.28)_0%,rgba(255,250,241,0.18)_42%,rgba(255,250,241,0.08)_100%)]" />
      <div className="grain absolute inset-0 -z-10 opacity-10" />

      <div className="mx-auto flex min-h-[calc(100svh-7rem)] w-full max-w-screen-xl flex-col items-center justify-center px-5 pb-14 text-center lg:px-8">
        <div className="relative z-10">
          <motion.h1
  initial={{ opacity: 0, y: 22 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.08, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
  className="mx-auto max-w-[14ch] text-[clamp(3.2rem,8vw,6.5rem)] font-black uppercase tracking-[0.08em] leading-[1.1] text-black drop-shadow-[0_18px_28px_rgba(0,0,0,0.7)]"
>
  Special Events Channel
</motion.h1>
          <motion.p
  initial={{ opacity: 0, y: 24 }}
  animate={{ opacity: 1, y: 0 }}
  transition={{ delay: 0.18, duration: 0.8 }}
  className="mt-8 mx-auto max-w-2xl text-lg leading-8 font-bold text-white-400 drop-shadow-[0_6px_16px_rgba(0,0,0,0.6)] sm:text-xl sm:leading-9"
>
  An immersive editorial platform for premieres, summits, hospitality and the stories that make live culture feel cinematic.
</motion.p>
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.28, duration: 0.8 }}
            className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
          >
            <a href="#/events" className="rounded-full bg-neutral-950 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#ff6f61]">
              Explore events
            </a>
            <a href="#/media" className="rounded-full border border-neutral-950/15 bg-white/75 px-8 py-4 text-center text-sm font-black uppercase tracking-[0.2em] text-neutral-950 backdrop-blur-xl transition-all duration-300 hover:border-neutral-950 hover:bg-white">
              Watch the channel
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function ReferenceInspiredSystem() {
  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-screen-2xl">
        <SectionHeading
          eyebrow="Visual language"
          title="Color blocks, custom masks and editorial coverage in motion."
          copy="The channel is built like a living magazine: bright geometric fields, shaped photography, cinematic context and playful premium pacing inspired by the supplied reference direction."
        />
        <div className="mt-14 grid gap-6">
          <ColorShowcase
            color={colors.red}
            title="Stage stories that arrive like a title sequence."
            copy="Hexagonal frames turn keynote rooms and premiere stages into a bold first impression."
            image={images.hero}
            variant="hexagon"
            accent={colors.yellow}
          />
          <ColorShowcase
            color={colors.yellow}
            title="Interviews cut into playful wave-shaped moments."
            copy="Hosts, speakers and guests sit inside abstract masks that feel energetic without losing editorial polish."
            image={images.interview}
            variant="wave"
            accent={colors.blue}
            reverse
          />
          <ColorShowcase
            color={colors.green}
            title="Hospitality details orbit the main feature."
            copy="Soft squircle crops, gentle overlaps and teardrop edges capture texture, service and atmosphere."
            image={images.gala}
            variant="teardrop"
            accent={colors.red}
          />
          <ColorShowcase
            color={colors.blue}
            title="Behind-the-scenes edits become collectible visual chapters."
            copy="Production crews, cameras and venue transitions are framed as clean, immersive compositions."
            image={images.backstage}
            variant="rounded"
            accent={colors.green}
            reverse
          />
        </div>
      </div>
    </section>
  );
}

function ColorShowcase({
  color,
  title,
  copy,
  image,
  variant,
  accent,
  reverse = false,
}: {
  color: string;
  title: string;
  copy: string;
  image: string;
  variant: ShapeVariant;
  accent: string;
  reverse?: boolean;
}) {
  return (
    <article data-reveal className="relative overflow-hidden rounded-[38px] shadow-[0_36px_100px_rgba(20,20,20,0.08)]" style={{ backgroundColor: color }}>
      <div className={cn("grid min-h-[360px] sm:min-h-[520px] gap-6 lg:grid-cols-2", reverse && "lg:[&>*:first-child]:order-2")}>
        <div className="relative z-10 flex flex-col justify-end p-8 text-neutral-950 sm:p-12 lg:p-16">
          <span className="mb-6 h-5 w-24 rounded-full bg-white/70" />
          <h2 className="max-w-xl text-4xl font-black uppercase leading-[0.9] tracking-[-0.06em] sm:text-6xl lg:text-7xl">{title}</h2>
          <p className="mt-7 max-w-lg text-lg font-medium leading-8 text-neutral-800">{copy}</p>
        </div>
        <div className="relative min-h-[280px] sm:min-h-[420px] overflow-hidden">
          <motion.span
            data-parallax
            data-speed="0.08"
            className="shape-plus absolute right-12 top-10 h-20 w-20 bg-white/65"
            animate={{ y: [0, -16, 0], rotate: [0, 8, 0] }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.span
            className="absolute bottom-14 left-8 h-28 w-28 rounded-full bg-white/60"
            animate={{ y: [0, 18, 0], scale: [1, 1.06, 1] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="absolute inset-x-8 bottom-8 top-8 rounded-[34px] bg-white/22" />
          <ShapeImage src={image} alt={title} variant={variant} className="absolute left-1/2 top-1/2 h-[220px] w-[320px] -translate-x-1/2 -translate-y-1/2 shadow-[0_40px_90px_rgba(20,20,20,0.24)] sm:h-[310px] sm:w-[430px]" />
          <ShapeImage src={images.networking} alt="Editorial event detail" variant="squircle" className="absolute bottom-10 right-10 h-28 w-28 border-[9px] border-white/80" />
          <span className="absolute left-16 top-12 h-16 w-16 rounded-full" style={{ backgroundColor: accent }} />
        </div>
      </div>
    </article>
  );
}

function EventsPreview() {
  return (
    <section className="relative overflow-hidden bg-[#f4f1eb] px-5 py-24 lg:px-8 lg:py-32">
      <FloatingSymbols density="section" />
      <div className="mx-auto w-full max-w-screen-2xl">
        <SectionHeading
          eyebrow="Events"
          title="Coverage systems for rooms with energy."
          copy="From conference stages to hospitality moments, each format is designed to feel editorial, image-led and instantly ownable."
        />
        <div className="mt-14 grid gap-5 md:grid-cols-2">
          {eventSeries.map((event) => (
            <EventTile key={event.title} event={event} />
          ))}
        </div>
        <div className="mt-12 flex justify-center">
          <a href="#/events" className="rounded-full bg-neutral-950 px-7 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#22c1c3]">
            View event formats
          </a>
        </div>
      </div>
    </section>
  );
}

function EventTile({ event }: { event: (typeof eventSeries)[number] }) {
  return (
    <motion.article
      data-reveal
      whileHover={{ y: -8 }}
      className="group relative min-h-[360px] sm:min-h-[420px] cursor-pointer overflow-hidden rounded-[34px] bg-neutral-900 shadow-[0_36px_90px_rgba(20,20,20,0.12)]"
    >
      <img src={event.image} alt={event.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" />
      <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.02),rgba(0,0,0,0.62))]" />
      <div className="absolute right-8 top-8 h-28 w-28 opacity-95 transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110" style={{ ...shapeStyles[event.shape], backgroundColor: event.color }} />
      <div className="absolute bottom-0 left-0 right-0 p-8 text-white sm:p-10">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-white/75">{event.eyebrow}</p>
        <h3 className="mt-4 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] sm:text-6xl">{event.title}</h3>
        <p className="mt-5 max-w-xl text-base leading-7 text-white/82">{event.copy}</p>
      </div>
    </motion.article>
  );
}

function MediaPreview() {
  return (
    <section className="overflow-hidden bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto w-full max-w-screen-2xl">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
          <SectionHeading
            eyebrow="Media and interviews"
            title="A channel built for faces, voices and atmosphere."
            copy="Interview packages, venue essays and social-ready edits share one visual language: bright, sculptural and premium."
          />
          <div className="flex justify-start lg:justify-end">
            <a href="#/media" className="rounded-full border border-neutral-950/15 bg-white px-7 py-4 text-sm font-black uppercase tracking-[0.2em] text-neutral-950 transition-all duration-300 hover:border-neutral-950 hover:bg-neutral-950 hover:text-white">
              Open media room
            </a>
          </div>
        </div>
        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {articles.map((article, index) => (
            <ArticlePanel key={article.title} article={article} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

function ArticlePanel({ article, index }: { article: (typeof articles)[number]; index: number }) {
  const variant: ShapeVariant = index === 0 ? "wave" : index === 1 ? "squircle" : "teardrop";

  return (
    <article data-reveal className="relative overflow-hidden rounded-[34px] bg-white p-4 shadow-[0_28px_80px_rgba(20,20,20,0.08)]">
      <div className="relative h-[280px] sm:h-[330px] overflow-hidden rounded-[28px]" style={{ backgroundColor: article.color }}>
        <ShapeImage src={article.image} alt={article.title} variant={variant} className="absolute left-1/2 top-1/2 h-[200px] w-[260px] -translate-x-1/2 -translate-y-1/2 sm:h-[250px] sm:w-[300px]" />
        <span className="shape-plus absolute right-6 top-6 h-12 w-12 bg-white/75" />
      </div>
      <div className="p-5">
        <p className="text-xs font-black uppercase tracking-[0.28em] text-neutral-400">{article.tag}</p>
        <h3 className="mt-4 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em]">{article.title}</h3>
        <p className="mt-4 text-base leading-7 text-neutral-600">{article.copy}</p>
      </div>
    </article>
  );
}

function GalleryPreview() {
  return (
    <section className="relative overflow-hidden bg-[#fff7ee] px-5 py-24 lg:px-8 lg:py-32">
      <div className="hidden lg:block absolute left-[-8rem] top-20 h-72 w-72 rounded-full bg-[#ffcb7d]/60 blur-3xl" />
      <div className="hidden lg:block absolute bottom-10 right-[-8rem] h-80 w-80 rounded-full bg-[#22c1c3]/40 blur-3xl" />
      <div className="mx-auto w-full max-w-screen-2xl">
        <SectionHeading
          eyebrow="Gallery"
          title="A visual archive of shaped moments."
          copy="The gallery uses star frames, circles, puzzle crops and rich color fields to keep every image feeling authored."
        />
        <GalleryMosaic preview />
      </div>
    </section>
  );
}

function CtaBand() {
  return (
    <section className="relative overflow-hidden bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
      <div className="mx-auto max-w-[1400px] overflow-hidden rounded-[44px] bg-neutral-950 text-white shadow-[0_46px_120px_rgba(20,20,20,0.18)]">
        <div className="relative grid grid-cols-1 gap-8 p-6 sm:p-10 lg:grid-cols-[1fr_0.85fr] lg:p-16">
          <div className="absolute right-6 top-6 h-24 w-24 rounded-full bg-[#ffcb7d] sm:right-10 sm:top-10" />
          <span className="shape-plus absolute bottom-10 right-20 h-16 w-16 bg-[#8e7ef0] sm:bottom-12 sm:right-52" />
          <div className="relative z-10">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-white/55">Brief the channel</p>
            <h2 className="mt-6 max-w-4xl text-3xl font-black uppercase leading-[1] tracking-[-0.04em] sm:text-4xl lg:text-6xl xl:text-7xl">
              Turn your event into an editorial experience.
            </h2>
            <p className="mt-7 max-w-2xl text-base leading-7 text-white/72 sm:text-lg">
              Build a premium coverage package for stages, interviews, hospitality and behind-the-scenes storytelling.
            </p>
            <a href="#/contact" className="mt-10 inline-flex rounded-full bg-white px-6 py-3 text-sm font-black uppercase tracking-[0.2em] text-neutral-950 transition-all duration-300 hover:bg-[#ffcb7d]">
              Contact the studio
            </a>
          </div>
          <div className="relative z-10 hidden md:block min-h-[390px] overflow-hidden">
            <ShapeImage src={images.portrait} alt="Speaker portrait" variant="wave" className="absolute left-0 top-8 h-[310px] w-[260px] border-[12px] border-neutral-950" />
            <ShapeImage src={images.networking} alt="Networking event" variant="squircle" className="absolute bottom-0 right-0 h-[260px] w-[260px] border-[12px] border-neutral-950" />
            <ShapeImage src={images.venue} alt="Venue arrival" variant="hexagon" className="absolute right-36 top-0 h-44 w-44 border-[10px] border-neutral-950" />
          </div>
        </div>
      </div>
    </section>
  );
}

function EventsPage() {
  return (
    <>
      <PageHero
        eyebrow="Events"
        title="Formats for culture, commerce and spectacle."
        copy="Special Events Channel packages live moments into premium editorial coverage with shaped photography, interviews and cinematic recaps."
        image={images.audience}
        color={colors.yellow}
        shape="wave"
      />
      <section className="bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Event architecture"
            title="Each event becomes a visual world."
            copy="Use the formats independently or combine them into a complete channel package before, during and after the event."
          />
          <div className="mt-14 grid gap-5 md:grid-cols-2">
            {eventSeries.map((event) => (
              <EventTile key={event.title} event={event} />
            ))}
          </div>
        </div>
      </section>
      <section className="overflow-hidden bg-[#f4f1eb] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div data-reveal>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-neutral-500">Event flow</p>
            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl">
              Before. During. After. Always editorial.
            </h2>
            <p className="mt-7 max-w-xl text-lg leading-8 text-neutral-600">
              We frame the event as a campaign: anticipation assets, live room coverage, interview captures, visual recaps and archive-ready galleries.
            </p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            {[
              ["01", "Pre-event visual treatment", colors.red],
              ["02", "Live capture and interviews", colors.blue],
              ["03", "Same-day editorial selects", colors.yellow],
              ["04", "Post-event story packages", colors.green],
            ].map(([number, title, color]) => (
              <div key={number} data-reveal className="relative min-h-[260px] overflow-hidden rounded-[34px] p-8" style={{ backgroundColor: color }}>
                <span className="shape-plus absolute right-8 top-8 h-14 w-14 bg-white/60" />
                <p className="text-sm font-black uppercase tracking-[0.25em] text-neutral-950/55">{number}</p>
                <h3 className="mt-20 text-3xl font-black uppercase leading-[0.95] tracking-[-0.04em]">{title}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function MediaPage() {
  return (
    <>
      <PageHero
        eyebrow="Media"
        title="Interview rooms, visual essays and campaign-ready edits."
        copy="A bright editorial media system for guests, speakers, creative directors, venues and hospitality teams."
        image={images.interview}
        color={colors.blue}
        shape="blob"
      />
      <section className="bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <SectionHeading
            eyebrow="Editorial slate"
            title="Made for stories that move across every screen."
            copy="Each media product is composed with oversized type, immersive images and a geometry-led identity system."
          />
          <div className="mt-14 grid gap-5 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticlePanel key={article.title} article={article} index={index} />
            ))}
          </div>
        </div>
      </section>
      <section className="bg-[#fff7ee] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto grid max-w-[1400px] gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div className="relative min-h-[620px] overflow-hidden rounded-[44px] bg-[#ff6f61]" data-reveal>
            <ShapeImage src={images.portrait} alt="Editorial speaker portrait" variant="wave" className="absolute left-10 top-12 hidden md:block h-[360px] w-[300px] border-[12px] border-neutral-950" />
            <ShapeImage src={images.audience} alt="Audience reaction" variant="squircle" className="absolute bottom-10 right-10 hidden md:block h-[300px] w-[300px] border-[14px] border-[#ff6f61]" />
            <ShapeImage src={images.backstage} alt="Backstage crew" variant="hexagon" className="absolute right-20 top-24 hidden md:block h-52 w-52 border-[10px] border-[#ff6f61]" />
            <span className="shape-plus absolute bottom-24 left-24 h-20 w-20 bg-[#ffcb7d]" />
          </div>
          <div data-reveal>
            <p className="text-xs font-black uppercase tracking-[0.34em] text-neutral-500">Media grammar</p>
            <h2 className="mt-5 text-5xl font-black uppercase leading-[0.88] tracking-[-0.06em] sm:text-7xl">Fast enough for the feed, designed enough for the archive.</h2>
            <p className="mt-7 text-lg leading-8 text-neutral-600">
              The visual system balances production speed with art direction: soft overlays, geometric crops, color-coded storylines and typography that feels like a magazine cover.
            </p>
          </div>
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function GalleryPage() {
  return (
    <>
      <PageHero
        eyebrow="Gallery"
        title="A sculptural archive for event photography."
        copy="Open each visual to see how the channel treats stages, audiences, interviews, venues and hospitality as a cohesive campaign world."
        image={images.venue}
        color={colors.green}
        shape="squircle"
      />
      <section className="bg-[#fbfaf7] px-5 py-24 lg:px-8 lg:py-32">
        <div className="mx-auto max-w-[1400px]">
          <GalleryMosaic />
        </div>
      </section>
      <CtaBand />
    </>
  );
}

function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Contact"
        title="Brief a premium event story."
        copy="Send a concise note for coverage packages, interviews, gallery systems and editorial event campaigns."
        image={images.networking}
        color={colors.red}
        shape="rounded"
      />
      <section className="relative overflow-hidden overflow-x-hidden bg-[#fff7ee] px-4 py-20 sm:px-6 sm:py-24 lg:px-8 lg:py-32 box-border">
        <div className="hidden lg:block absolute left-[-12rem] top-10 h-96 w-96 rounded-full bg-[#22c1c3]/30 blur-3xl" />
        <div className="hidden lg:block absolute bottom-0 right-[-12rem] h-96 w-96 rounded-full bg-[#ffcb7d]/50 blur-3xl" />
        <div className="mx-auto grid w-full max-w-[1400px] gap-10 grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] lg:items-start min-w-0 max-w-full">
          <div data-reveal className="min-w-0 w-full">
            <p className="text-xs font-black uppercase tracking-[0.34em] text-neutral-500">Secure inquiry</p>
            <h2 className="mt-5 max-w-full break-words text-4xl font-black uppercase leading-[1] tracking-[-0.05em] sm:text-5xl lg:text-6xl">One clean form. Protected by invisible checks.</h2>
            <p className="mt-7 max-w-full text-base leading-7 text-neutral-600 sm:text-lg">
              The contact flow includes hidden CAPTCHA fields, timing checks, message limits and a GoDaddy-compatible PHP handler for server-side validation.
            </p>
            <a href="mailto:info@specialeventschannel.com" className="mt-8 inline-flex w-full max-w-full justify-center rounded-full bg-neutral-950 px-4 py-4 text-[0.78rem] font-black uppercase tracking-[0.12em] text-center text-white transition-all duration-300 hover:bg-[#22c1c3] sm:w-auto sm:px-6 sm:text-sm sm:tracking-[0.18em] whitespace-normal break-words">
              info@specialeventschannel.com
            </a>
          </div>
          <ContactForm />
        </div>
      </section>
    </>
  );
}

function PageHero({
  eyebrow,
  title,
  copy,
  image,
  color,
  shape,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  image: string;
  color: string;
  shape: ShapeVariant;
}) {
  return (
    <section className="relative isolate min-h-[82svh] overflow-hidden bg-[#fbfaf7] pt-28">
      <img src={image} alt={title} className="absolute inset-0 -z-20 h-full w-full object-cover" />
      <div className="absolute inset-0 -z-10 bg-[linear-gradient(90deg,rgba(255,250,241,0.98),rgba(255,250,241,0.82),rgba(255,250,241,0.42))]" />
      <FloatingSymbols density="section" />
      <div className="mx-auto grid min-h-[calc(82svh-7rem)] max-w-[1400px] items-center gap-10 px-5 pb-16 lg:grid-cols-[1fr_0.85fr] lg:px-8">
        <div data-reveal>
          <p className="text-xs font-black uppercase tracking-[0.36em] text-neutral-500">{eyebrow}</p>
          <h1 className="mt-6 max-w-5xl text-[clamp(3rem,8vw,6rem)] font-black uppercase leading-[0.8] tracking-[-0.08em] text-neutral-950">{title}</h1>
          <p className="mt-8 max-w-2xl text-xl leading-8 text-neutral-700 sm:text-2xl sm:leading-9">{copy}</p>
        </div>
        <div className="relative hidden min-h-[520px] lg:block" aria-hidden="true">
          <div className="absolute inset-x-4 bottom-12 top-10 rounded-[40px]" style={{ backgroundColor: color }} />
          <ShapeImage src={image} alt="Editorial feature" variant={shape} className="absolute left-1/2 top-1/2 h-[390px] w-[480px] -translate-x-1/2 -translate-y-1/2 shadow-[0_44px_100px_rgba(20,20,20,0.22)]" />
          <ShapeImage src={images.gala} alt="Event detail" variant="squircle" className="absolute bottom-2 right-2 h-32 w-32 border-[10px] border-[#fbfaf7]" />
          <span className="shape-plus absolute left-2 top-4 h-20 w-20 bg-white/70" />
        </div>
        <div className="relative lg:hidden mt-10 h-[220px] overflow-hidden rounded-[32px] bg-white/15 sm:h-[260px]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,111,97,0.16),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(34,193,195,0.12),transparent_30%)]" />
          <ShapeImage src={image} alt="Editorial feature" variant={shape} className="absolute inset-4 h-[calc(100%-1.5rem)] w-[calc(100%-1.5rem)]" />
        </div>
      </div>
    </section>
  );
}

function GalleryMosaic({ preview = false }: { preview?: boolean }) {
  const [active, setActive] = useState<(typeof galleryItems)[number] | null>(null);
  const items = preview ? galleryItems.slice(0, 5) : galleryItems;

  return (
    <>
      <div className="mt-14 grid auto-rows-[280px] gap-5 lg:grid-cols-12">
        {items.map((item) => (
          <button
            key={item.title}
            data-reveal
            type="button"
            onClick={() => setActive(item)}
            className={cn("group relative overflow-hidden rounded-[34px] text-left shadow-[0_32px_80px_rgba(20,20,20,0.08)]", item.className)}
            style={{ backgroundColor: item.color }}
          >
            <ShapeImage src={item.image} alt={item.title} variant={item.shape} className="absolute left-1/2 top-1/2 h-[84%] w-[84%] -translate-x-1/2 -translate-y-1/2 transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.46))]" />
            <span className="shape-plus absolute right-6 top-6 h-12 w-12 bg-white/70 transition-transform duration-500 group-hover:rotate-12" />
            <span className="absolute bottom-6 left-6 text-sm font-black uppercase tracking-[0.22em] text-white">{item.title}</span>
          </button>
        ))}
      </div>
      <AnimatePresence>{active && <ImagePreview item={active} onClose={() => setActive(null)} />}</AnimatePresence>
    </>
  );
}

function ImagePreview({ item, onClose }: { item: (typeof galleryItems)[number]; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[80] grid place-items-center bg-[#fbfaf7]/90 p-5 backdrop-blur-2xl"
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.92, y: 30 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.96, y: 10 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative h-[82vh] w-full max-w-[1400px] overflow-hidden rounded-[44px] shadow-[0_50px_130px_rgba(20,20,20,0.2)]"
        style={{ backgroundColor: item.color }}
        onClick={(event) => event.stopPropagation()}
      >
        <img src={item.image} alt={item.title} className="h-full w-full object-cover mix-blend-multiply" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0),rgba(0,0,0,0.48))]" />
        <h2 className="absolute bottom-8 left-6 right-6 text-4xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-white sm:right-28 sm:text-7xl">{item.title}</h2>
        <button type="button" onClick={onClose} className="absolute right-6 top-6 rounded-full bg-white px-5 py-3 text-xs font-black uppercase tracking-[0.2em] text-neutral-950">
          Close
        </button>
      </motion.div>
    </motion.div>
  );
}

function ContactForm() {
  const [status, setStatus] = useState<ContactState>("idle");
  const [statusMessage, setStatusMessage] = useState("Messages are limited to 900 characters and validated server-side.");
  const [message, setMessage] = useState("");
  const startedAt = useRef(Math.floor(Date.now() / 1000));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const honeypot = String(formData.get("companyWebsite") ?? "").trim();
    const lastSent = Number(window.localStorage.getItem("sec:lastContact") ?? 0);

    if (honeypot) {
      setStatus("error");
      setStatusMessage("Spam validation failed. Please refresh and try again.");
      return;
    }

    if (Date.now() - lastSent < 20_000) {
      setStatus("error");
      setStatusMessage("Please wait a moment before sending another message.");
      return;
    }

    if (message.trim().length < 20 || message.length > 900) {
      setStatus("error");
      setStatusMessage("Please keep your message between 20 and 900 characters.");
      return;
    }

    setStatus("sending");
    setStatusMessage("Validating and sending your inquiry...");

    try {
      const response = await fetch("/contact-handler.php", {
        method: "POST",
        body: formData,
        headers: { Accept: "application/json" },
      });
      const result = (await response.json().catch(() => null)) as { ok?: boolean; message?: string } | null;

      if (!response.ok || !result?.ok) {
        throw new Error(result?.message ?? "Unable to send the message.");
      }

      window.localStorage.setItem("sec:lastContact", String(Date.now()));
      setStatus("success");
      setStatusMessage("Your message was sent. The Special Events Channel team will reply by email.");
      form.reset();
      setMessage("");
    } catch (error) {
      const fallback = error instanceof Error ? error.message : "Message service unavailable.";
      setStatus("error");
      setStatusMessage(`${fallback} You can also email info@specialeventschannel.com.`);
    }
  };

  return (
    <form data-reveal onSubmit={handleSubmit} className="relative min-w-0 w-full max-w-full overflow-hidden rounded-[40px] border border-white/70 bg-white/72 p-4 shadow-[0_42px_120px_rgba(20,20,20,0.1)] backdrop-blur-2xl sm:p-6 md:p-8 box-border">
      <div className="hidden sm:block absolute right-8 top-8 h-24 w-24 rounded-full bg-[#ffcb7d]/70" />
      <span className="hidden sm:block shape-plus absolute bottom-8 left-8 h-16 w-16 bg-[#8e7ef0]/80" />
      <div className="relative grid gap-5 sm:grid-cols-2 min-w-0 max-w-full">
        <label className="grid w-full gap-2 text-sm font-bold text-neutral-600 min-w-0">
          Name
          <input name="name" required maxLength={80} className="w-full max-w-full box-border rounded-[22px] border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950" placeholder="Your name" />
        </label>
        <label className="grid w-full gap-2 text-sm font-bold text-neutral-600 min-w-0">
          Email
          <input name="email" required type="email" maxLength={120} className="w-full max-w-full box-border rounded-[22px] border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950" placeholder="name@example.com" />
        </label>
        <label className="grid w-full gap-2 text-sm font-bold text-neutral-600 min-w-0 sm:col-span-2">
          Project type
          <select name="interest" required className="w-full max-w-full box-border rounded-[22px] border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950">
            <option value="Event coverage">Event coverage</option>
            <option value="Interview package">Interview package</option>
            <option value="Gallery and media archive">Gallery and media archive</option>
            <option value="Full editorial campaign">Full editorial campaign</option>
          </select>
        </label>
        <label className="grid w-full gap-2 text-sm font-bold text-neutral-600 min-w-0 sm:col-span-2">
          Message
          <textarea
            name="message"
            required
            maxLength={900}
            rows={7}
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className="w-full max-w-full box-border resize-none rounded-[24px] border border-neutral-200 bg-white px-4 py-4 text-base text-neutral-950 outline-none transition focus:border-neutral-950"
            placeholder="Tell us about the event, city, date window and coverage goals."
          />
        </label>
      </div>
      <div className="absolute -left-[9999px] h-px w-px overflow-hidden" aria-hidden="true">
        <label>
          Company website
          <input name="companyWebsite" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      <input type="hidden" name="startedAt" value={startedAt.current} />
      <input type="hidden" name="formVersion" value="sec-v1" />
      <div className="relative mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className={cn("text-sm leading-6", status === "success" ? "text-emerald-700" : status === "error" ? "text-red-600" : "text-neutral-500")}>{statusMessage}</p>
        <button
          type="submit"
          disabled={status === "sending"}
          className="rounded-full bg-neutral-950 px-7 py-4 text-sm font-black uppercase tracking-[0.2em] text-white transition-all duration-300 hover:bg-[#ff6f61] disabled:cursor-wait disabled:opacity-60"
        >
          {status === "sending" ? "Sending" : "Send inquiry"}
        </button>
      </div>
    </form>
  );
}

function SectionHeading({ eyebrow, title, copy }: { eyebrow: string; title: string; copy: string }) {
  return (
    <div data-reveal className="max-w-4xl">
      <p className="text-xs font-black uppercase tracking-[0.34em] text-neutral-500">{eyebrow}</p>
      <h2 className="mt-5 text-4xl font-black uppercase leading-[0.88] tracking-[-0.06em] text-neutral-950 sm:text-6xl lg:text-8xl">{title}</h2>
      <p className="mt-7 max-w-2xl text-lg leading-8 text-neutral-600">{copy}</p>
    </div>
  );
}

function ShapeImage({ src, alt, variant, className }: { src: string; alt: string; variant: ShapeVariant; className?: string }) {
  return (
    <motion.figure
      className={cn("relative overflow-hidden bg-white shadow-[0_22px_60px_rgba(20,20,20,0.15)]", className)}
      style={shapeStyles[variant]}
      initial={{ opacity: 0, scale: 0.92, rotate: -1.5 }}
      whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
      viewport={{ once: true, amount: 0.28 }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
    >
      <img src={src} alt={alt} className="h-full w-full object-cover" />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.18),rgba(255,255,255,0)_45%,rgba(0,0,0,0.12))]" />
    </motion.figure>
  );
}

function FloatingSymbols({ density }: { density: "hero" | "section" }) {
  const symbols = density === "hero" ? [
    { className: "left-[4%] top-[18%] h-16 w-16", color: colors.yellow, delay: 0 },
    { className: "left-[48%] top-[12%] h-10 w-10", color: colors.green, delay: 0.8 },
    { className: "right-[8%] top-[22%] h-14 w-14", color: colors.blue, delay: 1.2 },
    { className: "bottom-[12%] left-[42%] h-12 w-12", color: colors.red, delay: 0.4 },
  ] : [
    { className: "left-[3%] top-[18%] h-12 w-12", color: colors.blue, delay: 0 },
    { className: "right-[7%] top-[20%] h-14 w-14", color: colors.red, delay: 0.5 },
    { className: "bottom-[12%] right-[18%] h-10 w-10", color: colors.green, delay: 1 },
  ];

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden" aria-hidden="true">
      {symbols.map((symbol) => (
        <motion.span
          key={`${symbol.className}-${symbol.color}`}
          className={cn("shape-plus absolute opacity-80 mix-blend-multiply", symbol.className)}
          style={{ backgroundColor: symbol.color }}
          animate={{ y: [0, -18, 0], rotate: [0, 9, 0] }}
          transition={{ duration: 6.5, delay: symbol.delay, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </div>
  );
}

function SiteFooter() {
  return (
    <footer className="bg-neutral-950 text-white px-5 py-10 border-t border-white/10">
      <div className="mx-auto max-w-[1400px] flex flex-col items-center gap-8">

        {/* Floating link ring */}
        <div className="relative w-full flex justify-center">
          <div className="flex flex-wrap justify-center gap-3 text-sm font-medium">

            {["Home", "Events", "Media", "Gallery", "Contact"].map((item, i) => (
              <a
                key={item}
                href={`/${item.toLowerCase() === "home" ? "" : item.toLowerCase()}`}
                className="relative px-4 py-1 rounded-full border border-white/10 overflow-hidden group"
                style={{
                  transform: `rotate(${i % 2 === 0 ? "1deg" : "-1deg"})`,
                }}
              >
                {/* background glow */}
                <span className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition" />

                {/* sliding text effect */}
                <span className="relative z-10 group-hover:tracking-widest transition-all duration-300">
                  {item}
                </span>

                {/* animated underline burst */}
                <span className="absolute left-1/2 bottom-0 h-[2px] w-0 bg-pink-400 group-hover:w-[80%] group-hover:left-[10%] transition-all duration-300" />
              </a>
            ))}
            
          </div>
        </div>

        {/* Email with “scanner line” effect */}
        <a
          href="mailto:info@specialeventschannel.com"
          className="relative text-sm text-neutral-300 tracking-wide group"
        >
          <span className="relative z-10 group-hover:text-white transition">
            info@specialeventschannel.com
          </span>

          {/* scanning highlight line */}
          <span className="absolute left-0 top-1/2 h-[1px] w-0 bg-gradient-to-r from-transparent via-pink-500 to-transparent group-hover:w-full transition-all duration-500" />
        </a>

      </div>
    </footer>
  );
}

function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(window.localStorage.getItem("sec:cookie-consent") !== "set");
  }, []);

  const close = () => {
    window.localStorage.setItem("sec:cookie-consent", "set");
    setVisible(false);
  };

  if (!visible) {
    return null;
  }

  return (
    <motion.aside
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 24 }}
      className="fixed bottom-5 left-5 right-5 z-[90] mx-auto max-w-3xl rounded-[28px] border border-white/75 bg-white/82 p-4 shadow-[0_30px_90px_rgba(20,20,20,0.16)] backdrop-blur-2xl sm:p-5"
      role="dialog"
      aria-label="Cookie consent"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm leading-6 text-neutral-600">
          This site uses essential cookies for preferences and anti-spam form protection. No social media trackers are included.
        </p>
        <div className="flex gap-2">
          <button type="button" onClick={close} className="rounded-full bg-neutral-100 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-neutral-700 transition hover:bg-neutral-200">
            Essential only
          </button>
          <button type="button" onClick={close} className="rounded-full bg-neutral-950 px-5 py-3 text-xs font-black uppercase tracking-[0.18em] text-white transition hover:bg-[#ff6f61]">
            Accept
          </button>
        </div>
      </div>
    </motion.aside>
  );
}
