import type { CSSProperties } from "react";
import { Link } from '@inertiajs/react';

/* ------------------------------------------------------------------
   TYPES
------------------------------------------------------------------- */
interface Project {
  title: string;
  tag: string;
  desc: string;
  link: string;
  hue: number;
}

interface Skill {
  icon: IconName;
  title: string;
  desc: string;
  items: string[];
}

interface ExperienceItem {
  period: string;
  role: string;
  org: string;
  desc: string;
}

/* ------------------------------------------------------------------
   CONTENT — edit these arrays; the layout updates automatically.
------------------------------------------------------------------- */
const projects: Project[] = [
  {
    title: "Currency Converter",
    tag: "React",
    desc: "A currency conversion application.",
    link: "#",
    hue: 32,
  },
  {
    title: "Tic Tac Toe",
    tag: "React",
    desc: "A two-player Tic Tac Toe game.",
    link: "#",
    hue: 12,
  },
];

const skills: Skill[] = [
  {
    icon: "code",
    title: "Frontend",
    desc: "Responsive, accessible interfaces with clean component structure.",
    items: ["HTML", "CSS", "JavaScript", "React"],
  },
  {
    icon: "server",
    title: "Backend",
    desc: "APIs and services that are simple to reason about and easy to extend.",
    items: ["Node.js", "Express", "REST APIs"],
  },
  {
    icon: "brain",
    title: "AI & Data",
    desc: "Building with models responsibly — from data prep to evaluation.",
    items: ["Python", "Machine Learning", "Responsible AI"],
  },
  {
    icon: "tools",
    title: "Tools",
    desc: "The everyday toolkit that keeps work shipping smoothly.",
    items: ["Git", "GitHub", "VS Code", "Figma"],
  },
];

const experience: ExperienceItem[] = [
  {
    period: "Aug,2026 — Present",
    role: "Your Role",
    org: "Ethika AI",
    desc: "Full Stack Developer",
  },
];

const links = {
  github: "https://github.com/your-username",
  linkedin: "https://www.linkedin.com/in/your-username",
  email: "mothilal@ethika.co.in",
};

const navItems: [id: string, label: string][] = [
  ["welcome-section", "Home"],
  ["about", "About"],
  ["skills", "Skills"],
  ["project-section", "Projects"],
  ["experience", "Experience"],
  ["contact", "Contact"],
];

/* ------------------------------------------------------------------
   ICONS
------------------------------------------------------------------- */
const ICONS = {
  logo: "M12 2 3 7v10l9 5 9-5V7l-9-5Zm0 2.3 6.8 3.8L12 11.9 5.2 8.1 12 4.3ZM5 9.8l6 3.4v6.6l-6-3.3V9.8Zm8 10v-6.6l6-3.4v6.7l-6 3.3Z",
  code: "M9.4 16.6 4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4Zm5.2 0 4.6-4.6-4.6-4.6L16 6l6 6-6 6-1.4-1.4Z",
  server: "M4 3h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm0 10h16a1 1 0 0 1 1 1v6a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1v-6a1 1 0 0 1 1-1Zm3-7.5a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Zm0 10a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3Z",
  brain: "M12 2a4 4 0 0 0-4 4v.1A3.5 3.5 0 0 0 5 9.5c0 .7.2 1.3.5 1.9A3.5 3.5 0 0 0 6.5 18 3.5 3.5 0 0 0 12 21a3.5 3.5 0 0 0 5.5-3 3.5 3.5 0 0 0 1-6.6c.3-.6.5-1.2.5-1.9a3.5 3.5 0 0 0-3-3.4V6a4 4 0 0 0-4-4Zm-1 4v13.5a1.5 1.5 0 0 1-3-.5h-.5a1.5 1.5 0 0 1 0-3H8v-2H7a1.5 1.5 0 0 1 0-3h1V9a1.5 1.5 0 0 1 3 0V6Zm2 0v3a1.5 1.5 0 0 1 3 0v2h1a1.5 1.5 0 0 1 0 3h-1v2h.5a1.5 1.5 0 0 1 0 3H16a1.5 1.5 0 0 1-3 .5V6Z",
  tools: "M22.7 19 13.6 9.9c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4Z",
  mail: "M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z",
  github: "M12 2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.4-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.6 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.3 4.7-4.6 5 .4.3.7.9.7 1.9V21c0 .3.2.6.7.5A10 10 0 0 0 12 2Z",
  linkedin: "M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14Zm-.5 15.5v-5.3a3.3 3.3 0 0 0-3.3-3.3c-.9 0-1.9.5-2.4 1.3V10h-2.8v8.5h2.8v-5a1.4 1.4 0 0 1 2.8 0v5h2.9ZM6.9 8.4a1.7 1.7 0 1 0 0-3.4 1.7 1.7 0 0 0 0 3.4Zm1.4 10.1V10H5.5v8.5h2.8Z",
} as const;

type IconName = keyof typeof ICONS;

const Icon = ({ name }: { name: IconName }) => (
  <svg viewBox="0 0 24 24" aria-hidden="true">
    <path d={ICONS[name]} />
  </svg>
);

/* ------------------------------------------------------------------
   PROJECT COVERFLOW (static — first project shown in front)
------------------------------------------------------------------- */
const ACTIVE_PROJECT = 0;

const tileStyle = (i: number, hue: number): CSSProperties => {
  const offset = i - ACTIVE_PROJECT;
  const abs = Math.abs(offset);
  const rotate = offset === 0 ? 0 : offset > 0 ? -38 : 38;
  return {
    transform: `translate(-50%, -50%) translateX(${offset * 62}%) translateZ(${-abs * 160}px) rotateY(${rotate}deg) scale(${offset === 0 ? 1 : 0.86})`,
    zIndex: 100 - abs,
    opacity: abs > 3 ? 0 : 1 - abs * 0.2,
    "--hue": hue,
  } as CSSProperties;
};

const initials = (title: string): string =>
  title
    .split(" ")
    .map((w) => w[0])
    .join("");

function Coverflow() {
  return (
    <div className="coverflow">
      <div className="coverflow-stage">
        {projects.map((p, i) => (
          <a
            key={p.title}
            href={p.link}
            target="_blank"
            rel="noopener noreferrer"
            className={`project-tile${i === ACTIVE_PROJECT ? " is-active" : ""}`}
            style={tileStyle(i, p.hue)}
          >
            <div className="project-art">
              <span>{initials(p.title)}</span>
            </div>
            <div className="project-body">
              <span className="project-tag">{p.tag}</span>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <span className="project-cta">View project →</span>
            </div>
          </a>
        ))}
      </div>

      <div className="coverflow-controls">
        <button type="button" className="control-btn" aria-label="Previous project">‹</button>
        <button type="button" className="control-btn" aria-label="Play">▶</button>
        <button type="button" className="control-btn" aria-label="Next project">›</button>
      </div>

      <div className="indicators">
        {projects.map((p, i) => (
          <button
            type="button"
            key={p.title}
            className={`indicator${i === ACTIVE_PROJECT ? " active" : ""}`}
            aria-label={`Show ${p.title}`}
          />
        ))}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------
   PAGE
------------------------------------------------------------------- */
export default function Home() {
  return (
    <>
      {/* ---------- Navbar ---------- */}
      <nav id="navbar">
        <a href="#welcome-section" className="nav-logo">
          <Icon name="logo" />
          MOTHILAL
        </a>

        <ul className="nav-links">
          {navItems.map(([id, label]) => (
            <li key={id}>
              <a href={`#${id}`} className={id === "welcome-section" ? "active" : ""}>
                {label}
              </a>
            </li>
          ))}
        </ul>

        <Link
            href="/login"
            className="
            btn btn-ghost
            "
        >
            Login
        </Link>

        <button type="button" className="menu-toggle" aria-label="Toggle menu">
          <span />
          <span />
          <span />
        </button>
      </nav>

      <main>
        {/* ---------- Welcome ---------- */}
        <section id="welcome-section">
          <div className="hero-grid" />
          <div className="hero-shape shape-1" />
          <div className="hero-shape shape-2" />
          <div className="hero-shape shape-3" />

          <div className="hero-content">
            <p className="eyebrow">Hello, I'm</p>
            <h1>Mothilal Jadhav</h1>
            <p className="hero-subtitle">Developer · Building with React &amp; Responsible AI</p>
            <div className="hero-actions">
              <a href="#project-section" className="btn btn-solid">View My Work</a>
              <a href="#contact" className="btn btn-ghost">Get In Touch</a>
            </div>
          </div>

          <a href="#about" className="scroll-hint" aria-label="Scroll down">
            <span />
          </a>
        </section>

        {/* ---------- About ---------- */}
        <section id="about" className="section alt">
          <div className="about-grid">
            <div className="about-visual">
              <div className="avatar">M</div>
            </div>
            <div className="about-content">
              <p className="kicker">About Me</p>
              <h2 className="section-title">Curious by default, careful by design.</h2>
              <p>
                I'm a developer at Ethika AI who enjoys turning ideas into clean, usable
                products. I started with HTML and CSS and now build interactive apps in React.
              </p>
              <p>
                I care about software that's fast, accessible and responsible — and I'm
                always learning something new along the way.
              </p>
              <div className="stats">
                <div>
                  <strong>{projects.length}+</strong>
                  <span>Projects</span>
                </div>
                <div>
                  <strong>{skills.reduce((n, s) => n + s.items.length, 0)}</strong>
                  <span>Technologies</span>
                </div>
                <div>
                  <strong>∞</strong>
                  <span>Curiosity</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Skills ---------- */}
        <section id="skills" className="section">
          <header className="section-header">
            <p className="kicker">What I Work With</p>
            <h2 className="section-title">Skills</h2>
          </header>
          <div className="card-grid">
            {skills.map((s) => (
              <article key={s.title} className="skill-card">
                <div className="icon-badge">
                  <Icon name={s.icon} />
                </div>
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
                <ul className="chips">
                  {s.items.map((it) => (
                    <li key={it}>{it}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        {/* ---------- Projects ---------- */}
        <section id="project-section" className="section alt">
          <header className="section-header">
            <p className="kicker">Selected Work</p>
            <h2 className="section-title">Projects</h2>
            <p className="section-subtitle">A few things I've built recently.</p>
          </header>
          <Coverflow />
        </section>

        {/* ---------- Experience ---------- */}
        <section id="experience" className="section">
          <header className="section-header">
            <p className="kicker">My Journey</p>
            <h2 className="section-title">Experience</h2>
          </header>
          <ol className="timeline">
            {experience.map((x) => (
              <li key={x.role + x.org}>
                <span className="period">{x.period}</span>
                <h3>{x.role}</h3>
                <p className="org">{x.org}</p>
                <p>{x.desc}</p>
              </li>
            ))}
          </ol>
        </section>

        {/* ---------- Contact ---------- */}
        <section id="contact" className="section alt">
          <header className="section-header">
            <p className="kicker">Get In Touch</p>
            <h2 className="section-title">Let's talk</h2>
            <p className="section-subtitle">
              Have an idea or a role in mind? I'd love to hear about it.
            </p>
          </header>
          <div className="contact-grid">
            <a href={`mailto:${links.email}`} className="contact-card">
              <div className="icon-badge"><Icon name="mail" /></div>
              <span className="contact-label">Email</span>
              <span className="contact-value">{links.email}</span>
            </a>
            <a
              id="profile-link"
              href={links.github}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <div className="icon-badge"><Icon name="github" /></div>
              <span className="contact-label">GitHub</span>
              <span className="contact-value">View profile</span>
            </a>
            <a
              href={links.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="contact-card"
            >
              <div className="icon-badge"><Icon name="linkedin" /></div>
              <span className="contact-label">LinkedIn</span>
              <span className="contact-value">Connect</span>
            </a>
          </div>
        </section>
      </main>

      {/* ---------- Footer ---------- */}
      <footer>
        <div className="socials">
          <a href={links.github} target="_blank" rel="noopener noreferrer" aria-label="GitHub">
            <Icon name="github" />
          </a>
          <a href={links.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
            <Icon name="linkedin" />
          </a>
          <a href={`mailto:${links.email}`} aria-label="Email">
            <Icon name="mail" />
          </a>
        </div>
        <p>© {new Date().getFullYear()} Mothilal · Built with React</p>
      </footer>
    </>
  );
}