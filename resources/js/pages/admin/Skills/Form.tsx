import { Link } from "@inertiajs/react";
import type { ReactNode } from "react";
import type { FormRecord, FormSection } from "../../../components/admin/fields";
import ResourceForm, { visibilitySection } from "../../../components/admin/fields";
import { AdminPage } from "../../../components/admin/ui";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

import type { MediaOption } from "../../../types";

interface Props {
    record: FormRecord | null;
    categories: { id: number; name: string }[];
    mediaLibrary: MediaOption[];
}

const Form: PageWithLayout<Props> = ({ record, categories, mediaLibrary }) => {
    const sections: FormSection[] = [
        {
            title: "Skill",
            fields: [
                { type: "text", name: "name", label: "Skill name", required: true, maxLength: 80 },
                {
                    type: "select",
                    name: "skill_category_id",
                    label: "Category",
                    required: true,
                    placeholder: "Choose a category",
                    options: categories.map((category) => ({ value: category.id, label: category.name })),
                },
                { type: "number", name: "proficiency", label: "Proficiency (%)", min: 0, max: 100, help: "Optional. Leave empty to show the skill without a level." },
                { type: "media", name: "media", label: "Icon or image", help: "Optional small image shown beside the skill name." },
            ],
        },
        visibilitySection("skill"),
    ];

    return (
        <AdminPage eyebrow="WORKSPACE / SKILLS" title={record ? "Edit skill" : "Add skill"} backUrl="/admin/skills" backLabel="Back to skills">
            {categories.length === 0 ? (
                <section className="projects-empty">
                    <div className="projects-empty-icon">+</div>
                    <h2>Create a category first</h2>
                    <p>Every skill belongs to a category such as Frontend or Databases.</p>
                    <Link href="/admin/skill-categories/create" className="projects-empty-link">
                        Add a category
                    </Link>
                </section>
            ) : (
                <ResourceForm
                    action={record ? `/admin/skills/${record.id}` : "/admin/skills"}
                    sections={sections}
                    record={record}
                    defaults={{ is_published: true }}
                    mediaLibrary={mediaLibrary}
                    submitLabel={record ? "Save changes" : "Create skill"}
                    cancelUrl="/admin/skills"
                />
            )}
        </AdminPage>
    );
};

Form.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Form;
