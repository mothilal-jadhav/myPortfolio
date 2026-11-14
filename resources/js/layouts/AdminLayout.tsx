import { Link, router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Icon from '../components/admin/Icon';
import type { AdminIconName } from '../components/admin/Icon';
import type { SharedProps } from '../types';

interface NavItem {
    label: string;
    href: string;
    icon: AdminIconName;
    /** Additional URL prefixes that belong to this item. */
    also?: string[];
}

const navigation: NavItem[] = [
    { label: 'Dashboard', href: '/admin/dashboard', icon: 'grid' },
    { label: 'Profile', href: '/admin/profile', icon: 'user' },
    { label: 'Projects', href: '/admin/projects', icon: 'folder' },
    { label: 'Skills', href: '/admin/skills', icon: 'layers', also: ['/admin/skill-categories'] },
    { label: 'Experience', href: '/admin/experiences', icon: 'briefcase' },
    { label: 'Education', href: '/admin/education', icon: 'graduation' },
    { label: 'Certifications', href: '/admin/certifications', icon: 'award' },
    { label: 'Achievements', href: '/admin/achievements', icon: 'trophy' },
    { label: 'Social links', href: '/admin/social-links', icon: 'link' },
    { label: 'Media', href: '/admin/media', icon: 'image' },
];

const settingsItem: NavItem = { label: 'Settings', href: '/admin/settings', icon: 'settings' };

function matches(item: NavItem, path: string): boolean {
    return [item.href, ...(item.also ?? [])].some((prefix) => path === prefix || path.startsWith(`${prefix}/`));
}

function NavLink({ item, path, className = '' }: { item: NavItem; path: string; className?: string }) {
    const active = matches(item, path);

    return (
        <Link href={item.href} className={`admin-nav-item${active ? ' active' : ''}${className}`} aria-current={active ? 'page' : undefined}>
            <Icon name={item.icon} />
            <span>{item.label}</span>
        </Link>
    );
}

function Flash() {
    const { flash } = usePage<SharedProps>().props;
    const [dismissed, setDismissed] = useState<string | null>(null);
    const message = flash.error ?? flash.success;

    useEffect(() => {
        setDismissed(null);
    }, [flash]);

    if (!message || dismissed === message) {
        return null;
    }

    return (
        <div className={`admin-flash admin-flash--floating ${flash.error ? 'admin-flash--error' : 'admin-flash--success'}`} role="status">
            <span>{message}</span>
            <button type="button" aria-label="Dismiss message" onClick={() => setDismissed(message)}>
                <Icon name="x" size={14} />
            </button>
        </div>
    );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
    const { url, props } = usePage<SharedProps>();
    const user = props.auth.user;
    const currentPath = url.split('?')[0];
    const currentItem = [...navigation, settingsItem].find((item) => matches(item, currentPath)) ?? navigation[0];

    const logout = () => router.post('/logout');

    return (
        <div className="admin-dashboard admin-shell">
            <aside className="admin-sidebar">
                <Link href="/admin/dashboard" className="admin-brand">
                    <span className="admin-brand-mark">
                        <Icon name="sparkles" size={21} />
                    </span>
                    <span>
                        <strong>MY PORTFOLIO</strong>
                        <small>CONTENT STUDIO</small>
                    </span>
                </Link>
                <div className="admin-nav-label">WORKSPACE</div>
                <nav className="admin-nav" aria-label="Admin navigation">
                    {navigation.map((item) => (
                        <NavLink key={item.href} item={item} path={currentPath} />
                    ))}
                    <NavLink item={settingsItem} path={currentPath} className=" admin-nav-item--compact-only" />
                </nav>
                <div className="admin-sidebar-bottom">
                    <div className="admin-nav-label">PREFERENCES</div>
                    <NavLink item={settingsItem} path={currentPath} />
                    <div className="sidebar-profile">
                        <div className="profile-avatar">{(user?.name ?? 'A').charAt(0).toUpperCase()}</div>
                        <div className="profile-copy">
                            <strong>{user?.name ?? 'Administrator'}</strong>
                            <span>{user?.email ?? 'Portfolio owner'}</span>
                        </div>
                        <button type="button" className="sidebar-logout" onClick={logout} aria-label="Log out" title="Log out">
                            <Icon name="logout" size={17} />
                        </button>
                    </div>
                </div>
            </aside>
            <section className="admin-main">
                <header className="admin-topbar">
                    <div className="breadcrumb">
                        <span>Workspace</span>
                        <span className="breadcrumb-divider">/</span>
                        <strong>{currentItem.label}</strong>
                    </div>
                    <div className="topbar-actions">
                        <span className="admin-status">
                            <span />
                            ADMIN MODE
                        </span>
                        <a href="/" className="portfolio-link" target="_blank" rel="noopener noreferrer">
                            View portfolio
                            <Icon name="external" size={16} />
                        </a>
                        <button type="button" className="portfolio-link topbar-logout" onClick={logout}>
                            Log out
                            <Icon name="logout" size={16} />
                        </button>
                    </div>
                </header>
                <Flash />
                {children}
            </section>
        </div>
    );
}
