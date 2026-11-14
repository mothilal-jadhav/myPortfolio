import { formatPeriod } from "../../../lib/format";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Experience {
    id: number;
    organisation: string;
    job_title: string;
    employment_type: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Experience>;
    filters: { search: string };
}

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / CONTENT"
        title="Experience"
        subtitle="Roles and work history shown on your portfolio timeline."
        baseUrl="/admin/experiences"
        records={records}
        search={filters.search}
        searchPlaceholder="Search experience"
        nameOf={(experience) => `${experience.job_title} at ${experience.organisation}`}
        addLabel="Add experience"
        emptyTitle="No experience yet"
        emptyText="Add your current or previous roles to build your timeline."
        columns={[
            { label: "Role", render: (experience) => <strong>{experience.job_title}</strong> },
            { label: "Organisation", render: (experience) => experience.organisation },
            { label: "Type", secondary: true, render: (experience) => experience.employment_type ?? "—" },
            { label: "Period", secondary: true, render: (experience) => formatPeriod(experience.start_date, experience.end_date, experience.is_current) },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
