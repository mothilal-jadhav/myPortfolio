import { Link } from '@inertiajs/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { CSSProperties, KeyboardEvent, PointerEvent } from 'react';
import { initials } from '../../lib/format';
import type { PublicProject } from '../../types';
import { usePrefersReducedMotion } from './hooks';

const AUTOPLAY_MS = 4500;
const SWIPE_THRESHOLD = 45;

function tileStyle(index: number, active: number, hue: number): CSSProperties {
    const offset = index - active;
    const distance = Math.abs(offset);
    const rotate = offset === 0 ? 0 : offset > 0 ? -38 : 38;

    return {
        transform: `translate(-50%, -50%) translateX(${offset * 62}%) translateZ(${-distance * 160}px) rotateY(${rotate}deg) scale(${offset === 0 ? 1 : 0.86})`,
        zIndex: 100 - distance,
        // Side cards are dimmed rather than made translucent, so cards behind them do not show through.
        opacity: distance > 3 ? 0 : 1,
        filter: distance === 0 ? undefined : `brightness(${Math.max(0.3, 1 - distance * 0.22)})`,
        pointerEvents: distance > 3 ? 'none' : undefined,
        '--hue': hue,
    } as CSSProperties;
}

function TileContent({ project }: { project: PublicProject }) {
    return (
        <>
            <div className={`project-art${project.thumbnail ? ' has-image' : ''}`}>
                {project.thumbnail ? (
                    <img src={project.thumbnail.url} alt={project.thumbnail.alt} loading="lazy" draggable={false} />
                ) : (
                    <span aria-hidden="true">{initials(project.title)}</span>
                )}
                {project.featured && <em className="project-flag">Featured</em>}
            </div>
            <div className="project-body">
                {project.category && <span className="project-tag">{project.category}</span>}
                <h3>{project.title}</h3>
                <p>{project.description}</p>
                {project.technologies.length > 0 && (
                    <ul className="project-tech">
                        {project.technologies.slice(0, 4).map((technology) => (
                            <li key={technology}>{technology}</li>
                        ))}
                        {project.technologies.length > 4 && <li>+{project.technologies.length - 4}</li>}
                    </ul>
                )}
                <span className="project-cta">View project →</span>
            </div>
        </>
    );
}

/**
 * 3D coverflow built from the published projects. Works with any number of
 * projects: a single project is shown as one centred card without controls.
 */
export default function Coverflow({ projects }: { projects: PublicProject[] }) {
    const count = projects.length;
    const [active, setActive] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [hovered, setHovered] = useState(false);
    const reducedMotion = usePrefersReducedMotion();
    const pointerStart = useRef<number | null>(null);
    const swiped = useRef(false);
    const current = Math.min(active, count - 1);
    const multiple = count > 1;

    const go = useCallback(
        (step: number) => {
            setActive((index) => (Math.min(index, count - 1) + step + count) % count);
        },
        [count],
    );

    useEffect(() => {
        if (!playing || hovered || !multiple || reducedMotion) {
            return;
        }

        const timer = window.setInterval(() => go(1), AUTOPLAY_MS);

        return () => window.clearInterval(timer);
    }, [playing, hovered, multiple, reducedMotion, go]);

    function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
        if (!multiple) {
            return;
        }

        const actions: Record<string, () => void> = {
            ArrowLeft: () => go(-1),
            ArrowRight: () => go(1),
            Home: () => setActive(0),
            End: () => setActive(count - 1),
        };

        if (actions[event.key]) {
            event.preventDefault();
            setPlaying(false);
            actions[event.key]();
        }
    }

    function onPointerDown(event: PointerEvent<HTMLDivElement>) {
        pointerStart.current = event.clientX;
        swiped.current = false;
    }

    function onPointerUp(event: PointerEvent<HTMLDivElement>) {
        if (pointerStart.current === null || !multiple) {
            return;
        }

        const distance = event.clientX - pointerStart.current;
        pointerStart.current = null;

        if (Math.abs(distance) >= SWIPE_THRESHOLD) {
            swiped.current = true;
            setPlaying(false);
            go(distance < 0 ? 1 : -1);
        }
    }

    return (
        <div
            className={`coverflow${multiple ? '' : ' coverflow--single'}`}
            role="region"
            aria-roledescription="carousel"
            aria-label="Projects"
            tabIndex={multiple ? 0 : undefined}
            onKeyDown={onKeyDown}
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
        >
            <div className="coverflow-stage" onPointerDown={onPointerDown} onPointerUp={onPointerUp} onPointerCancel={() => (pointerStart.current = null)}>
                {projects.map((project, index) =>
                    index === current ? (
                        <Link
                            key={project.id}
                            href={`/projects/${project.slug}`}
                            className="project-tile is-active"
                            style={tileStyle(index, current, project.hue)}
                            aria-label={`${project.title} — view project`}
                            draggable={false}
                            onClick={(event) => {
                                if (swiped.current) {
                                    event.preventDefault();
                                }
                            }}
                        >
                            <TileContent project={project} />
                        </Link>
                    ) : (
                        <button
                            key={project.id}
                            type="button"
                            className="project-tile"
                            style={tileStyle(index, current, project.hue)}
                            aria-label={`Show ${project.title}`}
                            tabIndex={-1}
                            onClick={() => {
                                if (!swiped.current) {
                                    setPlaying(false);
                                    setActive(index);
                                }
                            }}
                        >
                            <TileContent project={project} />
                        </button>
                    ),
                )}
            </div>

            {multiple && (
                <>
                    <div className="coverflow-controls">
                        <button type="button" className="control-btn" aria-label="Previous project" onClick={() => { setPlaying(false); go(-1); }}>
                            ‹
                        </button>
                        {!reducedMotion && (
                            <button
                                type="button"
                                className={`control-btn${playing ? ' is-playing' : ''}`}
                                aria-label={playing ? 'Pause slideshow' : 'Play slideshow'}
                                aria-pressed={playing}
                                onClick={() => setPlaying((value) => !value)}
                            >
                                {playing ? '❚❚' : '▶'}
                            </button>
                        )}
                        <button type="button" className="control-btn" aria-label="Next project" onClick={() => { setPlaying(false); go(1); }}>
                            ›
                        </button>
                    </div>

                    <div className="indicators">
                        {projects.map((project, index) => (
                            <button
                                type="button"
                                key={project.id}
                                className={`indicator${index === current ? ' active' : ''}`}
                                aria-label={`Show ${project.title}`}
                                aria-current={index === current ? 'true' : undefined}
                                onClick={() => {
                                    setPlaying(false);
                                    setActive(index);
                                }}
                            />
                        ))}
                    </div>

                    <p className="sr-only" aria-live="polite">
                        {`Project ${current + 1} of ${count}: ${projects[current].title}`}
                    </p>
                </>
            )}
        </div>
    );
}
