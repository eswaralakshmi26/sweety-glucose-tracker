import { useEffect, useState } from 'react';
import {
    getDailyReport,
    getMonthToDateReport,
    getPreviousMonthReport
} from '../services/api';
import '../styles/Reports.css';

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

const formatDate = (date) => {
    if (!date) return '-';

    const dateString = String(date).split('T')[0];
    const [year, month, day] = dateString.split('-');

    return `${day}-${month}-${year}`;
};

const Reports = () => {
    const [reportType, setReportType] = useState('daily');
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const generateReport = async () => {
        try {
            setLoading(true);
            setError('');

            let response;

            if (reportType === 'daily') {
                response = await getDailyReport(selectedDate);
            } else if (reportType === 'month-to-date') {
                response = await getMonthToDateReport(selectedDate);
            } else {
                response = await getPreviousMonthReport();
            }

            setReport(response);

        } catch (err) {
            setReport(null);
            setError(err.message || 'Unable to generate report.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        generateReport();
    }, []);

    const summary = report?.summary;

    return (
        <div className="reports-page">

            <section className="reports-heading">
                <div>
                    <span className="reports-eyebrow">YOUR HEALTH OVERVIEW</span>
                    <h1>Reports & Statistics</h1>
                    <p>
                        Track and review your blood glucose readings over
                        different time periods.
                    </p>
                </div>

                <div className="reports-heading-icon">▤</div>
            </section>

            <section className="report-filter-section">

                <div className="report-filter-heading">
                    <div>
                        <span className="reports-section-label">
                            REPORT SETTINGS
                        </span>
                        <h2>Generate Report</h2>
                        <p>
                            Select a report type and date to view your
                            statistics.
                        </p>
                    </div>
                </div>

                <div className="report-type-options">

                    <button
                        type="button"
                        className={`report-type-btn ${
                            reportType === 'daily' ? 'active' : ''
                        }`}
                        onClick={() => setReportType('daily')}
                    >
                        <span>◷</span>
                        Daily Report
                    </button>

                    <button
                        type="button"
                        className={`report-type-btn ${
                            reportType === 'month-to-date' ? 'active' : ''
                        }`}
                        onClick={() => setReportType('month-to-date')}
                    >
                        <span>▦</span>
                        Month-to-Date
                    </button>

                    <button
                        type="button"
                        className={`report-type-btn ${
                            reportType === 'previous-month' ? 'active' : ''
                        }`}
                        onClick={() => setReportType('previous-month')}
                    >
                        <span>▤</span>
                        Previous Month
                    </button>

                </div>

                <div className="report-filter-bottom">

                    {reportType !== 'previous-month' ? (
                        <div className="report-date-filter">
                            <label htmlFor="report-date">
                                Select Date
                            </label>

                            <input
                                type="date"
                                id="report-date"
                                value={selectedDate}
                                max={getTodayDate()}
                                onChange={(event) =>
                                    setSelectedDate(event.target.value)
                                }
                            />
                        </div>
                    ) : (
                        <div className="previous-month-note">
                            Showing the previous calendar month.
                        </div>
                    )}

                    <button
                        type="button"
                        className="generate-report-btn"
                        onClick={generateReport}
                        disabled={loading}
                    >
                        {loading ? 'Generating...' : 'Generate Report'}
                        <span>→</span>
                    </button>

                </div>

            </section>

            {error && (
                <div className="report-error">
                    <span>!</span>
                    {error}
                </div>
            )}

            {loading && (
                <div className="report-loading">
                    <div className="report-spinner"></div>
                    <p>Generating your report...</p>
                </div>
            )}

            {!loading && report && (
                <>

                    <div className="report-period">
                        <div>
                            <span className="reports-section-label">
                                REPORT SUMMARY
                            </span>
                            <h2>{report.reportType}</h2>
                            <p>
                                {formatDate(report.startDate)}
                                {' — '}
                                {formatDate(report.endDate)}
                            </p>
                        </div>

                        <span className="report-period-badge">
                            {summary.totalReadings} Records
                        </span>
                    </div>

                    <section className="report-summary-grid">

                        <div className="report-summary-card highest-card">
                            <div className="report-card-top">
                                <div className="summary-card-icon">↑</div>
                                <span className="report-card-indicator">
                                    Highest
                                </span>
                            </div>
                            <p>Highest Reading</p>
                            <h3>
                                {summary.highest ?? '--'}
                                <span> mg/dL</span>
                            </h3>
                        </div>

                        <div className="report-summary-card lowest-card">
                            <div className="report-card-top">
                                <div className="summary-card-icon">↓</div>
                                <span className="report-card-indicator">
                                    Lowest
                                </span>
                            </div>
                            <p>Lowest Reading</p>
                            <h3>
                                {summary.lowest ?? '--'}
                                <span> mg/dL</span>
                            </h3>
                        </div>

                        <div className="report-summary-card average-card">
                            <div className="report-card-top">
                                <div className="summary-card-icon">≈</div>
                                <span className="report-card-indicator">
                                    Average
                                </span>
                            </div>
                            <p>Average Reading</p>
                            <h3>
                                {summary.average === null
                                    ? '--'
                                    : Number(summary.average).toFixed(1)}
                                <span> mg/dL</span>
                            </h3>
                        </div>

                        <div className="report-summary-card total-card">
                            <div className="report-card-top">
                                <div className="summary-card-icon">#</div>
                                <span className="report-card-indicator">
                                    Total
                                </span>
                            </div>
                            <p>Total Readings</p>
                            <h3>{summary.totalReadings}</h3>
                        </div>

                    </section>

                    <section className="report-history-section">

                        <div className="report-history-heading">
                            <div>
                                <span className="reports-section-label">
                                    YOUR RECORDS
                                </span>
                                <h2>Reading History</h2>
                                <p>
                                    Glucose readings recorded during this
                                    reporting period.
                                </p>
                            </div>

                            <span className="report-count">
                                {summary.totalReadings} Readings
                            </span>
                        </div>

                        {report.readings.length === 0 ? (

                            <div className="report-empty-state">
                                <div className="empty-report-icon">▤</div>
                                <h3>No Readings Available</h3>
                                <p>
                                    There are no glucose readings for this
                                    reporting period. Try selecting another
                                    date or report period.
                                </p>
                            </div>

                        ) : (

                            <div className="report-table-wrapper">
                                <table className="report-table">

                                    <thead>
                                        <tr>
                                            <th>Date</th>
                                            <th>Time Slot</th>
                                            <th>Glucose Value</th>
                                        </tr>
                                    </thead>

                                    <tbody>
                                        {report.readings.map((reading) => (
                                            <tr key={reading.id}>
                                                <td className="report-date-cell">
                                                    {formatDate(reading.reading_date)}
                                                </td>

                                                <td>
                                                    <span className="report-time-slot">
                                                        {reading.time_slot}
                                                    </span>
                                                </td>

                                                <td>
                                                    <span className="report-glucose-value">
                                                        {reading.glucose_value}
                                                        <small> mg/dL</small>
                                                    </span>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>

                                </table>
                            </div>

                        )}

                    </section>

                </>
            )}

        </div>
    );
};

export default Reports;