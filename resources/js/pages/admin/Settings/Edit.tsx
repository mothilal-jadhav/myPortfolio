import type { ReactNode } from 'react';
import type { FormApi, FormRecord, FormSection } from '../../../components/admin/fields';
import ResourceForm from '../../../components/admin/fields';
import Icon from '../../../components/admin/Icon';
import { AdminPage } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import type { MediaOption, SectionKey, SectionSetting } from '../../../types';
import type { PageWithLayout } from '../../../types/page';

interface Props {
    settings: FormRecord & { sections: SectionSetting[] };
    mediaLibrary: MediaOption[];
}

const SECTION_LABELS: Record<SectionKey, string> = {
    about: 'About',
    skills: 'Skills',
    projects: 'Projects',
    experience: 'Experience',
    education: 'Education',
    certifications: 'Certifications',
    achievements: 'Achievements',
    contact: 'Contact',
};

function SectionList({ form }: { form: FormApi }) {
    const sections = form.data.sections as SectionSetting[];

    function move(index: number, step: number) {
        const next = [...sections];
        [next[index], next[index + step]] = [next[index + step], next[index]];
        form.set('sections', next);
    }

    return (
        <ol className="sections-list">
            {sections.map((section, index) => (
                <li key={section.key}>
                    <span className="sections-list-position">{index + 1}</span>
                    <label className="admin-check admin-check--inline">
                        <input
                            type="checkbox"
                            checked={section.visible}
                            onChange={(event) =>
                                form.set(
                                    'sections',
                                    sections.map((item) => (item.key === section.key ? { ...item, visible: event.target.checked } : item)),
                                )
                            }
                        />
                        <span>{SECTION_LABELS[section.key]}</span>
                    </label>
                    <span className="sections-list-actions">
                        <button type="button" className="admin-icon-btn" aria-label={`Move ${SECTION_LABELS[section.key]} up`} disabled={index === 0} onClick={() => move(index, -1)}>
                            <Icon name="arrow-up" size={15} />
                        </button>
                        <button
                            type="button"
                            className="admin-icon-btn"
                            aria-label={`Move ${SECTION_LABELS[section.key]} down`}
                            disabled={index === sections.length - 1}
                            onClick={() => move(index, 1)}
                        >
                            <Icon name="arrow-down" size={15} />
                        </button>
                    </span>
                </li>
            ))}
        </ol>
    );
}

const Edit: PageWithLayout<Props> = ({ settings, mediaLibrary }) => {
    const sections: FormSection[] = [
        {
            title: 'Identity',
            fields: [
                { type: 'text', name: 'site_title', label: 'Site title', maxLength: 120, help: 'Shown in the navigation bar. Falls back to your profile name.' },
                { type: 'color', name: 'accent_color', label: 'Primary accent colour', help: 'Used for highlights across the public site.' },
                { type: 'media', name: 'logo', label: 'Logo', help: 'Optional. Replaces the default mark in the navigation bar.' },
            ],
        },
        {
            title: 'Search engines',
            fields: [
                { type: 'text', name: 'meta_title', label: 'Meta title', full: true, maxLength: 160 },
                { type: 'textarea', name: 'meta_description', label: 'Meta description', rows: 3, maxLength: 300 },
            ],
        },
        {
            title: 'Footer',
            fields: [
                { type: 'text', name: 'footer_text', label: 'Copyright text', full: true, maxLength: 200, help: 'Leave empty to show the current year and your name.' },
                { type: 'textarea', name: 'footer_description', label: 'Short description', rows: 2, maxLength: 300 },
            ],
        },
        {
            title: 'Sections',
            description: 'Choose which sections appear on the public page and in what order. A section with no published content stays hidden either way.',
            fields: [{ type: 'custom', name: 'sections', label: 'Order and visibility', initial: settings.sections, render: (form) => <SectionList form={form} /> }],
        },
    ];

    return (
        <AdminPage eyebrow="WORKSPACE / PREFERENCES" title="Settings" subtitle="Site-wide options for the public portfolio.">
            <ResourceForm
                action="/admin/settings"
                sections={sections}
                record={settings}
                defaults={{ accent_color: '#f5a524' }}
                mediaLibrary={mediaLibrary}
                submitLabel="Save settings"
                cancelUrl="/admin/dashboard"
            />
        </AdminPage>
    );
};

Edit.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Edit;
