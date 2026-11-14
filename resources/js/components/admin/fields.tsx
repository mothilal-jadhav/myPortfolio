import { Link, useForm } from '@inertiajs/react';
import { useState } from 'react';
import type { FormEvent, KeyboardEvent, ReactNode } from 'react';
import { ICON_LABELS, ICONS } from '../../lib/icons';
import type { IconName } from '../../lib/icons';
import type { MediaItem, MediaOption, SectionSetting, StatItem } from '../../types';
import Icon from './Icon';
import MediaPicker from './MediaPicker';

export type FormValue = string | number | boolean | null | File | File[] | string[] | number[] | StatItem[] | SectionSetting[];
export type FormValues = Record<string, FormValue>;
export type FormRecord = Record<string, unknown>;

interface BaseField {
    name: string;
    label: string;
    help?: string;
    required?: boolean;
    /** Span both columns of the form grid. */
    full?: boolean;
}

export type FieldDef =
    | (BaseField & {
          type: 'text' | 'url' | 'email' | 'date' | 'datetime-local' | 'number' | 'color';
          placeholder?: string;
          maxLength?: number;
          min?: number;
          max?: number;
          /** Name of a checkbox field that disables this one while ticked. */
          disabledWhen?: string;
          /** Suggestions offered through a datalist. */
          suggestions?: string[];
      })
    | (BaseField & { type: 'textarea'; rows?: number; placeholder?: string; maxLength?: number })
    | (BaseField & { type: 'select'; options: { value: string | number; label: string }[]; placeholder?: string })
    | (BaseField & { type: 'checkbox'; /** Field to empty when this box is ticked. */ clears?: string })
    | (BaseField & { type: 'range'; min: number; max: number; unit?: string })
    | (BaseField & { type: 'media'; accept?: 'image' | 'document' })
    | (BaseField & { type: 'gallery' })
    | (BaseField & { type: 'tags'; suggestions?: string[]; placeholder?: string })
    | (BaseField & { type: 'list'; placeholder?: string; addLabel?: string })
    | (BaseField & { type: 'pairs'; addLabel?: string })
    | (BaseField & { type: 'icon'; icons: IconName[] })
    | (BaseField & { type: 'custom'; initial: FormValue; render: (form: FormApi) => ReactNode });

export interface FormSection {
    title: string;
    description?: string;
    fields: FieldDef[];
}

export interface FormApi {
    data: FormValues;
    errors: Record<string, string | undefined>;
    set: (name: string, value: FormValue) => void;
}

/** The display order and visibility controls every content type shares. */
export function visibilitySection(noun: string): FormSection {
    return {
        title: 'Visibility',
        description: `Control whether this ${noun} appears on the public site and where.`,
        fields: [
            { type: 'checkbox', name: 'is_published', label: 'Visible on the public site', help: 'Untick to keep it as a hidden draft.' },
            { type: 'number', name: 'sort_order', label: 'Display order', min: 0, help: 'Lower numbers appear first. Leave empty to place it last.' },
        ],
    };
}

function asText(value: unknown, fallback: FormValue = ''): string {
    return value === null || value === undefined ? String(fallback ?? '') : String(value);
}

function names(value: unknown): string[] {
    if (!Array.isArray(value)) {
        return [];
    }

    return value
        .map((item) => (typeof item === 'string' ? item : item && typeof item === 'object' && 'name' in item ? String(item.name) : ''))
        .filter(Boolean);
}

function buildInitial(sections: FormSection[], record: FormRecord | null, defaults: FormValues): FormValues {
    const values: FormValues = {};

    for (const field of sections.flatMap((section) => section.fields)) {
        const stored = record?.[field.name];
        const fallback = defaults[field.name];

        switch (field.type) {
            case 'checkbox':
                values[field.name] = Boolean(stored ?? fallback ?? false);
                break;
            case 'range':
                values[field.name] = Number(stored ?? fallback ?? field.min);
                break;
            case 'media':
                values[`${field.name}_id`] = (record?.[`${field.name}_id`] as number | null | undefined) ?? null;
                values[`${field.name}_upload`] = null;
                break;
            case 'gallery':
                values[`${field.name}_ids`] = Array.isArray(stored) ? (stored as MediaItem[]).map((item) => item.id) : [];
                values[`${field.name}_uploads`] = [];
                break;
            case 'tags':
            case 'list':
                values[field.name] = names(stored);
                break;
            case 'pairs':
                values[field.name] = Array.isArray(stored) ? (stored as StatItem[]) : [];
                break;
            case 'custom':
                values[field.name] = field.initial;
                break;
            default:
                values[field.name] = asText(stored, fallback);
        }
    }

    return values;
}

function Wrapper({ field, error, children, htmlFor }: { field: BaseField; error?: string; children: ReactNode; htmlFor?: string }) {
    return (
        <div className={`admin-field${field.full ? ' admin-field--full' : ''}`}>
            <label className="admin-label" htmlFor={htmlFor}>
                {field.label}
                {field.required && (
                    <span className="admin-required" aria-hidden="true">
                        {' '}
                        *
                    </span>
                )}
            </label>
            {children}
            {field.help && <p className="admin-help">{field.help}</p>}
            {error && (
                <p className="admin-error" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

function TagInput({
    id,
    value,
    suggestions,
    placeholder,
    onChange,
}: {
    id: string;
    value: string[];
    suggestions: string[];
    placeholder?: string;
    onChange: (next: string[]) => void;
}) {
    const [draft, setDraft] = useState('');

    function commit(raw: string) {
        const additions = raw
            .split(',')
            .map((item) => item.trim())
            .filter((item) => item && !value.some((existing) => existing.toLowerCase() === item.toLowerCase()));

        if (additions.length > 0) {
            onChange([...value, ...additions]);
        }

        setDraft('');
    }

    function onKeyDown(event: KeyboardEvent<HTMLInputElement>) {
        if (event.key === 'Enter' || event.key === ',') {
            event.preventDefault();
            commit(draft);
        } else if (event.key === 'Backspace' && draft === '' && value.length > 0) {
            onChange(value.slice(0, -1));
        }
    }

    return (
        <div className="tag-input">
            {value.map((tag) => (
                <span className="tag-input-tag" key={tag}>
                    {tag}
                    <button type="button" aria-label={`Remove ${tag}`} onClick={() => onChange(value.filter((item) => item !== tag))}>
                        <Icon name="x" size={11} />
                    </button>
                </span>
            ))}
            <input
                id={id}
                list={`${id}-options`}
                value={draft}
                placeholder={value.length === 0 ? placeholder : undefined}
                onChange={(event) => setDraft(event.target.value)}
                onKeyDown={onKeyDown}
                onBlur={() => commit(draft)}
            />
            <datalist id={`${id}-options`}>
                {suggestions
                    .filter((option) => !value.includes(option))
                    .map((option) => (
                        <option key={option} value={option} />
                    ))}
            </datalist>
        </div>
    );
}

function Gallery({
    field,
    form,
    record,
    library,
}: {
    field: BaseField;
    form: FormApi;
    record: FormRecord | null;
    library: MediaOption[];
}) {
    const ids = form.data[`${field.name}_ids`] as number[];
    const uploads = form.data[`${field.name}_uploads`] as File[];
    const saved = (Array.isArray(record?.[field.name]) ? record?.[field.name] : []) as MediaItem[];
    const urlFor = (id: number) => saved.find((item) => item.id === id)?.url ?? library.find((item) => item.id === id)?.url;
    const error = form.errors[`${field.name}_uploads`] ?? form.errors[`${field.name}_ids`] ?? firstNestedError(form.errors, `${field.name}_uploads.`);

    function move(index: number, step: number) {
        const next = [...ids];
        const target = index + step;

        if (target < 0 || target >= next.length) {
            return;
        }

        [next[index], next[target]] = [next[target], next[index]];
        form.set(`${field.name}_ids`, next);
    }

    return (
        <Wrapper field={{ ...field, full: true }} error={error}>
            <div className="gallery-field">
                {ids.map((id, index) => (
                    <div className="gallery-item" key={id}>
                        <img src={urlFor(id)} alt="" />
                        <div className="gallery-item-actions">
                            <button type="button" aria-label="Move earlier" onClick={() => move(index, -1)} disabled={index === 0}>
                                ‹
                            </button>
                            <button type="button" aria-label="Move later" onClick={() => move(index, 1)} disabled={index === ids.length - 1}>
                                ›
                            </button>
                            <button
                                type="button"
                                aria-label="Remove image"
                                onClick={() => form.set(`${field.name}_ids`, ids.filter((item) => item !== id))}
                            >
                                <Icon name="x" size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                {uploads.map((file, index) => (
                    <div className="gallery-item gallery-item--pending" key={`${file.name}-${index}`}>
                        <span>{file.name}</span>
                        <small>Uploads on save</small>
                        <div className="gallery-item-actions">
                            <button
                                type="button"
                                aria-label={`Remove ${file.name}`}
                                onClick={() => form.set(`${field.name}_uploads`, uploads.filter((_, position) => position !== index))}
                            >
                                <Icon name="x" size={12} />
                            </button>
                        </div>
                    </div>
                ))}
                <label className="gallery-add">
                    <Icon name="plus" size={18} />
                    <span>Add images</span>
                    <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        multiple
                        hidden
                        onChange={(event) => {
                            form.set(`${field.name}_uploads`, [...uploads, ...Array.from(event.target.files ?? [])]);
                            event.target.value = '';
                        }}
                    />
                </label>
            </div>
        </Wrapper>
    );
}

function firstNestedError(errors: Record<string, string | undefined>, prefix: string): string | undefined {
    const key = Object.keys(errors).find((name) => name.startsWith(prefix));

    return key ? errors[key] : undefined;
}

function Field({ field, form, record, library }: { field: FieldDef; form: FormApi; record: FormRecord | null; library: MediaOption[] }) {
    const id = `field-${field.name}`;
    const error = form.errors[field.name] ?? firstNestedError(form.errors, `${field.name}.`);
    const invalid = error ? true : undefined;

    switch (field.type) {
        case 'checkbox':
            return (
                <div className={`admin-field${field.full ? ' admin-field--full' : ''}`}>
                    <label className="admin-check">
                        <input
                            type="checkbox"
                            checked={Boolean(form.data[field.name])}
                            onChange={(event) => {
                                form.set(field.name, event.target.checked);

                                if (field.clears && event.target.checked) {
                                    form.set(field.clears, '');
                                }
                            }}
                        />
                        <span>
                            <strong>{field.label}</strong>
                            {field.help && <small>{field.help}</small>}
                        </span>
                    </label>
                    {error && (
                        <p className="admin-error" role="alert">
                            {error}
                        </p>
                    )}
                </div>
            );
        case 'textarea':
            return (
                <Wrapper field={{ ...field, full: field.full ?? true }} error={error} htmlFor={id}>
                    <textarea
                        id={id}
                        className="admin-input"
                        rows={field.rows ?? 4}
                        value={form.data[field.name] as string}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        aria-invalid={invalid}
                        onChange={(event) => form.set(field.name, event.target.value)}
                    />
                </Wrapper>
            );
        case 'select':
            return (
                <Wrapper field={field} error={error} htmlFor={id}>
                    <select
                        id={id}
                        className="admin-input"
                        value={form.data[field.name] as string}
                        aria-invalid={invalid}
                        onChange={(event) => form.set(field.name, event.target.value)}
                    >
                        {field.placeholder !== undefined && <option value="">{field.placeholder}</option>}
                        {field.options.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </Wrapper>
            );
        case 'range':
            return (
                <Wrapper field={{ ...field, label: `${field.label}: ${form.data[field.name]}${field.unit ?? ''}` }} error={error} htmlFor={id}>
                    <input
                        id={id}
                        type="range"
                        className="admin-range"
                        min={field.min}
                        max={field.max}
                        value={form.data[field.name] as number}
                        onChange={(event) => form.set(field.name, Number(event.target.value))}
                    />
                </Wrapper>
            );
        case 'media': {
            const saved = record?.[field.name] as MediaItem | null | undefined;

            return (
                <MediaPicker
                    label={field.label}
                    help={field.help}
                    accept={field.accept ?? 'image'}
                    library={library}
                    selectedId={form.data[`${field.name}_id`] as number | null}
                    upload={form.data[`${field.name}_upload`] as File | null}
                    current={saved ? { id: saved.id, url: saved.url, name: saved.original_name, isImage: saved.is_image } : null}
                    error={form.errors[`${field.name}_upload`] ?? form.errors[`${field.name}_id`]}
                    onChange={(selectedId, upload) => {
                        form.set(`${field.name}_id`, selectedId);
                        form.set(`${field.name}_upload`, upload);
                    }}
                />
            );
        }
        case 'gallery':
            return <Gallery field={field} form={form} record={record} library={library} />;
        case 'tags':
            return (
                <Wrapper field={{ ...field, full: field.full ?? true }} error={error} htmlFor={id}>
                    <TagInput
                        id={id}
                        value={form.data[field.name] as string[]}
                        suggestions={field.suggestions ?? []}
                        placeholder={field.placeholder}
                        onChange={(next) => form.set(field.name, next)}
                    />
                </Wrapper>
            );
        case 'list': {
            const items = form.data[field.name] as string[];

            return (
                <Wrapper field={{ ...field, full: true }} error={error}>
                    <div className="list-input">
                        {items.map((item, index) => (
                            <div className="list-input-row" key={index}>
                                <input
                                    className="admin-input"
                                    value={item}
                                    placeholder={field.placeholder}
                                    aria-label={`${field.label} ${index + 1}`}
                                    onChange={(event) => form.set(field.name, items.map((value, position) => (position === index ? event.target.value : value)))}
                                />
                                <button
                                    type="button"
                                    className="admin-icon-btn admin-icon-btn--danger"
                                    aria-label={`Remove item ${index + 1}`}
                                    onClick={() => form.set(field.name, items.filter((_, position) => position !== index))}
                                >
                                    <Icon name="x" size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="admin-btn" onClick={() => form.set(field.name, [...items, ''])}>
                            <Icon name="plus" size={14} /> {field.addLabel ?? 'Add item'}
                        </button>
                    </div>
                </Wrapper>
            );
        }
        case 'pairs': {
            const pairs = form.data[field.name] as StatItem[];
            const update = (index: number, patch: Partial<StatItem>) =>
                form.set(field.name, pairs.map((pair, position) => (position === index ? { ...pair, ...patch } : pair)));

            return (
                <Wrapper field={{ ...field, full: true }} error={error}>
                    <div className="list-input">
                        {pairs.map((pair, index) => (
                            <div className="list-input-row" key={index}>
                                <input
                                    className="admin-input list-input-short"
                                    value={pair.value}
                                    placeholder="Value, e.g. 12+"
                                    aria-label={`Value ${index + 1}`}
                                    maxLength={20}
                                    onChange={(event) => update(index, { value: event.target.value })}
                                />
                                <input
                                    className="admin-input"
                                    value={pair.label}
                                    placeholder="Label, e.g. Open-source contributions"
                                    aria-label={`Label ${index + 1}`}
                                    maxLength={40}
                                    onChange={(event) => update(index, { label: event.target.value })}
                                />
                                <button
                                    type="button"
                                    className="admin-icon-btn admin-icon-btn--danger"
                                    aria-label={`Remove statistic ${index + 1}`}
                                    onClick={() => form.set(field.name, pairs.filter((_, position) => position !== index))}
                                >
                                    <Icon name="x" size={14} />
                                </button>
                            </div>
                        ))}
                        <button type="button" className="admin-btn" onClick={() => form.set(field.name, [...pairs, { label: '', value: '' }])}>
                            <Icon name="plus" size={14} /> {field.addLabel ?? 'Add item'}
                        </button>
                    </div>
                </Wrapper>
            );
        }
        case 'icon':
            return (
                <Wrapper field={{ ...field, full: true }} error={error}>
                    <div className="icon-choice" role="radiogroup" aria-label={field.label}>
                        {field.icons.map((icon) => (
                            <button
                                type="button"
                                key={icon}
                                role="radio"
                                aria-checked={form.data[field.name] === icon}
                                className={form.data[field.name] === icon ? 'selected' : ''}
                                title={icon === 'logo' ? 'Logo' : ICON_LABELS[icon]}
                                onClick={() => form.set(field.name, form.data[field.name] === icon ? '' : icon)}
                            >
                                <svg viewBox="0 0 24 24" aria-hidden="true">
                                    <path d={ICONS[icon]} />
                                </svg>
                                <span>{icon === 'logo' ? 'Logo' : ICON_LABELS[icon]}</span>
                            </button>
                        ))}
                    </div>
                </Wrapper>
            );
        case 'custom':
            return (
                <Wrapper field={{ ...field, full: true }} error={error}>
                    {field.render(form)}
                </Wrapper>
            );
        default: {
            const disabled = field.disabledWhen ? Boolean(form.data[field.disabledWhen]) : false;

            return (
                <Wrapper field={field} error={error} htmlFor={id}>
                    <input
                        id={id}
                        type={field.type}
                        className={field.type === 'color' ? 'admin-color' : 'admin-input'}
                        value={form.data[field.name] as string}
                        placeholder={field.placeholder}
                        maxLength={field.maxLength}
                        min={field.min}
                        max={field.max}
                        disabled={disabled}
                        list={field.suggestions ? `${id}-options` : undefined}
                        aria-invalid={invalid}
                        onChange={(event) => form.set(field.name, event.target.value)}
                    />
                    {field.suggestions && (
                        <datalist id={`${id}-options`}>
                            {field.suggestions.map((option) => (
                                <option key={option} value={option} />
                            ))}
                        </datalist>
                    )}
                </Wrapper>
            );
        }
    }
}

interface ResourceFormProps {
    /** URL the form posts to. */
    action: string;
    sections: FormSection[];
    record: FormRecord | null;
    defaults?: FormValues;
    mediaLibrary?: MediaOption[];
    submitLabel?: string;
    cancelUrl: string;
    /** Extra buttons shown beside the submit button. */
    extraActions?: ReactNode;
}

/**
 * Declarative form used by every admin content type. The form is rebuilt
 * whenever the saved record changes, so pending uploads are never sent twice.
 */
export default function ResourceForm(props: ResourceFormProps) {
    return <ResourceFormBody key={String(props.record?.updated_at ?? 'new')} {...props} />;
}

function ResourceFormBody({
    action,
    sections,
    record,
    defaults = {},
    mediaLibrary = [],
    submitLabel = 'Save',
    cancelUrl,
    extraActions,
}: ResourceFormProps) {
    const { data, setData, post, processing, errors, isDirty, recentlySuccessful } = useForm<FormValues>(() =>
        buildInitial(sections, record, defaults),
    );

    const form: FormApi = {
        data,
        errors: errors as Record<string, string | undefined>,
        set: (name, value) => setData((previous) => ({ ...previous, [name]: value })),
    };

    function submit(event: FormEvent) {
        event.preventDefault();
        post(action, { preserveScroll: true });
    }

    const errorCount = Object.keys(errors).length;

    return (
        <form onSubmit={submit} className="admin-form" noValidate>
            {errorCount > 0 && (
                <div className="admin-flash admin-flash--error" role="alert">
                    {errorCount === 1 ? 'One field needs your attention.' : `${errorCount} fields need your attention.`}
                </div>
            )}
            {sections.map((section) => (
                <section className="dashboard-panel form-panel" key={section.title}>
                    <div className="panel-heading">
                        <div>
                            <h2>{section.title}</h2>
                            {section.description && <p>{section.description}</p>}
                        </div>
                    </div>
                    <div className="form-grid">
                        {section.fields.map((field) => (
                            <Field key={field.name} field={field} form={form} record={record} library={mediaLibrary} />
                        ))}
                    </div>
                </section>
            ))}
            <div className="admin-form-actions">
                <button type="submit" className="projects-add-button" disabled={processing}>
                    {processing ? 'Saving…' : submitLabel}
                </button>
                {extraActions}
                <Link href={cancelUrl} className="admin-btn">
                    Cancel
                </Link>
                {recentlySuccessful && <span className="admin-saved">Saved</span>}
                {isDirty && !processing && !recentlySuccessful && <span className="admin-unsaved">Unsaved changes</span>}
            </div>
        </form>
    );
}
