import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import type { Paginated } from '../../types';
import Icon from './Icon';
import type { AdminIconName } from './Icon';

/** Page wrapper and heading shared by every admin content page. */
export function AdminPage({
    eyebrow,
    title,
    subtitle,
    actions,
    backUrl,
    backLabel,
    children,
}: {
    eyebrow: string;
    title: string;
    subtitle?: string;
    actions?: ReactNode;
    backUrl?: string;
    backLabel?: string;
    children: ReactNode;
}) {
    return (
        <main className="admin-projects-page">
            {backUrl && (
                <Link href={backUrl} className="admin-back-link">
                    ← {backLabel ?? 'Back'}
                </Link>
            )}
            <header className="projects-header">
                <div>
                    <p className="projects-eyebrow">{eyebrow}</p>
                    <h1>{title}</h1>
                    {subtitle && <p className="projects-subtitle">{subtitle}</p>}
                </div>
                {actions && <div className="admin-header-actions">{actions}</div>}
            </header>
            {children}
        </main>
    );
}

export function AddButton({ href, children }: { href: string; children: ReactNode }) {
    return (
        <Link href={href} className="projects-add-button">
            <span>+</span>
            {children}
        </Link>
    );
}

export function Badge({ tone, children }: { tone: 'live' | 'draft' | 'accent' | 'muted'; children: ReactNode }) {
    return <span className={`admin-badge admin-badge--${tone}`}>{children}</span>;
}

export function EmptyState({
    title,
    text,
    actionHref,
    actionLabel,
}: {
    title: string;
    text: string;
    actionHref?: string;
    actionLabel?: string;
}) {
    return (
        <section className="projects-empty">
            <div className="projects-empty-icon">+</div>
            <h2>{title}</h2>
            <p>{text}</p>
            {actionHref && actionLabel && (
                <Link href={actionHref} className="projects-empty-link">
                    {actionLabel}
                </Link>
            )}
        </section>
    );
}

export function IconButton({
    icon,
    label,
    onClick,
    href,
    external,
    danger,
    disabled,
}: {
    icon: AdminIconName;
    label: string;
    onClick?: () => void;
    href?: string;
    external?: boolean;
    danger?: boolean;
    disabled?: boolean;
}) {
    const className = `admin-icon-btn${danger ? ' admin-icon-btn--danger' : ''}`;

    if (href && external) {
        return (
            <a href={href} className={className} aria-label={label} title={label} target="_blank" rel="noopener noreferrer">
                <Icon name={icon} size={16} />
            </a>
        );
    }

    if (href) {
        return (
            <Link href={href} className={className} aria-label={label} title={label}>
                <Icon name={icon} size={16} />
            </Link>
        );
    }

    return (
        <button type="button" className={className} aria-label={label} title={label} onClick={onClick} disabled={disabled}>
            <Icon name={icon} size={16} />
        </button>
    );
}

/** Ask for confirmation, then send a DELETE request. */
export function confirmDelete(url: string, name: string): void {
    if (window.confirm(`Delete "${name}"? This cannot be undone.`)) {
        router.delete(url, { preserveScroll: true });
    }
}

export function SearchForm({
    action,
    initial,
    placeholder,
    children,
    extra,
}: {
    action: string;
    initial: string;
    placeholder: string;
    children?: ReactNode;
    extra?: () => Record<string, string | number | boolean>;
}) {
    const [search, setSearch] = useState(initial);

    function submit(event: FormEvent) {
        event.preventDefault();
        const query = { ...(extra?.() ?? {}), ...(search.trim() ? { search: search.trim() } : {}) };
        router.get(action, query, { preserveState: true, preserveScroll: true, replace: true });
    }

    return (
        <form className="admin-search" onSubmit={submit} role="search">
            <span className="admin-search-field">
                <Icon name="search" size={15} />
                <input
                    type="search"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder={placeholder}
                    aria-label={placeholder}
                />
            </span>
            {children}
            <button type="submit" className="admin-btn">
                Search
            </button>
        </form>
    );
}

export function Pagination<T>({ page }: { page: Paginated<T> }) {
    if (page.last_page <= 1) {
        return null;
    }

    return (
        <nav className="admin-pagination" aria-label="Pagination">
            <span>
                Showing {page.from}–{page.to} of {page.total}
            </span>
            <div>
                {page.links.map((link, index) => {
                    const label = link.label.replace('&laquo;', '‹').replace('&raquo;', '›').replace(/Previous|Next/, '').trim() || '…';

                    return link.url ? (
                        <Link
                            key={index}
                            href={link.url}
                            className={link.active ? 'active' : ''}
                            aria-current={link.active ? 'page' : undefined}
                            preserveScroll
                        >
                            {label}
                        </Link>
                    ) : (
                        <span key={index} aria-hidden="true">
                            {label}
                        </span>
                    );
                })}
            </div>
        </nav>
    );
}

export function Tabs({ tabs, current }: { tabs: { label: string; href: string }[]; current: string }) {
    return (
        <nav className="admin-tabs" aria-label="Sections">
            {tabs.map((tab) => (
                <Link key={tab.href} href={tab.href} className={tab.href === current ? 'active' : ''}>
                    {tab.label}
                </Link>
            ))}
        </nav>
    );
}
