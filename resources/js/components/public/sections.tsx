import type { ReactNode } from 'react';
import { displayUrl, formatMonth, formatPeriod } from '../../lib/format';
import { resolveIcon } from '../../lib/icons';
import type {
    AboutData,
    ContactData,
    HeroData,
    PublicAchievement,
    PublicCertification,
    PublicEducation,
    PublicExperience,
    PublicProject,
    PublicSkillCategory,
    PublicSocialLink,
    SiteData,
} from '../../types';
import Coverflow from './Coverflow';
import Icon from './Icon';

interface SectionProps {
    id: string;
    alt: boolean;
    kicker: string;
    title: string;
    subtitle?: string | null;
    children: ReactNode;
}

function Section({ id, alt, kicker, title, subtitle, children }: SectionProps) {
    return (
        <section id={id} className={`section${alt ? ' alt' : ''}`}>
            <header className="section-header reveal">
                <p className="kicker">{kicker}</p>
                <h2 className="section-title">{title}</h2>
                {subtitle && <p className="section-subtitle">{subtitle}</p>}
            </header>
            {children}
        </section>
    );
}

function joinParts(parts: (string | null | undefined)[]): string {
    return parts.filter(Boolean).join(' · ');
}

export function Hero({ hero, site, nextSectionId }: { hero: HeroData | null; site: SiteData; nextSectionId?: string }) {
    const heading = hero?.name ?? site.title;

    return (
        <section id="welcome-section" className={hero?.image ? 'has-image' : undefined}>
            <div className="hero-grid" />
            <div className="hero-shape shape-1" />
            <div className="hero-shape shape-2" />
            <div className="hero-shape shape-3" />
            <div className="hero-shape shape-4" />
            <div className="hero-shape shape-5" />

            <div className="hero-content">
                {hero?.greeting && <p className="eyebrow">{hero.greeting}</p>}
                {heading ? <h1>{heading}</h1> : <h1 className="hero-placeholder">Portfolio</h1>}
                {hero?.title && <p className="hero-subtitle">{hero.title}</p>}
                {hero?.introduction && <p className="hero-intro">{hero.introduction}</p>}
                {!hero && !heading && <p className="hero-subtitle">This portfolio is being set up. Please check back soon.</p>}
                {(hero?.primaryCta || hero?.secondaryCta) && (
                    <div className="hero-actions">
                        {hero.primaryCta && (
                            <a href={hero.primaryCta.url} className="btn btn-solid">
                                {hero.primaryCta.label}
                            </a>
                        )}
                        {hero.secondaryCta && (
                            <a href={hero.secondaryCta.url} className="btn btn-ghost">
                                {hero.secondaryCta.label}
                            </a>
                        )}
                    </div>
                )}
            </div>

            {nextSectionId && (
                <a href={`#${nextSectionId}`} className="scroll-hint" aria-label="Scroll down">
                    <span />
                </a>
            )}
        </section>
    );
}

export function About({ about, alt }: { about: AboutData; alt: boolean }) {
    return (
        <section id="about" className={`section${alt ? ' alt' : ''}`}>
            <div className="about-grid">
                <div className="about-visual reveal">
                    {about.image ? (
                        <img className="avatar avatar-image" src={about.image.url} alt={about.image.alt} loading="lazy" />
                    ) : (
                        <div className="avatar" aria-hidden="true">
                            {(about.name ?? '').charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <div className="about-content reveal">
                    <p className="kicker">About Me</p>
                    {about.heading && <h2 className="section-title">{about.heading}</h2>}
                    {about.paragraphs.map((paragraph, index) => (
                        <p key={index}>{paragraph}</p>
                    ))}
                    {about.stats.length > 0 && (
                        <div className="stats" style={{ gridTemplateColumns: `repeat(${about.stats.length <= 4 ? about.stats.length : 3}, 1fr)` }}>
                            {about.stats.map((stat) => (
                                <div key={stat.label}>
                                    <strong>{stat.value}</strong>
                                    <span>{stat.label}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}

export function Skills({ categories, alt }: { categories: PublicSkillCategory[]; alt: boolean }) {
    return (
        <Section id="skills" alt={alt} kicker="What I Work With" title="Skills">
            <div className="card-grid">
                {categories.map((category) => (
                    <article key={category.id} className="skill-card reveal">
                        <div className="icon-badge">
                            <Icon name={resolveIcon(category.icon, 'code')} />
                        </div>
                        <h3>{category.name}</h3>
                        {category.description && <p>{category.description}</p>}
                        <ul className="chips">
                            {category.skills.map((skill) => (
                                <li key={skill.id} title={skill.proficiency === null ? undefined : `${skill.name}: ${skill.proficiency}%`}>
                                    {skill.image && <img src={skill.image.url} alt="" loading="lazy" />}
                                    {skill.name}
                                    {skill.proficiency !== null && <small>{skill.proficiency}%</small>}
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </div>
        </Section>
    );
}

export function Projects({ projects, alt }: { projects: PublicProject[]; alt: boolean }) {
    return (
        <Section id="project-section" alt={alt} kicker="Selected Work" title="Projects">
            <Coverflow projects={projects} />
        </Section>
    );
}

export function Experience({ experiences, alt }: { experiences: PublicExperience[]; alt: boolean }) {
    return (
        <Section id="experience" alt={alt} kicker="My Journey" title="Experience">
            <ol className="timeline">
                {experiences.map((experience) => (
                    <li key={experience.id} className="reveal">
                        <span className="period">{formatPeriod(experience.startDate, experience.endDate, experience.isCurrent)}</span>
                        <h3>{experience.jobTitle}</h3>
                        <p className="org">{joinParts([experience.organisation, experience.employmentType, experience.location])}</p>
                        {experience.description && <p className="timeline-text">{experience.description}</p>}
                        {experience.responsibilities.length > 0 && (
                            <ul className="timeline-points">
                                {experience.responsibilities.map((item, index) => (
                                    <li key={index}>{item}</li>
                                ))}
                            </ul>
                        )}
                        {experience.technologies.length > 0 && (
                            <ul className="chips chips--start">
                                {experience.technologies.map((technology) => (
                                    <li key={technology}>{technology}</li>
                                ))}
                            </ul>
                        )}
                    </li>
                ))}
            </ol>
        </Section>
    );
}

export function Education({ education, alt }: { education: PublicEducation[]; alt: boolean }) {
    return (
        <Section id="education" alt={alt} kicker="Where I Studied" title="Education">
            <ol className="timeline">
                {education.map((item) => (
                    <li key={item.id} className="reveal">
                        <span className="period">{formatPeriod(item.startDate, item.endDate, item.isCurrent)}</span>
                        <h3>{joinParts([item.degree, item.fieldOfStudy])}</h3>
                        <p className="org">{joinParts([item.institution, item.location])}</p>
                        {item.grade && <p className="timeline-text">Grade: {item.grade}</p>}
                        {item.description && <p className="timeline-text">{item.description}</p>}
                    </li>
                ))}
            </ol>
        </Section>
    );
}

export function Certifications({ certifications, alt }: { certifications: PublicCertification[]; alt: boolean }) {
    return (
        <Section id="certifications" alt={alt} kicker="Credentials" title="Certifications">
            <div className="card-grid">
                {certifications.map((certification) => {
                    const link = certification.credentialUrl ?? certification.documentUrl;

                    return (
                        <article key={certification.id} className="skill-card info-card reveal">
                            {certification.image ? (
                                <img className="info-card-image" src={certification.image.url} alt={certification.image.alt} loading="lazy" />
                            ) : (
                                <div className="icon-badge">
                                    <Icon name="certificate" />
                                </div>
                            )}
                            <h3>{certification.name}</h3>
                            <p>{certification.issuer}</p>
                            <p className="info-card-meta">
                                {joinParts([
                                    certification.issueDate ? `Issued ${formatMonth(certification.issueDate)}` : null,
                                    certification.expiryDate ? `Expires ${formatMonth(certification.expiryDate)}` : null,
                                ])}
                            </p>
                            {certification.credentialId && <p className="info-card-meta">Credential ID: {certification.credentialId}</p>}
                            {link && (
                                <a className="info-card-link" href={link} target="_blank" rel="noopener noreferrer">
                                    View credential →
                                </a>
                            )}
                        </article>
                    );
                })}
            </div>
        </Section>
    );
}

export function Achievements({ achievements, alt }: { achievements: PublicAchievement[]; alt: boolean }) {
    return (
        <Section id="achievements" alt={alt} kicker="Milestones" title="Achievements">
            <div className="card-grid">
                {achievements.map((achievement) => (
                    <article key={achievement.id} className="skill-card info-card reveal">
                        {achievement.image ? (
                            <img className="info-card-image" src={achievement.image.url} alt={achievement.image.alt} loading="lazy" />
                        ) : (
                            <div className="icon-badge">
                                <Icon name="trophy" />
                            </div>
                        )}
                        <h3>{achievement.title}</h3>
                        {(achievement.issuer || achievement.date) && (
                            <p className="info-card-meta">{joinParts([achievement.issuer, formatMonth(achievement.date)])}</p>
                        )}
                        {achievement.description && <p>{achievement.description}</p>}
                    </article>
                ))}
            </div>
        </Section>
    );
}

export function Contact({ contact, socialLinks, alt }: { contact: ContactData; socialLinks: PublicSocialLink[]; alt: boolean }) {
    return (
        <Section id="contact" alt={alt} kicker="Get In Touch" title={contact.heading ?? 'Contact'} subtitle={contact.message}>
            <div className="contact-grid">
                {contact.email && (
                    <a href={`mailto:${contact.email}`} className="contact-card reveal">
                        <div className="icon-badge">
                            <Icon name="mail" />
                        </div>
                        <span className="contact-label">Email</span>
                        <span className="contact-value">{contact.email}</span>
                    </a>
                )}
                {contact.phone && (
                    <a href={`tel:${contact.phone.replace(/[^\d+]/g, '')}`} className="contact-card reveal">
                        <div className="icon-badge">
                            <Icon name="phone" />
                        </div>
                        <span className="contact-label">Phone</span>
                        <span className="contact-value">{contact.phone}</span>
                    </a>
                )}
                {contact.location && (
                    <div className="contact-card reveal">
                        <div className="icon-badge">
                            <Icon name="pin" />
                        </div>
                        <span className="contact-label">Location</span>
                        <span className="contact-value">{contact.location}</span>
                    </div>
                )}
                {socialLinks.map((link) => (
                    <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" className="contact-card reveal">
                        <div className="icon-badge">
                            <Icon name={resolveIcon(link.icon, 'link')} />
                        </div>
                        <span className="contact-label">{link.platform}</span>
                        <span className="contact-value">{displayUrl(link.url)}</span>
                    </a>
                ))}
            </div>
        </Section>
    );
}
