import { displayUrl } from "../../../lib/format";
import ResourceIndex from "../../../components/admin/ResourceIndex";
import AdminLayout from "../../../layouts/AdminLayout";
import type { Paginated } from "../../../types";
import type { PageWithLayout } from "../../../types/page";

interface SocialLink {
    id: number;
    platform: string;
    url: string;
    is_published: boolean;
    sort_order: number;
}

interface Props {
    records: Paginated<SocialLink>;
    filters: { search: string };
}

const Index: PageWithLayout<Props> = ({ records, filters }) => (
    <ResourceIndex
        eyebrow="WORKSPACE / CONTENT"
        title="Social links"
        subtitle="Profiles shown in the contact section and footer. Use the arrows to reorder them."
        baseUrl="/admin/social-links"
        records={records}
        search={filters.search}
        searchPlaceholder="Search links"
        nameOf={(link) => link.platform}
        addLabel="Add link"
        emptyTitle="No social links yet"
        emptyText="Add links to the profiles you want visitors to find."
        columns={[
            { label: "Platform", render: (link) => <strong>{link.platform}</strong> },
            {
                label: "URL",
                render: (link) => (
                    <a href={link.url} target="_blank" rel="noopener noreferrer" className="admin-link">
                        {displayUrl(link.url)}
                    </a>
                ),
            },
        ]}
    />
);

Index.layout = (page) => <AdminLayout>{page}</AdminLayout>;

export default Index;
