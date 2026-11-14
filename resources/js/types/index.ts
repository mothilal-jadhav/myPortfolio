export interface MediaItem {
    id: number;
    url: string;
    original_name: string;
    mime_type: string;
    size: number;
    width: number | null;
    height: number | null;
    alt_text: string | null;
    is_image: boolean;
    created_at: string;
}

export interface MediaOption {
    id: number;
    url: string;
    name: string;
}

export interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

export interface Paginated<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
    from: number | null;
    to: number | null;
    links: PaginationLink[];
}

export interface SharedProps {
    auth: { user: { name: string; email: string } | null };
    flash: { success: string | null; error: string | null };
    [key: string]: unknown;
}

export interface SectionSetting {
    key: SectionKey;
    visible: boolean;
}

export type SectionKey =
    | 'about'
    | 'skills'
    | 'projects'
    | 'experience'
    | 'education'
    | 'certifications'
    | 'achievements'
    | 'contact';

/* ---------- Public portfolio ---------- */

export interface PublicImage {
    url: string;
    alt: string;
    width: number | null;
    height: number | null;
}

export interface CallToAction {
    label: string;
    url: string;
}

export interface SiteData {
    title: string | null;
    logo: PublicImage | null;
    accentColor: string | null;
    footerText: string | null;
    footerDescription: string | null;
    meta: { title: string; description: string | null };
}

export interface HeroData {
    greeting: string | null;
    name: string | null;
    title: string | null;
    introduction: string | null;
    image: PublicImage | null;
    primaryCta: CallToAction | null;
    secondaryCta: CallToAction | null;
}

export interface StatItem {
    label: string;
    value: string;
}

export interface AboutData {
    heading: string | null;
    paragraphs: string[];
    image: PublicImage | null;
    name: string | null;
    stats: StatItem[];
}

export interface PublicSkill {
    id: number;
    name: string;
    proficiency: number | null;
    image: PublicImage | null;
}

export interface PublicSkillCategory {
    id: number;
    name: string;
    description: string | null;
    icon: string | null;
    skills: PublicSkill[];
}

export interface PublicProject {
    id: number;
    title: string;
    slug: string;
    category: string | null;
    description: string;
    thumbnail: PublicImage | null;
    technologies: string[];
    githubUrl: string | null;
    liveUrl: string | null;
    featured: boolean;
    hue: number;
    publishedAt: string | null;
}

export interface PublicProjectDetail extends PublicProject {
    details: string | null;
    gallery: PublicImage[];
}

export interface PublicExperience {
    id: number;
    organisation: string;
    jobTitle: string;
    employmentType: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    description: string | null;
    responsibilities: string[];
    technologies: string[];
}

export interface PublicEducation {
    id: number;
    institution: string;
    degree: string;
    fieldOfStudy: string | null;
    location: string | null;
    startDate: string;
    endDate: string | null;
    isCurrent: boolean;
    grade: string | null;
    description: string | null;
}

export interface PublicCertification {
    id: number;
    name: string;
    issuer: string;
    issueDate: string | null;
    expiryDate: string | null;
    credentialId: string | null;
    credentialUrl: string | null;
    image: PublicImage | null;
    documentUrl: string | null;
}

export interface PublicAchievement {
    id: number;
    title: string;
    description: string | null;
    issuer: string | null;
    date: string | null;
    image: PublicImage | null;
}

export interface PublicSocialLink {
    id: number;
    platform: string;
    url: string;
    icon: string | null;
}

export interface ContactData {
    heading: string | null;
    message: string | null;
    email: string | null;
    phone: string | null;
    location: string | null;
}
