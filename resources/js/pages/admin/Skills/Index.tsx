import { Tabs } from "../../../components/admin/ui";
import type { MediaItem } from "../../../types";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Skill {
    id: number;
    name: string;
    proficiency: number | null;
    category: { id: number; name: string } | null;
    media: MediaItem | null;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Skill>;
    filters: { search: string };
}

const TABS = [
    { label: "Skills", href: "/admin/skills" },
    { label: "Categories", href: "/admin/skill-categories" },
];

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / SKILLS"
        title="Skills"
        subtitle="Skills are grouped by category on the public site."
        baseUrl="/admin/skills"
        records={records}
        search={filters.search}
        searchPlaceholder="Search skills"
        nameOf={(skill) => skill.name}
        addLabel="Add skill"
        emptyTitle="No skills yet"
        emptyText="Create a category first, then add the skills that belong to it."
        before={<Tabs tabs={TABS} current="/admin/skills" />}
        columns={[
            {
                label: "Skill",
                render: (skill) => (
                    <span className="admin-cell-media">
                        {skill.media?.is_image && <img src={skill.media.url} alt="" />}
                        <strong>{skill.name}</strong>
                    </span>
                ),
            },
            { label: "Category", render: (skill) => skill.category?.name ?? "—" },
            { label: "Proficiency", secondary: true, render: (skill) => (skill.proficiency === null ? "—" : `${skill.proficiency}%`) },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
