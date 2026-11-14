import { formatPeriod } from "../../../lib/format";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Education {
    id: number;
    institution: string;
    degree: string;
    field_of_study: string | null;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Education>;
    filters: { search: string };
}

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / CONTENT"
        title="Education"
        subtitle="Degrees, courses and other study shown on your portfolio."
        baseUrl="/admin/education"
        records={records}
        search={filters.search}
        searchPlaceholder="Search education"
        nameOf={(education) => `${education.degree} at ${education.institution}`}
        addLabel="Add education"
        emptyTitle="No education records yet"
        emptyText="Add a degree or course to show your academic background."
        columns={[
            { label: "Degree", render: (education) => <strong>{education.degree}</strong> },
            { label: "Institution", render: (education) => education.institution },
            { label: "Field", secondary: true, render: (education) => education.field_of_study ?? "—" },
            { label: "Period", secondary: true, render: (education) => formatPeriod(education.start_date, education.end_date, education.is_current) },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
