import { formatMonth } from "../../../lib/format";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Achievement {
    id: number;
    title: string;
    issuer: string | null;
    achieved_on: string | null;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Achievement>;
    filters: { search: string };
}

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / CONTENT"
        title="Achievements"
        subtitle="Awards, recognition and other milestones."
        baseUrl="/admin/achievements"
        records={records}
        search={filters.search}
        searchPlaceholder="Search achievements"
        nameOf={(achievement) => achievement.title}
        addLabel="Add achievement"
        emptyTitle="No achievements yet"
        emptyText="Add an award or milestone to show it on your portfolio."
        columns={[
            { label: "Achievement", render: (achievement) => <strong>{achievement.title}</strong> },
            { label: "Issued by", secondary: true, render: (achievement) => achievement.issuer ?? "—" },
            { label: "Date", secondary: true, render: (achievement) => formatMonth(achievement.achieved_on) || "—" },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
