import { router } from '@inertiajs/react';
import type { ReactNode } from 'react';
import type { Paginated } from '../../types';
import { AddButton, AdminPage, Badge, confirmDelete, EmptyState, IconButton, Pagination, SearchForm } from './ui';

export interface Column<T> {
    label: string;
    render: (record: T) => ReactNode;
    /** Hide the column on narrow screens. */
    secondary?: boolean;
}

interface BaseRecord {
    id: number;
    is_published: boolean;
    sort_order: number;
}

interface Props<T extends BaseRecord> {
    eyebrow: string;
    title: string;
    subtitle: string;
    /** e.g. "/admin/experiences" */
    baseUrl: string;
    records: Paginated<T>;
    search: string;
    searchPlaceholder: string;
    columns: Column<T>[];
    /** Name used in the delete confirmation. */
    nameOf: (record: T) => string;
    addLabel: string;
    emptyTitle: string;
    emptyText: string;
    /** Rendered between the header and the table, e.g. tabs. */
    before?: ReactNode;
}

/** Searchable, reorderable listing shared by every admin content type. */
export default function ResourceIndex<T extends BaseRecord>({
    eyebrow,
    title,
    subtitle,
    baseUrl,
    records,
    search,
    searchPlaceholder,
    columns,
    nameOf,
    addLabel,
    emptyTitle,
    emptyText,
    before,
}: Props<T>) {
    const move = (record: T, direction: 'up' | 'down') =>
        router.patch(`${baseUrl}/${record.id}/move`, { direction }, { preserveScroll: true });

    const isFiltered = search !== '';
    const isFirst = (index: number) => records.current_page === 1 && index === 0;
    const isLast = (index: number) => records.current_page === records.last_page && index === records.data.length - 1;

    return (
        <AdminPage eyebrow={eyebrow} title={title} subtitle={subtitle} actions={<AddButton href={`${baseUrl}/create`}>{addLabel}</AddButton>}>
            {before}
            <section className="projects-toolbar">
                <div>
                    <span className="projects-count">{records.total.toString().padStart(2, '0')}</span>
                    <span>{isFiltered ? `matching “${search}”` : 'in total'}</span>
                </div>
                <SearchForm action={baseUrl} initial={search} placeholder={searchPlaceholder} />
            </section>

            {records.data.length === 0 ? (
                isFiltered ? (
                    <EmptyState title="Nothing matches your search" text="Try a different term, or clear the search box." actionHref={baseUrl} actionLabel="Clear search" />
                ) : (
                    <EmptyState title={emptyTitle} text={emptyText} actionHref={`${baseUrl}/create`} actionLabel={addLabel} />
                )
            ) : (
                <div className="admin-table-wrap">
                    <table className="admin-table">
                        <thead>
                            <tr>
                                {columns.map((column) => (
                                    <th key={column.label} className={column.secondary ? 'is-secondary' : undefined}>
                                        {column.label}
                                    </th>
                                ))}
                                <th>Status</th>
                                <th className="admin-table-actions">
                                    <span className="sr-only">Actions</span>
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {records.data.map((record, index) => (
                                <tr key={record.id}>
                                    {columns.map((column) => (
                                        <td key={column.label} className={column.secondary ? 'is-secondary' : undefined}>
                                            {column.render(record)}
                                        </td>
                                    ))}
                                    <td>
                                        <Badge tone={record.is_published ? 'live' : 'draft'}>{record.is_published ? 'Visible' : 'Hidden'}</Badge>
                                    </td>
                                    <td className="admin-table-actions">
                                        <div>
                                            {!isFiltered && (
                                                <>
                                                    <IconButton icon="arrow-up" label="Move up" onClick={() => move(record, 'up')} disabled={isFirst(index)} />
                                                    <IconButton icon="arrow-down" label="Move down" onClick={() => move(record, 'down')} disabled={isLast(index)} />
                                                </>
                                            )}
                                            <IconButton
                                                icon={record.is_published ? 'eye-off' : 'eye'}
                                                label={record.is_published ? 'Hide from public site' : 'Show on public site'}
                                                onClick={() => router.patch(`${baseUrl}/${record.id}/toggle`, {}, { preserveScroll: true })}
                                            />
                                            <IconButton icon="edit" label={`Edit ${nameOf(record)}`} href={`${baseUrl}/${record.id}/edit`} />
                                            <IconButton
                                                icon="trash"
                                                label={`Delete ${nameOf(record)}`}
                                                danger
                                                onClick={() => confirmDelete(`${baseUrl}/${record.id}`, nameOf(record))}
                                            />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <Pagination page={records} />
        </AdminPage>
    );
}
