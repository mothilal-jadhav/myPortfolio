import { Link, router } from '@inertiajs/react';
import type { CSSProperties } from 'react';
import { AddButton, AdminPage, Badge, confirmDelete, EmptyState, IconButton, Pagination, SearchForm } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import type { MediaItem, Paginated } from '../../../types';
import type { PageWithLayout } from '../../../types/page';

interface Project {
    id: number;
    title: string;
    slug: string;
    category: string | null;
    short_description: string;
    github_url: string | null;
    live_url: string | null;
    hue: number;
    is_featured: boolean;
    status: 'draft' | 'published';
    published_at: string | null;
    thumbnail: MediaItem | null;
    technologies: { id: number; name: string }[];
}

interface Filters {
    search: string;
    status: string;
    featured: boolean;
}

interface Props {
    projects: Paginated<Project>;
    filters: Filters;
    totals: { all: number; published: number; draft: number };
}

const BASE = '/admin/projects';

const Index: PageWithLayout<Props> = ({ projects, filters, totals }) => {
    const isFiltered = filters.search !== '' || filters.status !== '' || filters.featured;
    const isScheduled = (project: Project) =>
        project.status === 'published' && project.published_at !== null && new Date(project.published_at) > new Date();

    const applyFilter = (patch: Partial<Filters>) => {
        const next = { ...filters, ...patch };

        router.get(
            BASE,
            {
                ...(next.search ? { search: next.search } : {}),
                ...(next.status ? { status: next.status } : {}),
                ...(next.featured ? { featured: 1 } : {}),
            },
            { preserveState: true, preserveScroll: true, replace: true },
        );
    };

    const move = (project: Project, direction: 'up' | 'down') =>
        router.patch(`${BASE}/${project.id}/move`, { direction }, { preserveScroll: true });

    return (
        <AdminPage
            eyebrow="WORKSPACE / CONTENT"
            title="Projects"
            subtitle="Manage the projects displayed on your portfolio."
            actions={<AddButton href={`${BASE}/create`}>Add project</AddButton>}
        >
            <section className="projects-toolbar">
                <div>
                    <span className="projects-count">{totals.all.toString().padStart(2, '0')}</span>
                    <span>
                        Projects · {totals.published} published · {totals.draft} draft
                    </span>
                </div>
                <SearchForm
                    action={BASE}
                    initial={filters.search}
                    placeholder="Search projects"
                    extra={() => ({ ...(filters.status ? { status: filters.status } : {}), ...(filters.featured ? { featured: 1 } : {}) })}
                >
                    <select className="admin-input admin-input--compact" aria-label="Filter by status" value={filters.status} onChange={(event) => applyFilter({ status: event.target.value })}>
                        <option value="">All statuses</option>
                        <option value="published">Published</option>
                        <option value="draft">Draft</option>
                    </select>
                    <label className="admin-check admin-check--inline">
                        <input type="checkbox" checked={filters.featured} onChange={(event) => applyFilter({ featured: event.target.checked })} />
                        <span>Featured only</span>
                    </label>
                </SearchForm>
            </section>

            {projects.data.length === 0 ? (
                isFiltered ? (
                    <EmptyState title="No projects match these filters" text="Try a different search term or clear the filters." actionHref={BASE} actionLabel="Clear filters" />
                ) : (
                    <EmptyState title="No projects yet" text="Add your first project to start building your portfolio." actionHref={`${BASE}/create`} actionLabel="Create your first project" />
                )
            ) : (
                <section className="projects-grid">
                    {projects.data.map((project, index) => (
                        <article className="project-admin-card" key={project.id} style={{ '--project-hue': project.hue } as CSSProperties}>
                            <div className="project-card-accent" />

                            <div className="project-card-top">
                                <span className="project-card-badges">
                                    {project.category && <span className="project-tag">{project.category}</span>}
                                    <Badge tone={project.status === 'published' ? 'live' : 'draft'}>
                                        {isScheduled(project) ? 'Scheduled' : project.status === 'published' ? 'Published' : 'Draft'}
                                    </Badge>
                                    {project.is_featured && <Badge tone="accent">Featured</Badge>}
                                </span>
                                <span className="project-id">#{project.id.toString().padStart(3, '0')}</span>
                            </div>

                            <div className="project-card-main">
                                {project.thumbnail && <img className="project-card-thumb" src={project.thumbnail.url} alt="" loading="lazy" />}
                                <div>
                                    <h2>
                                        <Link href={`${BASE}/${project.id}/edit`}>{project.title}</Link>
                                    </h2>
                                    <p className="project-card-description">{project.short_description}</p>
                                </div>
                            </div>

                            {project.technologies.length > 0 && (
                                <ul className="project-card-tech">
                                    {project.technologies.map((technology) => (
                                        <li key={technology.id}>{technology.name}</li>
                                    ))}
                                </ul>
                            )}

                            <div className="project-card-footer">
                                <span className="project-card-links">
                                    {project.github_url && (
                                        <a href={project.github_url} target="_blank" rel="noopener noreferrer">
                                            GitHub ↗
                                        </a>
                                    )}
                                    {project.live_url && (
                                        <a href={project.live_url} target="_blank" rel="noopener noreferrer">
                                            Live ↗
                                        </a>
                                    )}
                                </span>
                                <span className="project-card-actions">
                                    {!isFiltered && (
                                        <>
                                            <IconButton icon="arrow-up" label="Move earlier" onClick={() => move(project, 'up')} disabled={projects.current_page === 1 && index === 0} />
                                            <IconButton
                                                icon="arrow-down"
                                                label="Move later"
                                                onClick={() => move(project, 'down')}
                                                disabled={projects.current_page === projects.last_page && index === projects.data.length - 1}
                                            />
                                        </>
                                    )}
                                    <IconButton icon="external" label={`Preview ${project.title}`} href={`${BASE}/${project.id}/preview`} external />
                                    <IconButton
                                        icon={project.status === 'published' ? 'eye-off' : 'eye'}
                                        label={project.status === 'published' ? 'Unpublish' : 'Publish'}
                                        onClick={() => router.patch(`${BASE}/${project.id}/toggle`, {}, { preserveScroll: true })}
                                    />
                                    <IconButton icon="edit" label={`Edit ${project.title}`} href={`${BASE}/${project.id}/edit`} />
                                    <IconButton icon="trash" label={`Delete ${project.title}`} danger onClick={() => confirmDelete(`${BASE}/${project.id}`, project.title)} />
                                </span>
                            </div>
                        </article>
                    ))}
                </section>
            )}
            <Pagination page={projects} />
        </AdminPage>
    );
};

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
