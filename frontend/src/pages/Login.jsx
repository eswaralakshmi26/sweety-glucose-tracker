import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { loginUser } from '../services/api';

function Login() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const data = await loginUser({
                email: formData.email.trim(),
                password: formData.password
            });


         

            // Store JWT token after successful login
            if (!data.token) {
                throw new Error('Login response did not contain an authentication token.');
            }

            localStorage.setItem('token', data.token);
            localStorage.setItem('user', JSON.stringify(data.user));

            navigate('/dashboard');

        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-container">

            <div className="auth-card">

                <div className="brand">
                    <h1>Sweety</h1>
                    <p>Take control of your glucose health.</p>
                </div>

                <h2>Welcome Back!</h2>
                <p className="subtitle">
                    Login to continue tracking your glucose levels.
                </p>

                {error && (
                    <div className="message error">{error}</div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Logging in...' : 'Login'}
                    </button>

                </form>

                <p className="auth-footer">
                    Don't have an account?
                    {' '}
                    <Link to="/register">Register</Link>
                </p>

            </div>

        </div>
    );
}

export default Login;