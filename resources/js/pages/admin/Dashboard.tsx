import { Link } from '@inertiajs/react';

export default function Dashboard() {
    return (
        <main className="admin-dashboard">
            <aside className="admin-sidebar">
                <h2>My Portfolio</h2>

                <nav>
                    <Link href="/admin/dashboard" className="active">
                        Dashboard
                    </Link>

                    <a href="#">Projects</a>
                    <a href="#">Skills</a>
                    <a href="#">Experience</a>
                    <a href="#">Settings</a>
                </nav>
            </aside>

            <section className="admin-main">
                <header className="admin-header">
                    <div>
                        <h1>Dashboard</h1>
                        <p>Manage your portfolio content.</p>
                    </div>

                    <Link href="/" className="btn btn-ghost">
                        View Portfolio
                    </Link>
                </header>

                <section className="dashboard-welcome">
                    <h2>Welcome to your admin dashboard</h2>
                    <p>
                        This is where you will manage your portfolio
                        information.
                    </p>
                </section>

                <section className="dashboard-stats">
                    <article className="stat-card">
                        <h3>Projects</h3>
                        <p>0</p>
                        <span>Portfolio projects</span>
                    </article>

                    <article className="stat-card">
                        <h3>Skills</h3>
                        <p>0</p>
                        <span>Listed skills</span>
                    </article>

                    <article className="stat-card">
                        <h3>Experience</h3>
                        <p>0</p>
                        <span>Experience entries</span>
                    </article>
                </section>
            </section>
        </main>
    );
}