import {Link, useForm} from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post('/login', { onFinish: () => setData('password', '') });
    }

    return (
        <main className="admin-login">
            <Link href="/" className="btn btn-ghost back-home">
                ← Back to Home
            </Link>
            <div className="login-card">
                <h1>Login</h1>
                <p>Sign in to manage your portfolio</p>
                
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            value={data.email}
                            onChange={(e)=>setData('email', e.target.value)}
                            placeholder="Enter your email"
                            autoComplete="username"
                            autoFocus
                            required
                            aria-invalid={errors.email ? true : undefined}
                        />
                        {errors.email && (<p className='error' role="alert">{errors.email}</p>)}
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={data.password}
                            onChange={(e)=>setData('password',e.target.value)}
                            placeholder="Enter your password"
                            autoComplete="current-password"
                            required
                            aria-invalid={errors.password ? true : undefined}
                        />
                        {errors.password && (<p className='error' role="alert">{errors.password}</p>)}
                    </div>

                    <button type="submit" className="btn btn-solid" disabled={processing}>
                        {processing ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </main>
    );
}