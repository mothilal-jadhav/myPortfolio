import { useEffect, useMemo, useRef, useState } from 'react';
import type { MediaOption } from '../../types';
import Icon from './Icon';

interface Props {
    label: string;
    help?: string;
    /** Media row currently referenced, if any. */
    selectedId: number | null;
    /** Newly chosen file that has not been uploaded yet. */
    upload: File | null;
    /** URL and name of the media saved on the record, used when it is not in the library list. */
    current?: { id: number; url: string; name: string; isImage: boolean } | null;
    library: MediaOption[];
    accept: 'image' | 'document';
    error?: string;
    onChange: (selectedId: number | null, upload: File | null) => void;
}

const ACCEPT = {
    image: 'image/jpeg,image/png,image/webp,image/gif',
    document: 'image/jpeg,image/png,image/webp,image/gif,application/pdf',
};

/** Upload a new file, reuse one from the media library, or clear the field. */
export default function MediaPicker({ label, help, selectedId, upload, current, library, accept, error, onChange }: Props) {
    const [libraryOpen, setLibraryOpen] = useState(false);
    const fileInput = useRef<HTMLInputElement>(null);

    const uploadUrl = useMemo(() => (upload && upload.type.startsWith('image/') ? URL.createObjectURL(upload) : null), [upload]);

    useEffect(() => {
        return () => {
            if (uploadUrl) {
                URL.revokeObjectURL(uploadUrl);
            }
        };
    }, [uploadUrl]);

    const fromLibrary = library.find((item) => item.id === selectedId);
    const saved = current && current.id === selectedId ? current : null;

    const preview = upload
        ? { url: uploadUrl, name: `${upload.name} (uploads when you save)` }
        : fromLibrary
          ? { url: fromLibrary.url, name: fromLibrary.name }
          : saved
            ? { url: saved.isImage ? saved.url : null, name: saved.name }
            : null;

    return (
        <div className="admin-field admin-field--full">
            <span className="admin-label">{label}</span>
            <div className="media-picker">
                <div className="media-picker-preview">
                    {preview?.url ? <img src={preview.url} alt="" /> : <Icon name="image" size={26} />}
                </div>
                <div className="media-picker-body">
                    <p className="media-picker-name">{preview ? preview.name : 'No file selected'}</p>
                    <div className="media-picker-actions">
                        <button type="button" className="admin-btn" onClick={() => fileInput.current?.click()}>
                            <Icon name="upload" size={14} /> Upload
                        </button>
                        {library.length > 0 && (
                            <button type="button" className="admin-btn" onClick={() => setLibraryOpen((open) => !open)} aria-expanded={libraryOpen}>
                                <Icon name="image" size={14} /> {libraryOpen ? 'Close library' : 'Choose from library'}
                            </button>
                        )}
                        {preview && (
                            <button type="button" className="admin-btn admin-btn--danger" onClick={() => onChange(null, null)}>
                                Remove
                            </button>
                        )}
                    </div>
                    <input
                        ref={fileInput}
                        type="file"
                        accept={ACCEPT[accept]}
                        hidden
                        onChange={(event) => {
                            const file = event.target.files?.[0] ?? null;

                            if (file) {
                                onChange(selectedId, file);
                            }

                            event.target.value = '';
                        }}
                    />
                </div>
            </div>
            {libraryOpen && (
                <div className="media-library" role="listbox" aria-label="Media library">
                    {library.map((item) => (
                        <button
                            type="button"
                            key={item.id}
                            role="option"
                            aria-selected={item.id === selectedId && !upload}
                            className={`media-library-item${item.id === selectedId && !upload ? ' selected' : ''}`}
                            title={item.name}
                            onClick={() => {
                                onChange(item.id, null);
                                setLibraryOpen(false);
                            }}
                        >
                            <img src={item.url} alt={item.name} loading="lazy" />
                        </button>
                    ))}
                </div>
            )}
            {help && <p className="admin-help">{help}</p>}
            {error && <p className="admin-error">{error}</p>}
        </div>
    );
}
