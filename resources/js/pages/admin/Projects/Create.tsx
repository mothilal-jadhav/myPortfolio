import { Link, useForm } from "@inertiajs/react";
import type { FormEvent, ReactNode } from "react";
import AdminLayout from "../../../layouts/AdminLayout";
import type { PageWithLayout } from "../../../types/page";

interface ProjectForm {
    title: string;
    tag: string;
    description: string;
    github_url: string;
    hue: number;
}

const Create: PageWithLayout = () => {
    const { data, setData, post, errors } = useForm<ProjectForm>({
        title: "",
        tag: "",
        description: "",
        github_url: "",
        hue: 32,
    });

    function submit(e: FormEvent) {
        e.preventDefault();

        post("/admin/projects");
    }

    return (
        <div className="max-w-2xl p-8">
            <div className="mb-8">
                <Link
                    href="/admin/projects"
                    className="text-sm text-amber-500"
                >
                    ← Back to Projects
                </Link>

                <h1 className="mt-4 text-2xl font-bold">
                    Add New Project
                </h1>
            </div>

            <form onSubmit={submit} className="space-y-6">
                <div>
                    <label className="mb-2 block">Project Title</label>
                    <input
                        type="text"
                        value={data.title}
                        onChange={(e) => setData("title", e.target.value)}
                        className="w-full rounded-lg border p-3"
                    />
                    {errors.title && (
                        <p className="text-sm text-red-500">{errors.title}</p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block">Tag</label>
                    <input
                        type="text"
                        value={data.tag}
                        onChange={(e) => setData("tag", e.target.value)}
                        className="w-full rounded-lg border p-3"
                    />
                    {errors.tag && (
                        <p className="text-sm text-red-500">{errors.tag}</p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block">Description</label>
                    <textarea
                        value={data.description}
                        onChange={(e) =>
                            setData("description", e.target.value)
                        }
                        rows={5}
                        className="w-full rounded-lg border p-3"
                    />
                    {errors.description && (
                        <p className="text-sm text-red-500">
                            {errors.description}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block">GitHub Repository URL</label>
                    <input
                        type="url"
                        value={data.github_url}
                        onChange={(e) =>
                            setData("github_url", e.target.value)
                        }
                        className="w-full rounded-lg border p-3"
                    />
                    {errors.github_url && (
                        <p className="text-sm text-red-500">
                            {errors.github_url}
                        </p>
                    )}
                </div>

                <div>
                    <label className="mb-2 block">
                        Card Hue: {data.hue}°
                    </label>
                    <input
                        type="range"
                        min="0"
                        max="360"
                        value={data.hue}
                        onChange={(e) =>
                            setData("hue", Number(e.target.value))
                        }
                        className="w-full"
                    />
                </div>

                <button
                    type="submit"
                    className="rounded-lg bg-amber-500 px-5 py-3 font-medium text-black"
                >
                    Save Project
                </button>
            </form>
        </div>
    );
};

Create.layout = (page: ReactNode) => <AdminLayout>{page}</AdminLayout>;

export default Create;
