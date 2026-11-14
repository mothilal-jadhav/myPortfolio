import { Link, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import type { PublicSocialLink, SharedProps, SiteData } from '../../types';
import { resolveIcon } from '../../lib/icons';
import { useScrolled } from './hooks';
import Icon from './Icon';

export interface NavEntry {
    /** Element id on the home page, without the leading "#". */
    id: string;
    label: string;
}

interface NavbarProps {
    site: SiteData;
    items: NavEntry[];
    activeId?: string;
    /** Prefix for anchors, "" on the home page and "/" elsewhere. */
    anchorBase?: string;
}

export function Navbar({ site, items, activeId, anchorBase = '' }: NavbarProps) {
    const scrolled = useScrolled();
    const [open, setOpen] = useState(false);
    const user = usePage<SharedProps>().props.auth.user;
    const homeHref = anchorBase === '' ? `#${items[0]?.id ?? ''}` : anchorBase;

    useEffect(() => {
        if (!open) {
            return;
        }

        const close = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
            }
        };

        window.addEventListener('keydown', close);

        return () => window.removeEventListener('keydown', close);
    }, [open]);

    return (
        <nav id="navbar" className={scrolled ? 'scrolled' : ''} aria-label="Primary">
            <a href={homeHref} className="nav-logo" onClick={() => setOpen(false)}>
                {site.logo ? <img src={site.logo.url} alt="" className="nav-logo-image" /> : <Icon name="logo" />}
                {site.title}
            </a>

            <ul id="primary-navigation" className={`nav-links${open ? ' open' : ''}`}>
                {items.map((item) => (
                    <li key={item.id}>
                        <a
                            href={`${anchorBase}#${item.id}`}
                            className={item.id === activeId ? 'active' : ''}
                            aria-current={item.id === activeId ? 'location' : undefined}
                            onClick={() => setOpen(false)}
                        >
                            {item.label}
                        </a>
                    </li>
                ))}
            </ul>

            <Link href={user ? '/admin/dashboard' : '/login'} className="btn btn-ghost nav-login">
                {user ? 'Dashboard' : 'Login'}
            </Link>

            <button
                type="button"
                className={`menu-toggle${open ? ' open' : ''}`}
                aria-label={open ? 'Close menu' : 'Open menu'}
                aria-expanded={open}
                aria-controls="primary-navigation"
                onClick={() => setOpen((value) => !value)}
            >
                <span />
                <span />
                <span />
            </button>
        </nav>
    );
}

interface FooterProps {
    site: SiteData;
    socialLinks: PublicSocialLink[];
    email?: string | null;
}

export function Footer({ site, socialLinks, email }: FooterProps) {
    const hasSocials = socialLinks.length > 0 || Boolean(email);
    const copyright = site.footerText ?? (site.title ? `© ${new Date().getFullYear()} ${site.title}` : null);

    if (!hasSocials && !copyright && !site.footerDescription) {
        return null;
    }

    return (
        <footer>
            {hasSocials && (
                <div className="socials">
                    {socialLinks.map((link) => (
                        <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" aria-label={link.platform} title={link.platform}>
                            <Icon name={resolveIcon(link.icon, 'link')} />
                        </a>
                    ))}
                    {email && (
                        <a href={`mailto:${email}`} aria-label="Email" title="Email">
                            <Icon name="mail" />
                        </a>
                    )}
                </div>
            )}
            {site.footerDescription && <p className="footer-description">{site.footerDescription}</p>}
            {copyright && <p>{copyright}</p>}
        </footer>
    );
}
