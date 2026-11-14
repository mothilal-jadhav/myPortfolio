import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

const sections: FormSection[] = [
    {
        title: "Programme",
        fields: [
            { type: "text", name: "institution", label: "Institution", required: true, maxLength: 160 },
            { type: "text", name: "degree", label: "Degree", required: true, maxLength: 160 },
            { type: "text", name: "field_of_study", label: "Field of study", maxLength: 160 },
            { type: "text", name: "location", label: "Location", maxLength: 160 },
            { type: "text", name: "grade", label: "Grade or CGPA", maxLength: 60 },
        ],
    },
    {
        title: "Dates",
        fields: [
            { type: "date", name: "start_date", label: "Start date", required: true },
            { type: "date", name: "end_date", label: "End date", disabledWhen: "is_current" },
            { type: "checkbox", name: "is_current", label: "I am currently studying here", clears: "end_date", full: true },
        ],
    },
    {
        title: "Details",
        fields: [{ type: "textarea", name: "description", label: "Description", rows: 4 }],
    },
    visibilitySection("record"),
];

const Form: PageWithLayout<{ record: FormRecord | null }> = ({ record }) => (
    <AdminPage eyebrow="WORKSPACE / EDUCATION" title={record ? "Edit education" : "Add education"} backUrl="/admin/education" backLabel="Back to education">
        <ResourceForm
            action={record ? `/admin/education/${record.id}` : "/admin/education"}
            sections={sections}
            record={record}
            defaults={{ is_published: true }}
            submitLabel={record ? "Save changes" : "Create record"}
            cancelUrl="/admin/education"
        />
    </AdminPage>
);

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
