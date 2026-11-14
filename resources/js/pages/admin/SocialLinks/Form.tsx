import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

import { SOCIAL_ICONS } from "../../../lib/icons";

const sections: FormSection[] = [
    {
        title: "Link",
        fields: [
            { type: "text", name: "platform", label: "Platform name", required: true, maxLength: 60, placeholder: "e.g. GitHub" },
            { type: "url", name: "url", label: "URL", required: true, placeholder: "https://…" },
            { type: "icon", name: "icon", label: "Icon", icons: SOCIAL_ICONS, help: "Links without an icon use the generic link icon." },
        ],
    },
    visibilitySection("link"),
];

const Form: PageWithLayout<{ record: FormRecord | null }> = ({ record }) => (
    <AdminPage eyebrow="WORKSPACE / SOCIAL LINKS" title={record ? "Edit link" : "Add link"} backUrl="/admin/social-links" backLabel="Back to social links">
        <ResourceForm
            action={record ? `/admin/social-links/${record.id}` : "/admin/social-links"}
            sections={sections}
            record={record}
            defaults={{ is_published: true }}
            submitLabel={record ? "Save changes" : "Create link"}
            cancelUrl="/admin/social-links"
        />
    </AdminPage>
);

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
