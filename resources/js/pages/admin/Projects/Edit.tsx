import type { ReactNode } from 'react';
import type { FormRecord } from '../../../components/admin/fields';
import { AdminPage, Badge } from '../../../components/admin/ui';
import AdminLayout from '../../../layouts/AdminLayout';
import type { PageWithLayout } from '../../../types/page';
import ProjectForm from './ProjectForm';
import type { ProjectFormOptions } from './ProjectForm';

interface Props extends ProjectFormOptions {
    project: FormRecord & { id: number; title: string; status: string };
}

const Edit: PageWithLayout<Props> = ({ project, ...options }) => {
    return (
        <AdminPage
            eyebrow="WORKSPACE / PROJECTS"
            title={project.title}
            backUrl="/admin/projects"
            backLabel="Back to projects"
            actions={<Badge tone={project.status === 'published' ? 'live' : 'draft'}>{project.status === 'published' ? 'Published' : 'Draft'}</Badge>}
        >
            <ProjectForm key={project.id} project={project} {...options} />
        </AdminPage>
    );
};

Edit.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Edit;
