import { Link } from 'react-router-dom';
import '../styles/Home.css';

const Home = () => {
    return (
        <div className="home-page">

            {/* Navigation Bar */}
            <header className="home-navbar">

                <Link to="/" className="home-logo">

                    <svg
                        className="logo-symbol"
                        viewBox="0 0 48 48"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            d="M24 43C20 39 4 28 4 16C4 8 10 4 17 4C20 4 23 6 24 10C27 6 30 4 34 4C41 4 45 9 45 16C45 28 29 39 24 43Z"
                            fill="#C1121F"
                        />

                        <path
                            d="M9 24H16L20 17L25 31L30 21L33 25H40"
                            fill="none"
                            stroke="white"
                            strokeWidth="2.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                    <span>Sweety</span>
                </Link>

                <nav className="home-nav-links">
                    <a href="#features">Features</a>
                    <a href="#about">About</a>
                </nav>

                <div className="home-nav-buttons">
                    <Link to="/login" className="login-btn">
                        Login
                    </Link>

                    <Link to="/register" className="nav-register-btn">
                        Get Started
                    </Link>
                </div>

            </header>


            <main>

                <section className="hero-section">

                    <div className="hero-content">

                        <span className="hero-tag">
                            YOUR HEALTH, YOUR CONTROL
                        </span>

                        <h1>
                            Take Control of Your
                            <span> Blood Glucose</span>
                        </h1>

                        <p>
                            Monitor your daily blood glucose levels,
                            track your progress, and understand your
                            health patterns with Sweety.
                        </p>

                        <div className="hero-buttons">

                            <Link to="/register" className="primary-btn">
                                Get Started
                                <span> → </span>
                            </Link>

                            <Link to="/login" className="secondary-btn">
                                I already have an account
                            </Link>

                        </div>

                        <div className="hero-note">
                            Simple tracking. Better awareness. Healthier habits.
                        </div>

                    </div>



                    <div className="hero-image">

                        <div className="illustration-card">

                            <div className="illustration-top">
                                <span>Glucose Monitor</span>
                                <span className="status-dot"></span>
                            </div>

                            <div className="glucose-circle">
                                <div className="drop-icon">♥</div>
                                <h2>120</h2>
                                <p>mg/dL</p>
                            </div>

                            <div className="illustration-bottom">
                                <div>
                                    <span className="small-label">
                                        Daily Tracking
                                    </span>
                                    <strong>Stay Informed</strong>
                                </div>

                                <div className="pulse-icon">
                                    ♡
                                </div>
                            </div>

                        </div>

                        <div className="floating-card">
                            <span className="floating-icon">✓</span>
                            <div>
                                <strong>Track Daily</strong>
                                <p>Your readings, organized.</p>
                            </div>
                        </div>

                    </div>

                </section>


                {/* Features Section */}
                <section className="features-section" id="features">

                    <div className="section-heading">
                        <span>WHAT SWEETY OFFERS</span>
                        <h2>Everything You Need to Track</h2>
                        <p>
                            Keep your glucose records organized in one place.
                        </p>
                    </div>


                    <div className="features-container">

                        <div className="feature-card">
                            <div className="feature-icon">📊</div>
                            <h3>Daily Tracking</h3>
                            <p>
                                Record your blood glucose readings
                                throughout the day.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">📈</div>
                            <h3>Reports & Statistics</h3>
                            <p>
                                View your highest, lowest, and average
                                glucose readings.
                            </p>
                        </div>

                        <div className="feature-card">
                            <div className="feature-icon">🔒</div>
                            <h3>Personal Records</h3>
                            <p>
                                Keep your glucose records private
                                with secure user authentication.
                            </p>
                        </div>

                    </div>

                </section>

            </main>


            {/* Footer */}
            <footer className="home-footer">
                <p>
                    © 2026 Sweety - Blood Glucose Tracker.
                    Your health tracking companion.
                </p>
            </footer>

        </div>
    );
};

export default Home;