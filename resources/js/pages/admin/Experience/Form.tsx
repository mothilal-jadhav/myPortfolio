import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

interface Props {
    record: FormRecord | null;
    technologyOptions: string[];
}

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Freelance", "Internship", "Apprenticeship", "Volunteer"];

const Form: PageWithLayout<Props> = ({ record, technologyOptions }) => {
    const sections: FormSection[] = [
        {
            title: "Role",
            fields: [
                { type: "text", name: "job_title", label: "Job title", required: true, maxLength: 160 },
                { type: "text", name: "organisation", label: "Organisation", required: true, maxLength: 160 },
                { type: "text", name: "employment_type", label: "Employment type", maxLength: 60, suggestions: EMPLOYMENT_TYPES, placeholder: "e.g. Full-time" },
                { type: "text", name: "location", label: "Location", maxLength: 160 },
            ],
        },
        {
            title: "Dates",
            fields: [
                { type: "date", name: "start_date", label: "Start date", required: true },
                { type: "date", name: "end_date", label: "End date", disabledWhen: "is_current" },
                { type: "checkbox", name: "is_current", label: "I currently work here", clears: "end_date", full: true },
            ],
        },
        {
            title: "Details",
            fields: [
                { type: "textarea", name: "description", label: "Description", rows: 4 },
                { type: "list", name: "responsibilities", label: "Responsibilities", addLabel: "Add responsibility", placeholder: "One responsibility or achievement" },
                { type: "tags", name: "technologies", label: "Technologies used", suggestions: technologyOptions, placeholder: "Type a technology and press Enter" },
            ],
        },
        visibilitySection("experience"),
    ];

    return (
        <AdminPage
            eyebrow="WORKSPACE / EXPERIENCE"
            title={record ? "Edit experience" : "Add experience"}
            backUrl="/admin/experiences"
            backLabel="Back to experience"
        >
            <ResourceForm
                action={record ? `/admin/experiences/${record.id}` : "/admin/experiences"}
                sections={sections}
                record={record}
                defaults={{ is_published: true }}
                submitLabel={record ? "Save changes" : "Create experience"}
                cancelUrl="/admin/experiences"
            />
        </AdminPage>
    );
};

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
