import type { FormRecord, FormSection } from '../../../components/admin/fields';
import ResourceForm from '../../../components/admin/fields';
import type { MediaOption } from '../../../types';

export interface ProjectFormOptions {
    technologyOptions: string[];
    categoryOptions: string[];
    mediaLibrary: MediaOption[];
}

interface Props extends ProjectFormOptions {
    project: FormRecord | null;
}

/** Fields shared by the "Add project" and "Edit project" pages. */
export default function ProjectForm({ project, technologyOptions, categoryOptions, mediaLibrary }: Props) {
    const sections: FormSection[] = [
        {
            title: 'Basics',
            description: 'What the project is and how it is summarised on the portfolio.',
            fields: [
                { type: 'text', name: 'title', label: 'Project title', required: true, maxLength: 150 },
                { type: 'text', name: 'category', label: 'Category', maxLength: 80, suggestions: categoryOptions, placeholder: 'e.g. Web application' },
                {
                    type: 'text',
                    name: 'slug',
                    label: 'Slug',
                    full: true,
                    maxLength: 170,
                    placeholder: 'generated-from-the-title',
                    help: 'Used in the project URL. Leave empty to generate it from the title.',
                },
                { type: 'textarea', name: 'short_description', label: 'Short description', required: true, rows: 3, maxLength: 500, help: 'Shown on the project card.' },
                { type: 'textarea', name: 'details', label: 'Detailed description', rows: 9, help: 'Shown on the project page. Leave a blank line between paragraphs.' },
                { type: 'tags', name: 'technologies', label: 'Technologies used', suggestions: technologyOptions, placeholder: 'Type a technology and press Enter' },
            ],
        },
        {
            title: 'Links',
            fields: [
                { type: 'url', name: 'github_url', label: 'GitHub repository URL', placeholder: 'https://github.com/…' },
                { type: 'url', name: 'live_url', label: 'Live deployment URL', placeholder: 'https://…' },
            ],
        },
        {
            title: 'Images',
            description: 'JPG, PNG, WebP or GIF, up to 4 MB each.',
            fields: [
                { type: 'media', name: 'thumbnail', label: 'Thumbnail', help: 'Shown on the project card. Without one, the card shows the project initials on the hue below.' },
                { type: 'range', name: 'hue', label: 'Card hue', min: 0, max: 360, unit: '°', full: true },
                { type: 'gallery', name: 'gallery', label: 'Gallery' },
            ],
        },
        {
            title: 'Publishing',
            description: 'Drafts are only visible to you. Use Preview to check a draft before publishing.',
            fields: [
                {
                    type: 'select',
                    name: 'status',
                    label: 'Status',
                    options: [
                        { value: 'draft', label: 'Draft' },
                        { value: 'published', label: 'Published' },
                    ],
                },
                { type: 'datetime-local', name: 'published_at', label: 'Publication date', help: 'Leave empty to use the moment you publish. A future date schedules the project.' },
                { type: 'checkbox', name: 'is_featured', label: 'Featured project', help: 'Featured projects are shown first.' },
                { type: 'number', name: 'sort_order', label: 'Display order', min: 0, help: 'Lower numbers appear first. Leave empty to place it last.' },
            ],
        },
    ];

    return (
        <ResourceForm
            action={project ? `/admin/projects/${project.id}` : '/admin/projects'}
            sections={sections}
            record={project}
            defaults={{ hue: 32, status: 'draft' }}
            mediaLibrary={mediaLibrary}
            submitLabel={project ? 'Save changes' : 'Create project'}
            cancelUrl="/admin/projects"
            extraActions={
                project ? (
                    <a href={`/admin/projects/${project.id}/preview`} className="admin-btn" target="_blank" rel="noopener noreferrer">
                        Preview
                    </a>
                ) : undefined
            }
        />
    );
}
