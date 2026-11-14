import { router, useForm } from '@inertiajs/react';
import { useRef, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import Icon from '../../../components/admin/Icon';
import { AdminPage, Badge, EmptyState, Pagination } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import { formatBytes } from '../../../lib/format';
import type { MediaItem, Paginated } from '../../../types';
import type { PageWithLayout } from '../../../types/page';

type MediaRow = MediaItem & { usages: string[] };

interface Props {
    media: Paginated<MediaRow>;
    maxKilobytes: number;
}

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,application/pdf';

function Uploader({ maxKilobytes }: { maxKilobytes: number }) {
    const input = useRef<HTMLInputElement>(null);
    const { setData, post, processing, errors, progress, reset } = useForm<{ files: File[] }>({ files: [] });
    const [pending, setPending] = useState<File[]>([]);

    function submit(event: FormEvent) {
        event.preventDefault();
        post('/admin/media', { preserveScroll: true, onSuccess: () => { reset(); setPending([]); } });
    }

    const errorMessages = Object.values(errors).filter(Boolean) as string[];

    return (
        <form className="dashboard-panel media-uploader" onSubmit={submit}>
            <button type="button" className="media-dropzone" onClick={() => input.current?.click()}>
                <Icon name="upload" size={22} />
                <strong>{pending.length > 0 ? `${pending.length} file${pending.length === 1 ? '' : 's'} selected` : 'Choose files to upload'}</strong>
                <span>JPG, PNG, WebP, GIF or PDF · up to {Math.round(maxKilobytes / 1024)} MB each · 10 files at a time</span>
            </button>
            <input
                ref={input}
                type="file"
                accept={ACCEPT}
                multiple
                hidden
                onChange={(event) => {
                    const files = Array.from(event.target.files ?? []);
                    setPending(files);
                    setData('files', files);
                }}
            />
            {pending.length > 0 && (
                <div className="admin-form-actions">
                    <button type="submit" className="projects-add-button" disabled={processing}>
                        {processing ? `Uploading… ${progress?.percentage ?? 0}%` : 'Upload'}
                    </button>
                    <button type="button" className="admin-btn" onClick={() => { reset(); setPending([]); }}>
                        Clear
                    </button>
                </div>
            )}
            {errorMessages.map((message) => (
                <p className="admin-error" role="alert" key={message}>
                    {message}
                </p>
            ))}
        </form>
    );
}

function MediaCard({ item }: { item: MediaRow }) {
    const replaceInput = useRef<HTMLInputElement>(null);
    const [altText, setAltText] = useState(item.alt_text ?? '');
    const [error, setError] = useState<string | null>(null);
    const inUse = item.usages.length > 0;

    function save(file: File | null) {
        setError(null);
        router.post(
            `/admin/media/${item.id}`,
            { alt_text: altText, ...(file ? { file } : {}) },
            { preserveScroll: true, onError: (errors) => setError(errors.file ?? errors.alt_text ?? 'The file could not be saved.') },
        );
    }

    function remove() {
        if (window.confirm(`Delete "${item.original_name}"? This cannot be undone.`)) {
            router.delete(`/admin/media/${item.id}`, { preserveScroll: true });
        }
    }

    return (
        <article className="media-card">
            <a className="media-card-preview" href={item.url} target="_blank" rel="noopener noreferrer" title="Open file">
                {item.is_image ? <img src={item.url} alt={item.alt_text ?? ''} loading="lazy" /> : <span className="media-card-doc">PDF</span>}
            </a>
            <div className="media-card-body">
                <p className="media-card-name" title={item.original_name}>
                    {item.original_name}
                </p>
                <p className="media-card-meta">
                    {formatBytes(item.size)}
                    {item.width && item.height ? ` · ${item.width}×${item.height}` : ''}
                </p>
                <p className="media-card-usage">
                    {inUse ? <Badge tone="live">In use</Badge> : <Badge tone="muted">Unused</Badge>}
                    {inUse && <span title={item.usages.join('\n')}>{item.usages.join(', ')}</span>}
                </p>
                <label className="sr-only" htmlFor={`alt-${item.id}`}>
                    Description of {item.original_name}
                </label>
                <input
                    id={`alt-${item.id}`}
                    className="admin-input admin-input--compact"
                    value={altText}
                    maxLength={255}
                    placeholder="Describe the image (alt text)"
                    onChange={(event) => setAltText(event.target.value)}
                />
                {error && (
                    <p className="admin-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="media-card-actions">
                    <button type="button" className="admin-btn" onClick={() => save(null)} disabled={altText === (item.alt_text ?? '')}>
                        Save
                    </button>
                    <button type="button" className="admin-btn" onClick={() => replaceInput.current?.click()} title="Swap the file everywhere it is used">
                        Replace
                    </button>
                    <button
                        type="button"
                        className="admin-btn admin-btn--danger"
                        onClick={remove}
                        disabled={inUse}
                        title={inUse ? 'Remove it from the content that uses it before deleting' : 'Delete file'}
                    >
                        Delete
                    </button>
                </div>
                <input
                    ref={replaceInput}
                    type="file"
                    accept={ACCEPT}
                    hidden
                    onChange={(event) => {
                        const file = event.target.files?.[0];

                        if (file) {
                            save(file);
                        }

                        event.target.value = '';
                    }}
                />
            </div>
        </article>
    );
}

const Index: PageWithLayout<Props> = ({ media, maxKilobytes }) => {
    return (
        <AdminPage
            eyebrow="WORKSPACE / CONTENT"
            title="Media"
            subtitle="Every uploaded image and document. Files can be reused across projects, skills and other content."
        >
            <Uploader maxKilobytes={maxKilobytes} />

            {media.data.length === 0 ? (
                <EmptyState title="No media yet" text="Upload images here, or directly from any content form." />
            ) : (
                <section className="media-grid">
                    {media.data.map((item) => (
                        <MediaCard key={`${item.id}-${item.url}`} item={item} />
                    ))}
                </section>
            )}
            <Pagination page={media} />
        </AdminPage>
    );
};

Index.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Index;
