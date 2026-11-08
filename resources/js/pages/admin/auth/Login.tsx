import {Link} from '@inertiajs/react';

export default function Login() {
    return (
        <main className="admin-login">
            <Link href="/" className="btn btn-ghost back-home">
                ← Back to Home
            </Link>
            <div className="login-card">
                <h1>Login</h1>
                <p>Sign in to manage your portfolio</p>
                
                <form>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="Enter your email"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="Enter your password"
                        />
                    </div>

                    <button type="submit" className="btn btn-solid">
                        Sign In
                    </button>
                </form>
            </div>
        </main>
    );
}