import AdminLayout from '../../layouts/AdminLayout';
import type { PageWithLayout } from '../../types/page';
import type { ReactNode } from 'react';

type IconName = 'grid' | 'folder' | 'layers' | 'briefcase' | 'graduation' | 'settings' | 'external' | 'arrow-up-right' | 'plus' | 'clock' | 'check' | 'sparkles';

const iconPaths: Record<IconName, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z',
    layers: 'm12 3 9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
    briefcase: 'M3 8h18v12H3z M8 8V5h8v3 M3 13h18 M10 13v2h4v-2',
    graduation: 'm2 9 10-5 10 5-10 5L2 9z M6 11v5c3.5 2.5 8.5 2.5 12 0v-5 M22 9v6',
    settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.8.1l-.2.1h-3.6l-.1-.2a1.7 1.7 0 0 0-1.6-1l-.2.1-3.1-1.8.1-.2a1.7 1.7 0 0 0-.1-1.8l-.1-.2v-3.6l.2-.1a1.7 1.7 0 0 0 1-1.6l-.1-.2 1.8-3.1.2.1a1.7 1.7 0 0 0 1.8-.1l.2-.1h3.6l.1.2a1.7 1.7 0 0 0 1.6 1l.2-.1 3.1 1.8-.1.2a1.7 1.7 0 0 0 .1 1.8l.1.2v3.6z',
    external: 'M14 3h7v7 M21 3l-9 9 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
    'arrow-up-right': 'M7 17 17 7 M7 7h10v10',
    plus: 'M12 5v14 M5 12h14',
    clock: 'M12 8v4l3 2 M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z',
    check: 'm5 12 4 4L19 6',
    sparkles: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z M19 14l1.1 2.9L23 18l-2.9 1.1L19 22l-1.1-2.9L15 18l2.9-1.1L19 14z',
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    return (
        <svg
            aria-hidden="true"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d={iconPaths[name]} />
        </svg>
    );
}

const metrics = [
    {
        label: 'Total projects',
        value: '00',
        note: 'Published on your portfolio',
        icon: 'folder' as const,
        trend: 'Content overview',
    },
    {
        label: 'Skills listed',
        value: '00',
        note: 'Technologies and capabilities',
        icon: 'layers' as const,
        trend: 'Content overview',
    },
    {
        label: 'Experience entries',
        value: '00',
        note: 'Roles and work history',
        icon: 'briefcase' as const,
        trend: 'Content overview',
    },
];

const Dashboard: PageWithLayout = () => {
    return (
        <>
            <div className="admin-content">
                    <section className="dashboard-heading">
                        <div>
                            <p className="dashboard-eyebrow">OVERVIEW</p>
                            <h1>Dashboard</h1>
                            <p className="dashboard-subtitle">
                                Manage portfolio content from one place.
                            </p>
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

                        <div className="dashboard-stats">
                            {metrics.map((metric) => (
                                <article className="stat-card" key={metric.label}>
                                    <div className="stat-card-top">
                                        <span className="stat-icon">
                                            <Icon name={metric.icon} size={19} />
                                        </span>
                                        <span className="stat-context">{metric.trend}</span>
                                    </div>
                                    <p className="stat-value">{metric.value}</p>
                                    <h3>{metric.label}</h3>
                                    <p className="stat-note">{metric.note}</p>
                                </article>
                            ))}
                        </div>
                    </section>

                    <section className="dashboard-lower-grid">
                        <article className="dashboard-panel activity-panel">
                            <div className="panel-heading">
                                <div>
                                    <h2>Recent activity</h2>
                                </div>
                                <span className="panel-heading-icon">
                                    <Icon name="clock" size={18} />
                                </span>
                            </div>

                            <div className="empty-activity">
                                <span className="empty-activity-icon">
                                    <Icon name="clock" size={23} />
                                </span>
                                <strong>No activity yet</strong>
                                <p>
                                    When you start updating your portfolio, your recent
                                    activity will appear here.
                                </p>
                            </div>
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
                                <div className="quick-action-item">
                                    <span className="quick-action-icon">
                                        <Icon name="folder" size={18} />
                                    </span>
                                    <span className="quick-action-copy">
                                        <strong>Add a project</strong>
                                        <small>Showcase something you have built</small>
                                    </span>
                                    <span className="quick-action-plus">
                                        <Icon name="plus" size={17} />
                                    </span>
                                </div>
                                <div className="quick-action-item">
                                    <span className="quick-action-icon">
                                        <Icon name="layers" size={18} />
                                    </span>
                                    <span className="quick-action-copy">
                                        <strong>Update your skills</strong>
                                        <small>Highlight your technical stack</small>
                                    </span>
                                    <span className="quick-action-plus">
                                        <Icon name="plus" size={17} />
                                    </span>
                                </div>
                                <div className="quick-action-item">
                                    <span className="quick-action-icon">
                                        <Icon name="briefcase" size={18} />
                                    </span>
                                    <span className="quick-action-copy">
                                        <strong>Add experience</strong>
                                        <small>Keep your career history current</small>
                                    </span>
                                    <span className="quick-action-plus">
                                        <Icon name="plus" size={17} />
                                    </span>
                                </div>
                            </div>
                            <p className="quick-actions-note">
                                <span /> Actions will be enabled as we build each section.
                            </p>
                        </article>
                    </section>

                    
                </div>
        </>
    );
}

Dashboard.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Dashboard;
