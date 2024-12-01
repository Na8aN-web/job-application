import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { Chart as ChartJS, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { Bar } from 'react-chartjs-2';
import * as XLSX from 'xlsx';
import html2canvas from 'html2canvas';
import DashboardLayout from '../layouts/DashboardLayout';

// Register Chart.js components
ChartJS.register(Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const statusLabels = {
    ApplicationDeclined: "Job Applications Declined",
    UnderReview: "Job Under Review",
    InterviewCompleted: "Job Interviews Completed",
    ApplicationAccepted: "Job Offers Received",
    InterviewScheduled: "Job Interviews Scheduled",
    ApplicationInProgress: "Job Applications in Progress",
    ApplicationSubmitted: "Job Applications Submitted",
    Assessment: "Assessments to-do",
};

const milestones = [
    {
        id: 1,
        title: "Applications Submitted",
        countCondition: (jobs) => jobs.length, // Total number of jobs
    },
    {
        id: 2,
        title: "Interviews Scheduled",
        countCondition: (jobs) => jobs.filter((job) => job.status === "InterviewScheduled").length,
    },
    {
        id: 3,
        title: "Job Offers Received",
        countCondition: (jobs) => jobs.filter((job) => job.status === "ApplicationAccepted").length,
    },
];

const Dashboard = () => {
    const { userData } = useSelector((state) => state.user);
    const [jobsList, setJobsList] = useState([]);
    const [filteredJobs, setFilteredJobs] = useState([]);
    const [filteredJobStatusData, setFilteredJobStatusData] = useState([]);
    const [selectedCompany, setSelectedCompany] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('');
    const [companyColors, setCompanyColors] = useState({});
    const [currentPage, setCurrentPage] = useState(1);
    const [achievedMilestones, setAchievedMilestones] = useState([]);
    const [successRate, setSuccessRate] = useState(0); // State for Success Rate
    const [rejectionRate, setRejectionRate] = useState(0); // State for Rejection Rate
    const [showRates, setShowRates] = useState(true); // Toggle state for both rates

    const [rejectedJobs, setRejectedJobs] = useState([]); // State for rejected jobs and their previous statuses
    const [isModalOpen, setIsModalOpen] = useState(false); // State for modal visibility
    const [statusHistory, setStatusHistory] = useState({}); // State to store job status history

    const chartRef = useRef(null);
    const jobsPerPage = 10;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobsList = async () => {
            try {
                const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/auth/jobs`;
                const response = await fetch(apiUrl, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                if (!response.ok) {
                    throw new Error(`API responded with status ${response.status}`);
                }
                const data = await response.json();
                console.log(data)
                setJobsList(data);

                // Update status history dynamically
                // const newStatusHistory = {};
                // data.forEach((job) => {
                //     newStatusHistory[job._id] = job.status;
                // });
                // setStatusHistory((prevHistory) => ({ ...prevHistory, ...newStatusHistory })); // Ensure incremental updates

                setFilteredJobs(data);
                const uniqueCompanies = [...new Set(data.map((job) => job.companyName))];
                const colors = {};
                uniqueCompanies.forEach((company, index) => {
                    colors[company] = `hsl(${index * 45}, 70%, 50%)`;
                });
                setCompanyColors(colors);
                updateJobStatusData(data);
                computeMilestoneCounts(data);
                computeRates(data); // Calculate Success and Rejection Rates
            } catch (error) {
                console.error('Failed to fetch jobs list:', error);
            }
        };

        fetchJobsList();
    }, []);


    useEffect(() => {
        let filtered = jobsList;

        if (selectedCompany) {
            filtered = filtered.filter((job) => job.companyName === selectedCompany);
        }

        if (selectedStatus) {
            filtered = filtered.filter((job) => job.status === selectedStatus);
        }

        filtered = filtered.sort((a, b) => a.companyName.localeCompare(b.companyName));

        setFilteredJobs(filtered);
        updateJobStatusData(filtered);
        setCurrentPage(1);
    }, [selectedCompany, selectedStatus, jobsList]);

    const updateJobStatusData = (data) => {
        const statusCounts = data.reduce((acc, job) => {
            const status = job.status;
            acc[status] = (acc[status] || 0) + 1;
            return acc;
        }, {});
        setFilteredJobStatusData(
            Object.entries(statusCounts).map(([status, count]) => ({
                status: statusLabels[status] || status,
                count,
            }))
        );
    };

    const computeMilestoneCounts = (jobs) => {
        const updatedMilestones = milestones.map((milestone) => ({
            ...milestone,
            count: milestone.countCondition(jobs),
        }));
        setAchievedMilestones(updatedMilestones);
    };

    const computeRates = (jobs) => {
        const totalApplications = jobs.length;
        const rejected = jobs.filter((job) => job.status === "ApplicationDeclined");

        // Ensure `previousStatus` is correctly fetched from updated `statusHistory`
        const rejectedJobsWithHistory = rejected.map((job) => ({
            job,
            // previousStatus: statusHistory[job._id] || "Unknown", // Use the most recent history
        }));

        setRejectedJobs(rejectedJobsWithHistory); // Update modal data immediately

        const jobOffers = jobs.filter((job) => job.status === "ApplicationAccepted").length;
        const rejections = rejected.length;

        const successPercentage = totalApplications > 0 ? ((jobOffers / totalApplications) * 100).toFixed(2) : 0;
        const rejectionPercentage = totalApplications > 0 ? ((rejections / totalApplications) * 100).toFixed(2) : 0;

        setSuccessRate(successPercentage);
        setRejectionRate(rejectionPercentage);
    };

    useEffect(() => {
        const rejectedJobsWithHistory = jobsList
            .filter((job) => job.status === "ApplicationDeclined")
            .map((job) => ({
                ...job,
            }));
        setRejectedJobs(rejectedJobsWithHistory);
    }, [jobsList, statusHistory]); // Re-calculate when jobsList or statusHistory changes
    


    const toggleRates = () => {
        setShowRates(!showRates);
    };

    const handleFilterChange = (e) => {
        setSelectedCompany(e.target.value);
        setSelectedStatus(''); // Reset status filter
    };

    const handleRejectionCardClick = () => {
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
    };

    const exportToExcel = () => {
        const worksheet = XLSX.utils.json_to_sheet(
            rejectedJobs.map((job) => ({
                Title: job.title,
                Company: job.companyName,
                'Previous Status': job.previousStatus,
                'Rejection Date': new Date(job.dateApplied).toLocaleDateString(),
            }))
        );
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Rejected Jobs');
        XLSX.writeFile(workbook, 'RejectedJobs.xlsx');
    };

    const exportChartToPNG = () => {
        const chartElement = chartRef.current.canvas;
        html2canvas(chartElement).then((canvas) => {
            const link = document.createElement('a');
            link.download = 'JobsChart.png';
            link.href = canvas.toDataURL();
            link.click();
        });
    };

    const indexOfLastJob = currentPage * jobsPerPage;
    const indexOfFirstJob = indexOfLastJob - jobsPerPage;
    const currentJobs = filteredJobs.slice(indexOfFirstJob, indexOfLastJob);

    const handleNextPage = () => {
        if (currentPage < Math.ceil(filteredJobs.length / jobsPerPage)) {
            setCurrentPage(currentPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    // Define barChartData and chartOptions within the component
    const barChartData = {
        labels: selectedCompany
            ? [selectedCompany]
            : [...new Set(jobsList.map((job) => job.companyName))],
        datasets: [
            {
                label: 'Jobs by Company',
                data: selectedCompany
                    ? [filteredJobs.length]
                    : [...new Set(jobsList.map((job) => job.companyName))].map(
                        (company) =>
                            jobsList.filter((job) => job.companyName === company).length
                    ),
                backgroundColor: selectedCompany
                    ? [companyColors[selectedCompany]]
                    : [...new Set(jobsList.map((job) => companyColors[job.companyName]))],
                hoverBackgroundColor: selectedCompany
                    ? [companyColors[selectedCompany]]
                    : [...new Set(jobsList.map((job) => companyColors[job.companyName]))],
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        animation: {
            duration: 1500,
            easing: 'easeOutBounce',
        },
        plugins: {
            legend: { display: false },
            tooltip: { enabled: true },
        },
        scales: {
            x: { title: { display: true, text: 'Companies' } },
            y: { title: { display: true, text: 'Number of Jobs' }, beginAtZero: true },
        },
    };
    console.log(rejectedJobs)

    return (
        <DashboardLayout>
            <div className="min-h-screen bg-gray-50 p-6 font-sora flex flex-col">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-3xl xl:text-4xl font-extrabold text-blue-900">
                        Welcome, {userData.firstname}!
                    </h1>
                    <div className="flex space-x-6">
                        {showRates && (
                            <>
                                <div className="bg-blue-100 text-blue-800 p-4 rounded-lg shadow-md">
                                    <h2 className="text-xl font-semibold">Success Rate</h2>
                                    <p className="text-3xl font-bold">{successRate}%</p>
                                </div>
                                <div
                                    className="bg-red-100 text-red-800 p-4 rounded-lg shadow-md cursor-pointer"
                                    onClick={handleRejectionCardClick}
                                >
                                    <h2 className="text-xl font-semibold">Rejection Rate</h2>
                                    <p className="text-3xl font-bold">{rejectionRate}%</p>
                                </div>
                            </>
                        )}
                    </div>
                </div>

                {/* Modal for rejected jobs */}
                {isModalOpen && (
                    <div className="fixed inset-0 bg-gray-900 bg-opacity-50 flex justify-center items-center z-50">
                        <div className="bg-white rounded-lg p-6 w-3/4">
                            <h2 className="text-2xl font-semibold mb-4">Rejected Jobs</h2>
                            {rejectedJobs.length > 0 ? (
                                <table className="min-w-full border border-gray-200 rounded-lg">
                                    <thead>
                                        <tr className="bg-gray-100 text-left text-sm">
                                            <th className="p-3 border border-gray-200">Company</th>
                                            <th className="p-3 border border-gray-200">Title</th>
                                            <th className="p-3 border border-gray-200">Previous Status</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {rejectedJobs.map((job, index) => (
                                            <tr key={index} className="hover:bg-gray-50">
                                                <td className="p-3 border border-gray-200">{job.companyName}</td>
                                                <td className="p-3 border border-gray-200">{job.title}</td>
                                                <td className="p-3 border border-gray-200">
                                                    {job.previousstatus}
                                                </td>
                                            </tr>
                                        ))}

                                    </tbody>
                                </table>
                            ) : (
                                <p className="text-gray-500">No rejected jobs found.</p>
                            )}
                            <div className="mt-4 flex justify-end space-x-4">
                                <button
                                    onClick={exportToExcel}
                                    className="bg-blue-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Export to Excel
                                </button>
                                <button
                                    onClick={closeModal}
                                    className="bg-red-600 text-white px-4 py-2 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Remaining components */}
                {/* Toggle Button */}
                <div className="mb-6">
                    <button
                        className={`px-4 py-2 rounded-lg text-white ${showRates ? 'bg-red-600' : 'bg-green-600'
                            }`}
                        onClick={toggleRates}
                    >
                        {showRates ? 'Hide Success & Rejection Rates' : 'Show Success & Rejection Rates'}
                    </button>
                </div>

                {/* Company Filter Dropdown */}
                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Filter by Company</h2>
                    <select
                        className="p-2 bg-white border border-gray-300 rounded-lg w-full"
                        value={selectedCompany}
                        onChange={handleFilterChange}
                    >
                        <option value="">Show all Company</option>
                        {Object.keys(companyColors).map((company) => (
                            <option key={company} value={company}>
                                {company}
                            </option>
                        ))}
                    </select>
                </div>

                <div className="mb-6">
                    <h2 className="text-xl font-semibold text-gray-700 mb-4">Achievements</h2>
                    {achievedMilestones.length > 0 ? (
                        <ul className="list-disc pl-6">
                            {achievedMilestones.map((milestone) => (
                                <li key={milestone.id} className="text-gray-800 font-medium">
                                    🎉 {milestone.title}: {milestone.count}
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="text-gray-500">No achievements yet. Keep applying!</p>
                    )}
                </div>

                {/* Job Status Cards */}
                <div className="grid lg:grid-cols-4 md:grid-cols-2 sm:grid-cols-1 gap-4 mb-8">
                    {filteredJobStatusData.map((statusItem, index) => (
                        <div
                            key={index}
                            className="shadow-md p-4 bg-white rounded-md flex flex-col items-center justify-center"
                        >
                            <h3 className="text-lg font-medium text-gray-800 mb-1">{statusItem.status}</h3>
                            <p className="text-2xl font-bold text-blue-700">{statusItem.count}</p>
                        </div>
                    ))}
                </div>

                {/* Bar Chart and Job List */}
                <div className="grid lg:grid-cols-2 md:grid-cols-1 gap-8">
                    <div className="shadow-lg p-6 bg-white rounded-lg">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Job by Company</h2>
                        <Bar ref={chartRef} data={barChartData} options={chartOptions} />
                    </div>

                    <div className="shadow-lg p-6 bg-white rounded-lg overflow-x-auto">
                        <h2 className="text-xl font-semibold text-gray-700 mb-4">Job List</h2>
                        {currentJobs.length > 0 ? (
                            <table className="min-w-full border border-gray-200 rounded-lg">
                                <thead>
                                    <tr className="bg-gray-100 text-left text-sm">
                                        <th className="p-3 border border-gray-200">#</th>
                                        <th className="p-3 border border-gray-200">Company</th>
                                        <th className="p-3 border border-gray-200">Title</th>
                                        <th className="p-3 border border-gray-200">Status</th>
                                        <th className="p-3 border border-gray-200">Date Applied</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentJobs.map((job, index) => (
                                        <tr key={job._id} className="hover:bg-gray-50">
                                            <td className="p-3 border border-gray-200 text-center">
                                                {indexOfFirstJob + index + 1}
                                            </td>
                                            <td className="p-3 border border-gray-200">{job.companyName}</td>
                                            <td className="p-3 border border-gray-200">{job.title}</td>
                                            <td className="p-3 border border-gray-200">{statusLabels[job.status]}</td>
                                            <td className="p-3 border border-gray-200">
                                                {new Date(job.dateApplied).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        ) : (
                            <p className="text-gray-500 text-center">No jobs found.</p>
                        )}
                        <div className="flex justify-between mt-4">
                            <button
                                className={`p-2 px-4 rounded-lg text-white ${currentPage === 1 ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600'
                                    }`}
                                onClick={handlePreviousPage}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </button>
                            <button
                                className={`p-2 px-4 rounded-lg text-white ${currentPage >= Math.ceil(filteredJobs.length / jobsPerPage)
                                        ? 'bg-gray-400 cursor-not-allowed'
                                        : 'bg-blue-600'
                                    }`}
                                onClick={handleNextPage}
                                disabled={currentPage >= Math.ceil(filteredJobs.length / jobsPerPage)}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default Dashboard;
