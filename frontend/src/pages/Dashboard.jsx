import { useEffect, useState, useRef } from 'react';
import {
    addGlucoseReading,
    getGlucoseReadings,
    updateGlucoseReading,
    deleteGlucoseReading
} from '../services/api';
import '../styles/Dashboard.css';

const TIME_SLOTS = [
    'Morning (fasting)',
    'After breakfast',
    'After lunch',
    'After dinner'
];

const getTodayDate = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(new Date());

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

const getReadingDate = (date) => {
    return new Intl.DateTimeFormat('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        timeZone: 'Asia/Kolkata'
    }).format(new Date(date));
};

const getIndiaDateInputValue = (value) => {
    const date = new Date(value);

    const parts = new Intl.DateTimeFormat('en-CA', {
        timeZone: 'Asia/Kolkata',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).formatToParts(date);

    const values = Object.fromEntries(
        parts.map(({ type, value }) => [type, value])
    );

    return `${values.year}-${values.month}-${values.day}`;
};

const Dashboard = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [readings, setReadings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [deletingId, setDeletingId] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingId, setEditingId] = useState(null);

    const successTimer = useRef(null);

    const [formData, setFormData] = useState({
        reading_date: getTodayDate(),
        time_slot: TIME_SLOTS[0],
        glucose_value: ''
    });

    const todayReadings = readings.filter(
        (reading) =>
            getReadingDate(reading.reading_date) ===
            getReadingDate(`${getTodayDate()}T00:00:00+05:30`)
    );

    const completedSlots = todayReadings.length;

    const fetchReadings = async () => {
        try {
            setLoading(true);
            setError('');

            const data = await getGlucoseReadings();
            setReadings(data.readings || []);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    };

    const showSuccess = (message) => {
        setSuccess(message);

        clearTimeout(successTimer.current);

        successTimer.current = setTimeout(() => {
            setSuccess('');
        }, 3000);
    };

    useEffect(() => {
        fetchReadings();

        return () => {
            clearTimeout(successTimer.current);
        };
    }, []);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setFormData((previous) => ({
            ...previous,
            [name]: value
        }));
    };

    const handleEdit = (reading) => {
        setEditingId(reading.id);

        setFormData({
            reading_date: getIndiaDateInputValue(reading.reading_date),
            time_slot: reading.time_slot,
            glucose_value: String(reading.glucose_value)
        });

        setError('');
        setSuccess('');

        document.getElementById('add-reading')?.scrollIntoView({
            behavior: 'smooth'
        });
    };

    const handleCancelEdit = () => {
        setEditingId(null);

        setFormData({
            reading_date: getTodayDate(),
            time_slot: TIME_SLOTS[0],
            glucose_value: ''
        });

        setError('');
    };

    const handleSubmit = async (event) => {
        event.preventDefault();

        setError('');
        setSuccess('');
        clearTimeout(successTimer.current);
        setSubmitting(true);

        try {
            const readingData = {
                ...formData,
                glucose_value: Number(formData.glucose_value)
            };

            let data;

            if (editingId) {
                data = await updateGlucoseReading(
                    editingId,
                    readingData
                );

                setEditingId(null);
            } else {
                data = await addGlucoseReading(readingData);
            }

            showSuccess(data.message);

            setFormData({
                reading_date: getTodayDate(),
                time_slot: TIME_SLOTS[0],
                glucose_value: ''
            });

            await fetchReadings();

        } catch (error) {
            setError(error.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (id) => {
        const confirmDelete = window.confirm(
            'Are you sure you want to delete this reading?'
        );

        if (!confirmDelete) return;

        setError('');
        setSuccess('');
        clearTimeout(successTimer.current);
        setDeletingId(id);

        try {
            const data = await deleteGlucoseReading(id);

            showSuccess(data.message);

            await fetchReadings();

        } catch (error) {
            setError(error.message);
        } finally {
            setDeletingId(null);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/';
    };

    return (
        <div className="dashboard-layout">

            <aside className="dashboard-sidebar">

                <div className="dashboard-brand">
                    <svg
                        className="dashboard-logo"
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
                </div>

                <div className="sidebar-section">

                    <p className="sidebar-label">MENU</p>

                    <a href="/dashboard" className="sidebar-link active">
                        <span className="sidebar-icon">▦</span>
                        Overview
                    </a>

                    <a href="#add-reading" className="sidebar-link">
                        <span className="sidebar-icon">＋</span>
                        Add Reading
                    </a>

                    <a href="#reading-history" className="sidebar-link">
                        <span className="sidebar-icon">◷</span>
                        Reading History
                    </a>

                </div>

                <div className="sidebar-bottom">

                    <div className="sidebar-help">
                        <div className="help-icon">♡</div>
                        <h3>Your health matters</h3>
                        <p>Keep track of your daily glucose readings.</p>
                    </div>

                    <button
                        className="sidebar-logout"
                        onClick={handleLogout}
                    >
                        <span>↪</span>
                        Logout
                    </button>

                </div>

            </aside>

            <main className="dashboard-main">

                <header className="dashboard-topbar">

                    <div>
                        <p className="topbar-label">SWEETY</p>
                        <h2>Dashboard</h2>
                    </div>

                    <div className="profile-info">

                        <div className="profile-avatar">
                            {user.name?.charAt(0).toUpperCase() || 'U'}
                        </div>

                        <div className="profile-details">
                            <strong>{user.name || 'User'}</strong>
                            <span>{user.email}</span>
                        </div>

                    </div>

                </header>

                <div className="dashboard-content">

                    <section className="welcome-section">

                        <div>

                            <p className="welcome-date">
                                {new Intl.DateTimeFormat('en-IN', {
                                    weekday: 'long',
                                    day: 'numeric',
                                    month: 'long',
                                    year: 'numeric',
                                    timeZone: 'Asia/Kolkata'
                                }).format(new Date())}
                            </p>

                            <h1>
                                Hello, {user.name?.split(' ')[0] || 'there'}!
                                <span> 👋</span>
                            </h1>

                            <p>
                                Welcome back! Here's your glucose tracking
                                overview.
                            </p>

                        </div>

                        <div className="welcome-decoration">
                            <span>♡</span>
                            <div className="decoration-line"></div>
                            <small>Take care of yourself</small>
                        </div>

                    </section>

                    <section className="summary-grid">

                        <div className="summary-card">

                            <div className="summary-card-top">
                                <div className="summary-icon red-icon">▤</div>
                                <span className="summary-tag">All time</span>
                            </div>

                            <p>Total Readings</p>
                            <h2>{readings.length}</h2>

                            <span className="summary-description">
                                Readings recorded
                            </span>

                        </div>

                        <div className="summary-card">

                            <div className="summary-card-top">
                                <div className="summary-icon peach-icon">◷</div>
                                <span className="summary-tag">Today</span>
                            </div>

                            <p>Today's Readings</p>
                            <h2>{todayReadings.length}</h2>

                            <span className="summary-description">
                                Readings added today
                            </span>

                        </div>

                        <div className="summary-card">

                            <div className="summary-card-top">
                                <div className="summary-icon green-icon">✓</div>
                                <span className="summary-tag">Daily goal</span>
                            </div>

                            <p>Completed Slots</p>
                            <h2>{completedSlots}/4</h2>

                            <span className="summary-description">
                                Daily time slots recorded
                            </span>

                        </div>

                    </section>

                    <section
                        className="dashboard-section"
                        id="add-reading"
                    >

                        <div className="section-heading">

                            <div>
                                <span className="section-eyebrow">
                                    DAILY TRACKING
                                </span>

                                <h2>Add Glucose Reading</h2>

                                <p>
                                    Record your blood glucose level for a
                                    selected time slot.
                                </p>
                            </div>

                        </div>

                        <form
                            className="reading-form"
                            onSubmit={handleSubmit}
                        >

                            <div className="form-group">

                                <label htmlFor="reading_date">
                                    Reading Date
                                </label>

                                <input
                                    type="date"
                                    id="reading_date"
                                    name="reading_date"
                                    value={formData.reading_date}
                                    max={getTodayDate()}
                                    onChange={handleChange}
                                    required
                                />

                            </div>

                            <div className="form-group">

                                <label htmlFor="time_slot">
                                    Time Slot
                                </label>

                                <select
                                    id="time_slot"
                                    name="time_slot"
                                    value={formData.time_slot}
                                    onChange={handleChange}
                                    required
                                >

                                    {TIME_SLOTS.map((slot) => (
                                        <option key={slot} value={slot}>
                                            {slot}
                                        </option>
                                    ))}

                                </select>

                            </div>

                            <div className="form-group">

                                <label htmlFor="glucose_value">
                                    Glucose Level
                                </label>

                                <div className="glucose-input-wrapper">

                                    <input
                                        type="number"
                                        id="glucose_value"
                                        name="glucose_value"
                                        value={formData.glucose_value}
                                        onChange={handleChange}
                                        placeholder="e.g. 110"
                                        min="40"
                                        max="600"
                                        step="1"
                                        required
                                    />

                                    <span>mg/dL</span>

                                </div>

                            </div>

                            <div className="form-actions">

                                <button
                                    type="submit"
                                    className="save-reading-btn"
                                    disabled={submitting}
                                >
                                    {submitting
                                        ? 'Saving...'
                                        : editingId
                                            ? 'Update Reading'
                                            : 'Save Reading'}
                                </button>

                                {editingId && (
                                    <button
                                        type="button"
                                        className="cancel-edit-btn"
                                        onClick={handleCancelEdit}
                                    >
                                        Cancel
                                    </button>
                                )}

                            </div>

                        </form>

                        {error && (
                            <div className="dashboard-alert error-alert">
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className="dashboard-alert success-alert">
                                {success}
                            </div>
                        )}

                    </section>

                    <section
                        className="dashboard-section history-section"
                        id="reading-history"
                    >

                        <div className="section-heading history-heading">

                            <div>

                                <span className="section-eyebrow">
                                    YOUR RECORDS
                                </span>

                                <h2>Reading History</h2>

                                <p>
                                    View and manage your previous glucose
                                    readings.
                                </p>

                            </div>

                            <span className="history-count">
                                {readings.length} Records
                            </span>

                        </div>

                        {loading ? (

                            <div className="empty-state">
                                <p>Loading your readings...</p>
                            </div>

                        ) : readings.length === 0 ? (

                            <div className="empty-state">

                                <div className="empty-icon">♡</div>

                                <h3>No readings yet</h3>

                                <p>
                                    Your glucose readings will appear here
                                    after you add your first record.
                                </p>

                            </div>

                        ) : (

                            <div className="table-wrapper">

                                <table className="readings-table">

                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time Slot</th>
                                            <th>Glucose Level</th>
                                            <th>Action</th>
                                        </tr>
                                    </thead>

                                    <tbody>

                                        {readings.map((reading) => (

                                            <tr key={reading.id}>

                                                <td className="reading-date">
                                                    {getReadingDate(
                                                        reading.reading_date
                                                    )}
                                                </td>

                                                <td>
                                                    <span className="time-slot-badge">
                                                        {reading.time_slot}
                                                    </span>
                                                </td>

                                                <td>

                                                    <strong className="glucose-value">
                                                        {reading.glucose_value}
                                                    </strong>

                                                    <span className="glucose-unit">
                                                        mg/dL
                                                    </span>

                                                </td>

                                                <td>

                                                    <div className="action-buttons">

                                                        <button
                                                            type="button"
                                                            className="icon-action-btn"
                                                            onClick={() =>
                                                                handleEdit(reading)
                                                            }
                                                            title="Edit reading"
                                                            aria-label="Edit reading"
                                                        >

                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                width="19"
                                                                height="19"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M12 20h9" />
                                                                <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
                                                            </svg>

                                                        </button>

                                                        <button
                                                            type="button"
                                                            className="icon-action-btn"
                                                            onClick={() =>
                                                                handleDelete(reading.id)
                                                            }
                                                            disabled={
                                                                deletingId === reading.id
                                                            }
                                                            title="Delete reading"
                                                            aria-label="Delete reading"
                                                        >

                                                            <svg
                                                                viewBox="0 0 24 24"
                                                                width="19"
                                                                height="19"
                                                                fill="none"
                                                                stroke="currentColor"
                                                                strokeWidth="2"
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                            >
                                                                <path d="M3 6h18" />
                                                                <path d="M8 6V4h8v2" />
                                                                <path d="M19 6l-1 14H6L5 6" />
                                                                <path d="M10 11v5" />
                                                                <path d="M14 11v5" />
                                                            </svg>

                                                        </button>

                                                    </div>

                                                </td>

                                            </tr>

                                        ))}

                                    </tbody>

                                </table>

                            </div>

                        )}

                    </section>

                    <footer className="dashboard-footer">
                        <p>© 2026 Sweety. Your health, your priority.</p>
                    </footer>

                </div>

            </main>

        </div>
    );
};

export default Dashboard;