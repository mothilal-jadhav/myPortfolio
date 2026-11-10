import { Link, usePage } from '@inertiajs/react';
import type { ReactNode } from 'react';

type IconName = 'grid' | 'folder' | 'layers' | 'briefcase' | 'graduation' | 'settings' | 'sparkles' | 'external';

const iconPaths: Record<IconName, string> = {
    grid: 'M3 3h7v7H3z M14 3h7v7h-7z M14 14h7v7h-7z M3 14h7v7H3z',
    folder: 'M3 7.5A1.5 1.5 0 0 1 4.5 6H10l2 2h7.5A1.5 1.5 0 0 1 21 9.5v8a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z',
    layers: 'm12 3 9 5-9 5-9-5 9-5z M3 12l9 5 9-5 M3 16l9 5 9-5',
    briefcase: 'M3 8h18v12H3z M8 8V5h8v3 M3 13h18 M10 13v2h4v-2',
    graduation: 'm2 9 10-5 10 5-10 5L2 9z M6 11v5c3.5 2.5 8.5 2.5 12 0v-5 M22 9v6',
    settings: 'M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7z M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 3.1-.2-.1a1.7 1.7 0 0 0-1.8.1l-.2.1h-3.6l-.1-.2a1.7 1.7 0 0 0-1.6-1l-.2.1-3.1-1.8.1-.2a1.7 1.7 0 0 0-.1-1.8l-.1-.2v-3.6l.2-.1a1.7 1.7 0 0 0 1-1.6l-.1-.2 1.8-3.1.2.1a1.7 1.7 0 0 0 1.8-.1l.2-.1h3.6l.1.2a1.7 1.7 0 0 0 1.6 1l.2-.1 3.1 1.8-.1.2a1.7 1.7 0 0 0 .1 1.8l.1.2v3.6z',
    sparkles: 'm12 3 1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8L12 3z',
    external: 'M14 3h7v7 M21 3l-9 9 M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6',
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
    return (
        <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
            <path d={iconPaths[name]} />
        </svg>
    );
}

const navigation = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' as const },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url } = usePage();
    const currentPath = url.split('?')[0];
    const currentItem = navigation.find((item) => currentPath === item.href) ?? navigation[0];

    return (
        <div className="admin-dashboard admin-shell">
            <aside className="admin-sidebar">
                <Link href="/admin/dashboard" className="admin-brand">
                    <span className="admin-brand-mark"><Icon name="sparkles" size={21} /></span>
                    <span><strong>MY PORTFOLIO</strong><small>CONTENT STUDIO</small></span>
                </Link>

                <div className="admin-nav-label">WORKSPACE</div>
                <nav className="admin-nav" aria-label="Admin navigation">
                    {navigation.map((item) => {
                        const active = currentPath === item.href;
                        return (
                            <Link key={item.href} href={item.href}
                                className={`admin-nav-item${active ? ' active' : ''}`}
                                aria-current={active ? 'page' : undefined}>
                                <Icon name={item.icon} />
                                <span>{item.label}</span>
                            </Link>
                        );
                    })}
                    <div className="admin-nav-item disabled" aria-disabled="true" title="Not available yet">
                        <Icon name="folder" /><span>Projects</span><span className="nav-soon">SOON</span>
                    </div>
                    <div className="admin-nav-item disabled" aria-disabled="true">
                        <Icon name="layers" /><span>Skills</span><span className="nav-soon">SOON</span>
                    </div>
                    <div className="admin-nav-item disabled" aria-disabled="true">
                        <Icon name="briefcase" /><span>Experience</span><span className="nav-soon">SOON</span>
                    </div>
                    <div className="admin-nav-item disabled" aria-disabled="true">
                        <Icon name="graduation" /><span>Education</span><span className="nav-soon">SOON</span>
                    </div>
                </nav>

                <div className="admin-sidebar-bottom">
                    <div className="admin-nav-label">PREFERENCES</div>
                    <div className="admin-nav-item disabled" aria-disabled="true">
                        <Icon name="settings" /><span>Settings</span><span className="nav-soon">SOON</span>
                    </div>
                    <div className="sidebar-profile">
                        <div className="profile-avatar">A</div>
                        <div className="profile-copy"><strong>Administrator</strong><span>Portfolio owner</span></div>
                        <span className="profile-status" title="Signed in" />
                    </div>
                </div>
            </aside>

            <section className="admin-main">
                <header className="admin-topbar">
                    <div className="breadcrumb">
                        <span>Workspace</span><span className="breadcrumb-divider">/</span>
                        <strong>{currentItem.label}</strong>
                    </div>
                    <div className="topbar-actions">
                        <span className="admin-status"><span />ADMIN MODE</span>
                        <Link href="/" className="portfolio-link">View portfolio<Icon name="external" size={16} /></Link>
                    </div>
                </header>
                {children}
            </section>
        </div>
    );
}
