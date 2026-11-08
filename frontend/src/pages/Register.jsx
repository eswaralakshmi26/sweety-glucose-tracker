import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { registerUser } from '../services/api';

function Register() {
    const navigate = useNavigate();

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
    });

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);

    // Handle input changes
    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    // Handle registration
    const handleSubmit = async (e) => {
        e.preventDefault();

        setError('');
        setSuccess('');

        // Check password confirmation
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setLoading(true);

        try {
            const data = await registerUser({
                name: formData.name.trim(),
                email: formData.email.trim(),
                password: formData.password
            });

            
            setSuccess(data.message);

            setTimeout(() => {
                navigate('/login');
            }, 1200);

        } catch (error) {
            setError(error.message);

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

                <h2>Create Account</h2>

                <p className="subtitle">
                    Register to start tracking your glucose levels.
                </p>

                {error && (
                    <div className="message error">{error}</div>
                )}

                {success && (
                    <div className="message success">{success}</div>
                )}

                <form onSubmit={handleSubmit}>

                    <div className="form-group">
                        <label>Full Name</label>
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            maxLength={100}
                            required
                        />
                    </div>

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
                            placeholder="Create a password"
                            value={formData.password}
                            onChange={handleChange}
                            minLength={8}
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label>Confirm Password</label>
                        <input
                            type="password"
                            name="confirmPassword"
                            placeholder="Confirm your password"
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit" disabled={loading}>
                        {loading ? 'Creating Account...' : 'Create Account'}
                    </button>

                </form>

                <p className="auth-footer">
                    Already have an account?{' '}
                    <Link to="/login">Login</Link>
                </p>

            </div>

        </div>
    );
}

export default Register;