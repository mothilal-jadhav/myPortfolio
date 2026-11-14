import { useEffect, useState } from 'react';

/** True once the page has been scrolled past the given offset. */
export function useScrolled(offset = 50): boolean {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const update = () => setScrolled(window.scrollY > offset);

        update();
        window.addEventListener('scroll', update, { passive: true });

        return () => window.removeEventListener('scroll', update);
    }, [offset]);

    return scrolled;
}

/** Id of the section currently under the navigation bar. */
export function useActiveSection(ids: string[]): string {
    const [active, setActive] = useState(ids[0] ?? '');
    const key = ids.join(',');

    useEffect(() => {
        const elements = key
            .split(',')
            .map((id) => document.getElementById(id))
            .filter((element): element is HTMLElement => element !== null);

        const update = () => {
            const marker = window.scrollY + window.innerHeight * 0.35;
            let current = elements[0]?.id ?? '';

            for (const element of elements) {
                if (element.offsetTop <= marker) {
                    current = element.id;
                }
            }

            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2 && elements.length > 0) {
                current = elements[elements.length - 1].id;
            }

            setActive(current);
        };

        update();
        window.addEventListener('scroll', update, { passive: true });
        window.addEventListener('resize', update);

        return () => {
            window.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
        };
    }, [key]);

    return active;
}

/** Fade elements with the "reveal" class in as they enter the viewport. */
export function useReveal(dependency: unknown = null): void {
    useEffect(() => {
        const elements = Array.from(document.querySelectorAll<HTMLElement>('.reveal:not(.active)'));

        if (!('IntersectionObserver' in window)) {
            elements.forEach((element) => element.classList.add('active'));

            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                for (const entry of entries) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('active');
                        observer.unobserve(entry.target);
                    }
                }
            },
            { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
        );

        elements.forEach((element) => observer.observe(element));

        return () => observer.disconnect();
    }, [dependency]);
}

/** Apply the accent colour chosen in site settings while a public page is mounted. */
export function useAccentColor(color: string | null): void {
    useEffect(() => {
        if (!color) {
            return;
        }

        const root = document.documentElement;
        root.style.setProperty('--accent', color);

        return () => {
            root.style.removeProperty('--accent');
        };
    }, [color]);
}

export function usePrefersReducedMotion(): boolean {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        const update = () => setReduced(query.matches);

        update();
        query.addEventListener('change', update);

        return () => query.removeEventListener('change', update);
    }, []);

    return reduced;
}
