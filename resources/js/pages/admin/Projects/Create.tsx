import type { ReactNode } from 'react';
import { AdminPage } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import type { PageWithLayout } from '../../../types/page';
import ProjectForm from './ProjectForm';
import type { ProjectFormOptions } from './ProjectForm';

const Create: PageWithLayout<ProjectFormOptions> = (options) => {
    return (
        <AdminPage
            eyebrow="WORKSPACE / PROJECTS"
            title="Add new project"
            subtitle="New projects start as drafts until you publish them."
            backUrl="/admin/projects"
            backLabel="Back to projects"
        >
            <ProjectForm project={null} {...options} />
        </AdminPage>
    );
};

Create.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Create;
