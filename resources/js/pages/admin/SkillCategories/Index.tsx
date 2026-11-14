import { Tabs } from "../../../components/admin/ui";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Category {
    id: number;
    name: string;
    description: string | null;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Category>;
    filters: { search: string };
    skillCounts: Record<number, number>;
}

const TABS = [
    { label: "Skills", href: "/admin/skills" },
    { label: "Categories", href: "/admin/skill-categories" },
];

const Index: PageWithLayout<Props> = ({ records, filters, skillCounts }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / SKILLS"
        title="Skill categories"
        subtitle="Groups that organise your skills on the public site."
        baseUrl="/admin/skill-categories"
        records={records}
        search={filters.search}
        searchPlaceholder="Search categories"
        nameOf={(category) => category.name}
        addLabel="Add category"
        emptyTitle="No categories yet"
        emptyText="Create a category such as Frontend or Databases, then add skills to it."
        before={<Tabs tabs={TABS} current="/admin/skill-categories" />}
        columns={[
            { label: "Category", render: (category) => <strong>{category.name}</strong> },
            { label: "Description", secondary: true, render: (category) => category.description ?? "—" },
            { label: "Skills", render: (category) => skillCounts[category.id] ?? 0 },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
