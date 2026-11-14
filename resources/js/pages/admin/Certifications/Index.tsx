import { formatMonth } from "../../../lib/format";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface Certification {
    id: number;
    name: string;
    issuer: string;
    issue_date: string | null;
    expiry_date: string | null;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<Certification>;
    filters: { search: string };
}

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / CONTENT"
        title="Certifications"
        subtitle="Credentials and certificates you have earned."
        baseUrl="/admin/certifications"
        records={records}
        search={filters.search}
        searchPlaceholder="Search certifications"
        nameOf={(certification) => certification.name}
        addLabel="Add certification"
        emptyTitle="No certifications yet"
        emptyText="Add a certification to show it on your portfolio."
        columns={[
            { label: "Certification", render: (certification) => <strong>{certification.name}</strong> },
            { label: "Issuer", render: (certification) => certification.issuer },
            { label: "Issued", secondary: true, render: (certification) => formatMonth(certification.issue_date) || "—" },
            { label: "Expires", secondary: true, render: (certification) => formatMonth(certification.expiry_date) || "—" },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
