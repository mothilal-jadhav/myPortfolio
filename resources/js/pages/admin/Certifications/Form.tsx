import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

import type { MediaOption } from "../../../types";

const sections: FormSection[] = [
    {
        title: "Certification",
        fields: [
            { type: "text", name: "name", label: "Certification name", required: true, maxLength: 200 },
            { type: "text", name: "issuer", label: "Issuing organisation", required: true, maxLength: 160 },
            { type: "date", name: "issue_date", label: "Issue date" },
            { type: "date", name: "expiry_date", label: "Expiration date", help: "Leave empty if it does not expire." },
            { type: "text", name: "credential_id", label: "Credential ID", maxLength: 160 },
            { type: "url", name: "credential_url", label: "Credential URL", placeholder: "https://…" },
            { type: "media", name: "media", label: "Certificate image or PDF", accept: "document" },
        ],
    },
    visibilitySection("certification"),
];

const Form: PageWithLayout<{ record: FormRecord | null; mediaLibrary: MediaOption[] }> = ({ record, mediaLibrary }) => (
    <AdminPage
        eyebrow="WORKSPACE / CERTIFICATIONS"
        title={record ? "Edit certification" : "Add certification"}
        backUrl="/admin/certifications"
        backLabel="Back to certifications"
    >
        <ResourceForm
            action={record ? `/admin/certifications/${record.id}` : "/admin/certifications"}
            sections={sections}
            record={record}
            defaults={{ is_published: true }}
            mediaLibrary={mediaLibrary}
            submitLabel={record ? "Save changes" : "Create certification"}
            cancelUrl="/admin/certifications"
        />
    </AdminPage>
);

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
