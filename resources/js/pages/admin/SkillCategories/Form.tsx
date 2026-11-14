import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

import { CATEGORY_ICONS } from "../../../lib/icons";

const sections: FormSection[] = [
    {
        title: "Category",
        fields: [
            { type: "text", name: "name", label: "Name", required: true, maxLength: 80, full: true, placeholder: "e.g. Frontend" },
            { type: "textarea", name: "description", label: "Description", rows: 2, maxLength: 300, help: "Optional line shown under the category name." },
            { type: "icon", name: "icon", label: "Icon", icons: CATEGORY_ICONS },
        ],
    },
    visibilitySection("category"),
];

const Form: PageWithLayout<{ record: FormRecord | null }> = ({ record }) => (
    <AdminPage
        eyebrow="WORKSPACE / SKILLS"
        title={record ? "Edit category" : "Add category"}
        backUrl="/admin/skill-categories"
        backLabel="Back to categories"
    >
        <ResourceForm
            action={record ? `/admin/skill-categories/${record.id}` : "/admin/skill-categories"}
            sections={sections}
            record={record}
            defaults={{ is_published: true }}
            submitLabel={record ? "Save changes" : "Create category"}
            cancelUrl="/admin/skill-categories"
        />
    </AdminPage>
);

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
