import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

import type { MediaOption } from "../../../types";

const sections: FormSection[] = [
    {
        title: "Achievement",
        fields: [
            { type: "text", name: "title", label: "Title", required: true, maxLength: 200, full: true },
            { type: "text", name: "issuer", label: "Issuing organisation", maxLength: 160 },
            { type: "date", name: "achieved_on", label: "Date" },
            { type: "textarea", name: "description", label: "Description", rows: 4 },
            { type: "media", name: "media", label: "Supporting image" },
        ],
    },
    visibilitySection("achievement"),
];

const Form: PageWithLayout<{ record: FormRecord | null; mediaLibrary: MediaOption[] }> = ({ record, mediaLibrary }) => (
    <AdminPage
        eyebrow="WORKSPACE / ACHIEVEMENTS"
        title={record ? "Edit achievement" : "Add achievement"}
        backUrl="/admin/achievements"
        backLabel="Back to achievements"
    >
        <ResourceForm
            action={record ? `/admin/achievements/${record.id}` : "/admin/achievements"}
            sections={sections}
            record={record}
            defaults={{ is_published: true }}
            mediaLibrary={mediaLibrary}
            submitLabel={record ? "Save changes" : "Create achievement"}
            cancelUrl="/admin/achievements"
        />
    </AdminPage>
);

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
