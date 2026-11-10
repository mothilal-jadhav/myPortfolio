
import { Link } from "@inertiajs/react";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

interface Project {
    id: number;
    title: string;
    tag: string;
    description: string;
    github_url: string;
    hue: number;
}

interface Props {
    projects: Project[];
}

const Index: PageWithLayout<Props> = ({ projects }) => {
    return (
        <main className="admin-projects-page">
            <header className="projects-header">
                <div>
                    <p className="projects-eyebrow">WORKSPACE / CONTENT</p>
                    <h1>Projects</h1>
                    <p className="projects-subtitle">
                        Manage the projects displayed on your portfolio.
                    </p>
                </div>

                <Link
                    href="/admin/projects/create"
                    className="projects-add-button"
                >
                    <span>+</span>
                    Add project
                </Link>
            </header>

            <section className="projects-toolbar">
                <div>
                    <span className="projects-count">
                        {projects.length.toString().padStart(2, "0")}
                    </span>
                    <span>Projects in your portfolio</span>
                </div>
            </section>

            {projects.length === 0 ? (
                <section className="projects-empty">
                    <div className="projects-empty-icon">+</div>
                    <h2>No projects yet</h2>
                    <p>
                        Add your first project to start building your portfolio.
                    </p>
                    <Link
                        href="/admin/projects/create"
                        className="projects-empty-link"
                    >
                        Create your first project
                    </Link>
                </section>
            ) : (
                <section className="projects-grid">
                    {projects.map((project) => (
                        <article
                            className="project-admin-card"
                            key={project.id}
                            style={{
                                "--project-hue": project.hue,
                            } as React.CSSProperties}
                        >
                            <div className="project-card-accent" />

                            <div className="project-card-top">
                                <span className="project-tag">
                                    {project.tag}
                                </span>
                                <span className="project-id">
                                    #{project.id.toString().padStart(3, "0")}
                                </span>
                            </div>

                            <h2>{project.title}</h2>

                            <p className="project-card-description">
                                {project.description}
                            </p>

                            <div className="project-card-footer">
                                <span>Hue: {project.hue}°</span>
                                <a
                                    href={project.github_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    GitHub ↗
                                </a>
                            </div>
                        </article>
                    ))}
                </section>
            )}
        </main>
    );
};

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
