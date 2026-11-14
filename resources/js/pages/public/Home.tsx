import { Head } from '@inertiajs/react';
import { Fragment } from 'react';
import type { ReactNode } from 'react';
import GlobalBackground from '../../components/public/GlobalBackground';
import { useAccentColor, useActiveSection, useReveal } from '../../components/public/hooks';
import { About, Achievements, Certifications, Contact, Education, Experience, Hero, Projects, Skills } from '../../components/public/sections';
import { Footer, Navbar } from '../../components/public/SiteChrome';
import type { NavEntry } from '../../components/public/SiteChrome';
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
    SectionKey,
    SiteData,
} from '../../types';

interface Props {
    site: SiteData;
    hero: HeroData | null;
    /** Sections that have published content, in display order. */
    sections: SectionKey[];
    about: AboutData | null;
    skillCategories: PublicSkillCategory[];
    projects: PublicProject[];
    experiences: PublicExperience[];
    education: PublicEducation[];
    certifications: PublicCertification[];
    achievements: PublicAchievement[];
    contact: ContactData | null;
    socialLinks: PublicSocialLink[];
}

/** Element id and navigation label of each section. */
const SECTION_NAV: Record<SectionKey, NavEntry> = {
    about: { id: 'about', label: 'About' },
    skills: { id: 'skills', label: 'Skills' },
    projects: { id: 'project-section', label: 'Projects' },
    experience: { id: 'experience', label: 'Experience' },
    education: { id: 'education', label: 'Education' },
    certifications: { id: 'certifications', label: 'Certifications' },
    achievements: { id: 'achievements', label: 'Achievements' },
    contact: { id: 'contact', label: 'Contact' },
};

const HOME: NavEntry = { id: 'welcome-section', label: 'Home' };

export default function Home(props: Props) {
    const { site, hero, sections, socialLinks } = props;
    const navItems = [HOME, ...sections.map((key) => SECTION_NAV[key])];
    const activeId = useActiveSection(navItems.map((item) => item.id));

    useAccentColor(site.accentColor);
    useReveal(sections.join(','));

    /* Each renderer is only reached for sections the server listed as having content. */
    const renderers: Record<SectionKey, (alt: boolean) => ReactNode> = {
        about: (alt) => props.about && <About about={props.about} alt={alt} />,
        skills: (alt) => <Skills categories={props.skillCategories} alt={alt} />,
        projects: (alt) => <Projects projects={props.projects} alt={alt} />,
        experience: (alt) => <Experience experiences={props.experiences} alt={alt} />,
        education: (alt) => <Education education={props.education} alt={alt} />,
        certifications: (alt) => <Certifications certifications={props.certifications} alt={alt} />,
        achievements: (alt) => <Achievements achievements={props.achievements} alt={alt} />,
        contact: (alt) => props.contact && <Contact contact={props.contact} socialLinks={socialLinks} alt={alt} />,
    };

    return (
        <div className={`public-site${site.backgroundImage ? ' has-background' : ''}`}>
            <Head title={site.meta.title}>{site.meta.description && <meta head-key="description" name="description" content={site.meta.description} />}</Head>

            <GlobalBackground image={site.backgroundImage} />
            <Navbar site={site} items={navItems} activeId={activeId} />

            <main>
                <Hero hero={hero} site={site} nextSectionId={navItems[1]?.id} />
                {sections.map((key, index) => (
                    <Fragment key={key}>{renderers[key](index % 2 === 0)}</Fragment>
                ))}
            </main>

            <Footer site={site} socialLinks={socialLinks} email={props.contact?.email} />
        </div>
    );
}
