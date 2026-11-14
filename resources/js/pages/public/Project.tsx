import { Head, Link } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { useAccentColor } from '../../components/public/hooks';
import Icon from '../../components/public/Icon';
import { Footer, Navbar } from '../../components/public/SiteChrome';
import { formatDate, initials } from '../../lib/format';
import type { PublicProjectDetail, PublicSocialLink, SiteData } from '../../types';

interface Props {
    site: SiteData;
    project: PublicProjectDetail;
    socialLinks: PublicSocialLink[];
    /** Present only when an administrator previews the project. */
    preview: { status: string; editUrl: string } | null;
}

export default function Project({ site, project, socialLinks, preview }: Props) {
    useAccentColor(site.accentColor);

    const paragraphs = (project.details ?? '')
        .split(/\n{2,}/)
        .map((paragraph) => paragraph.trim())
        .filter(Boolean);

    return (
        <>
            <Head title={`${project.title} · ${site.meta.title}`}>
                <meta head-key="description" name="description" content={project.description} />
            </Head>

            <Navbar site={site} items={[{ id: 'welcome-section', label: 'Home' }, { id: 'project-section', label: 'Projects' }]} anchorBase="/" />

            <main className="project-page" style={{ '--hue': project.hue } as CSSProperties}>
                {preview && (
                    <div className="preview-banner" role="status">
                        <span>
                            Preview — this project is <strong>{preview.status === 'published' ? 'published' : 'a draft and not visible to visitors'}</strong>.
                        </span>
                        <Link href={preview.editUrl}>Back to editing</Link>
                    </div>
                )}

                <header className="project-hero">
                    <Link href="/#project-section" className="project-back">
                        ← All projects
                    </Link>
                    {project.category && <p className="kicker">{project.category}</p>}
                    <h1 className="section-title">{project.title}</h1>
                    <p className="project-lead">{project.description}</p>

                    {project.technologies.length > 0 && (
                        <ul className="chips">
                            {project.technologies.map((technology) => (
                                <li key={technology}>{technology}</li>
                            ))}
                        </ul>
                    )}

                    {(project.liveUrl || project.githubUrl) && (
                        <div className="hero-actions">
                            {project.liveUrl && (
                                <a href={project.liveUrl} className="btn btn-solid" target="_blank" rel="noopener noreferrer">
                                    Live site
                                </a>
                            )}
                            {project.githubUrl && (
                                <a href={project.githubUrl} className="btn btn-ghost btn-with-icon" target="_blank" rel="noopener noreferrer">
                                    <Icon name="github" /> Source code
                                </a>
                            )}
                        </div>
                    )}
                    {project.publishedAt && <p className="project-date">Published {formatDate(project.publishedAt)}</p>}
                </header>

                <div className="project-cover">
                    {project.thumbnail ? (
                        <img src={project.thumbnail.url} alt={project.thumbnail.alt} />
                    ) : (
                        <div className="project-art" aria-hidden="true">
                            <span>{initials(project.title)}</span>
                        </div>
                    )}
                </div>

                {paragraphs.length > 0 && (
                    <section className="project-details">
                        {paragraphs.map((paragraph, index) => (
                            <p key={index}>{paragraph}</p>
                        ))}
                    </section>
                )}

                {project.gallery.length > 0 && (
                    <section className="project-gallery" aria-label="Project gallery">
                        {project.gallery.map((image) => (
                            <a key={image.url} href={image.url} target="_blank" rel="noopener noreferrer">
                                <img src={image.url} alt={image.alt} loading="lazy" />
                            </a>
                        ))}
                    </section>
                )}
            </main>

            <Footer site={site} socialLinks={socialLinks} />
        </>
    );
}
