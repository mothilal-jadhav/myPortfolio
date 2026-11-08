import {Link, useForm} from '@inertiajs/react';

export default function Login() {
    const { data, setData, post, processing, errors } = useForm({
        email: '',
        password: '',
    });

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();

        post('/login');
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
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            value={data.password}
                            onChange={(e)=>setData('password',e.target.value)}
                            placeholder="Enter your password"
                        />
                        {errors.password && (<p className='error'>{errors.password}</p>)}
                    </div>

                    <button type="submit" className="btn btn-solid" disabled={processing}>
                        {processing ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>
        </main>
    );
}