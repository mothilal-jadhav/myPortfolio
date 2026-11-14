import type { ReactNode } from 'react';
import type { FormRecord, FormSection } from '../../../components/admin/fields';
import ResourceForm from '../../../components/admin/fields';
import { AdminPage } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import type { MediaOption } from '../../../types';
import type { PageWithLayout } from '../../../types/page';

interface Props {
    profile: FormRecord;
    mediaLibrary: MediaOption[];
}

const LINK_HELP = 'A full URL, or a section anchor such as #project-section, #about or #contact.';

const sections: FormSection[] = [
    {
        title: 'Hero',
        description: 'The first screen visitors see.',
        fields: [
            { type: 'text', name: 'name', label: 'Name', maxLength: 120 },
            { type: 'text', name: 'title', label: 'Professional title', maxLength: 160, placeholder: 'e.g. Full-stack developer' },
            { type: 'text', name: 'hero_greeting', label: 'Greeting above your name', maxLength: 80, placeholder: "e.g. Hello, I'm" },
            { type: 'textarea', name: 'introduction', label: 'Short introduction', rows: 3, maxLength: 500 },
            { type: 'text', name: 'primary_cta_label', label: 'Primary button label', maxLength: 60 },
            { type: 'text', name: 'primary_cta_url', label: 'Primary button link', help: LINK_HELP },
            { type: 'text', name: 'secondary_cta_label', label: 'Secondary button label', maxLength: 60 },
            { type: 'text', name: 'secondary_cta_url', label: 'Secondary button link', help: LINK_HELP },
            { type: 'media', name: 'hero_image', label: 'Hero background image', help: 'Optional. Shown dimmed behind the hero text.' },
        ],
    },
    {
        title: 'About',
        description: 'The About section appears once a biography is entered.',
        fields: [
            { type: 'text', name: 'about_heading', label: 'Section heading', full: true, maxLength: 160 },
            { type: 'textarea', name: 'biography', label: 'Biography', rows: 6, help: 'Leave a blank line between paragraphs.' },
            { type: 'textarea', name: 'about_extra', label: 'Additional paragraphs', rows: 4 },
            { type: 'media', name: 'profile_image', label: 'Profile image' },
            {
                type: 'checkbox',
                name: 'show_calculated_stats',
                label: 'Show statistics calculated from my content',
                help: 'Counts of published projects, skills and certifications. Zero counts are left out.',
                full: true,
            },
            { type: 'pairs', name: 'stats', label: 'Custom statistics', addLabel: 'Add statistic', help: 'Optional figures of your own, for example years of experience.' },
        ],
    },
    {
        title: 'Contact',
        description: 'Only the details you fill in are shown publicly.',
        fields: [
            { type: 'text', name: 'contact_heading', label: 'Section heading', maxLength: 160 },
            { type: 'email', name: 'email', label: 'Email address' },
            { type: 'textarea', name: 'contact_message', label: 'Short message', rows: 3, maxLength: 500 },
            { type: 'text', name: 'phone', label: 'Phone number', maxLength: 40 },
            { type: 'text', name: 'location', label: 'Location', maxLength: 160 },
        ],
    },
];

const Edit: PageWithLayout<Props> = ({ profile, mediaLibrary }) => {
    return (
        <AdminPage eyebrow="WORKSPACE / CONTENT" title="Profile" subtitle="These details drive the Hero, About and Contact sections of your portfolio.">
            <ResourceForm
                action="/admin/profile"
                sections={sections}
                record={profile}
                mediaLibrary={mediaLibrary}
                submitLabel="Save profile"
                cancelUrl="/admin/dashboard"
            />
        </AdminPage>
    );
};

Edit.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Edit;
