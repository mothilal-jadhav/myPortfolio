import { Link } from '@inertiajs/react';
import type { ReactNode } from 'react';
import Icon from '../../components/admin/Icon';
import type { AdminIconName } from '../../components/admin/Icon';
import AdminLayout from '../../layouts/AdminLayout';
import { timeAgo } from '../../lib/format';
import type { PageWithLayout } from '../../types/page';

interface Stats {
    projects: number;
    publishedProjects: number;
    draftProjects: number;
    skills: number;
    experiences: number;
    education: number;
    certifications: number;
    achievements: number;
}

interface RecentUpdate {
    type: string;
    title: string;
    url: string;
    updatedAt: string;
    created: boolean;
}

interface Props {
    stats: Stats;
    recent: RecentUpdate[];
}

interface Metric {
    label: string;
    value: number;
    note: string;
    icon: AdminIconName;
    href: string;
}

const quickActions: { label: string; note: string; icon: AdminIconName; href: string }[] = [
    { label: 'Add a project', note: 'Showcase something you have built', icon: 'folder', href: '/admin/projects/create' },
    { label: 'Add a skill', note: 'Highlight your technical stack', icon: 'layers', href: '/admin/skills/create' },
    { label: 'Add experience', note: 'Keep your career history current', icon: 'briefcase', href: '/admin/experiences/create' },
    { label: 'Update your profile', note: 'Name, biography and contact details', icon: 'user', href: '/admin/profile' },
];

const Dashboard: PageWithLayout<Props> = ({ stats, recent }) => {
    const metrics: Metric[] = [
        { label: 'Total projects', value: stats.projects, note: 'Drafts and published', icon: 'folder', href: '/admin/projects' },
        { label: 'Published projects', value: stats.publishedProjects, note: 'Visible on your portfolio', icon: 'eye', href: '/admin/projects?status=published' },
        { label: 'Draft projects', value: stats.draftProjects, note: 'Not visible to visitors', icon: 'edit', href: '/admin/projects?status=draft' },
        { label: 'Skills listed', value: stats.skills, note: 'Technologies and capabilities', icon: 'layers', href: '/admin/skills' },
        { label: 'Experience entries', value: stats.experiences, note: 'Roles and work history', icon: 'briefcase', href: '/admin/experiences' },
        { label: 'Education records', value: stats.education, note: 'Degrees and courses', icon: 'graduation', href: '/admin/education' },
        { label: 'Certifications', value: stats.certifications, note: 'Credentials you have earned', icon: 'award', href: '/admin/certifications' },
        { label: 'Achievements', value: stats.achievements, note: 'Awards and recognition', icon: 'trophy', href: '/admin/achievements' },
    ];

    return (
        <div className="admin-content">
            <section className="dashboard-heading">
                <div>
                    <p className="dashboard-eyebrow">OVERVIEW</p>
                    <h1>Dashboard</h1>
                    <p className="dashboard-subtitle">Manage portfolio content from one place.</p>
                </div>
                <div className="heading-date">
                    <span className="date-dot" />
                    Your workspace
                </div>
            </section>

            <section className="dashboard-section">
                <div className="dashboard-section-heading">
                    <div>
                        <h2>Content overview</h2>
                        <p>A snapshot of the information in your portfolio.</p>
                    </div>
                    <span className="section-period">ALL TIME</span>
                </div>

                <div className="dashboard-stats dashboard-stats--wide">
                    {metrics.map((metric) => (
                        <Link href={metric.href} className="stat-card" key={metric.label}>
                            <div className="stat-card-top">
                                <span className="stat-icon">
                                    <Icon name={metric.icon} size={19} />
                                </span>
                                <span className="stat-context">
                                    <Icon name="arrow-up-right" size={14} />
                                </span>
                            </div>
                            <p className="stat-value">{metric.value.toString().padStart(2, '0')}</p>
                            <h3>{metric.label}</h3>
                            <p className="stat-note">{metric.note}</p>
                        </Link>
                    ))}
                </div>
            </section>

            <section className="dashboard-lower-grid">
                <article className="dashboard-panel activity-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Recent updates</h2>
                            <p>The content you changed most recently.</p>
                        </div>
                        <span className="panel-heading-icon">
                            <Icon name="clock" size={18} />
                        </span>
                    </div>

                    {recent.length === 0 ? (
                        <div className="empty-activity">
                            <span className="empty-activity-icon">
                                <Icon name="clock" size={23} />
                            </span>
                            <strong>No activity yet</strong>
                            <p>When you start updating your portfolio, your recent activity will appear here.</p>
                        </div>
                    ) : (
                        <ul className="recent-list">
                            {recent.map((item) => (
                                <li key={item.url}>
                                    <Link href={item.url}>
                                        <span className="recent-type">{item.type}</span>
                                        <strong>{item.title}</strong>
                                        <small>
                                            {item.created ? 'Added' : 'Updated'} {timeAgo(item.updatedAt)}
                                        </small>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    )}
                </article>

                <article className="dashboard-panel quick-panel">
                    <div className="panel-heading">
                        <div>
                            <h2>Quick actions</h2>
                        </div>
                        <span className="panel-heading-icon">
                            <Icon name="arrow-up-right" size={18} />
                        </span>
                    </div>

                    <div className="quick-action-list">
                        {quickActions.map((action) => (
                            <Link href={action.href} className="quick-action-item" key={action.href}>
                                <span className="quick-action-icon">
                                    <Icon name={action.icon} size={18} />
                                </span>
                                <span className="quick-action-copy">
                                    <strong>{action.label}</strong>
                                    <small>{action.note}</small>
                                </span>
                                <span className="quick-action-plus">
                                    <Icon name="plus" size={17} />
                                </span>
                            </Link>
                        ))}
                    </div>
                </article>
            </section>
        </div>
    );
};

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
