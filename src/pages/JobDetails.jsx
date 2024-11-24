import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const JobDetails = () => {
    const { id } = useParams();
    const [job, setJob] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showApplyForm, setShowApplyForm] = useState(false);
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        resume: '',
        immigrationSponsorshipRequired: false,
        currentStatus: '',
        ethnicity: '',
        gender: '',
        dateApplied: new Date().toISOString(),
        veteranStatus: '',
        disabilityStatus: '',
    });
    const [resumes, setResumes] = useState([]);
    const [resumeMode, setResumeMode] = useState('select'); // 'select' or 'upload'
    const [uploadedFile, setUploadedFile] = useState(null);
    const [applyStatus, setApplyStatus] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchJobDetails = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/created-jobs/${id}`);
                setJob(response.data);
            } catch (err) {
                setError('Failed to fetch job details. Please try again later.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        const fetchResumes = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/resumes`, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                });
                setResumes(response.data); // Assuming response.data is an array of URLs or objects with resume details.
            } catch (err) {
                console.error('Failed to fetch resumes:', err);
            }
        };

        fetchJobDetails();
        fetchResumes();
    }, [id]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleResumeChange = (e) => {
        setFormData((prev) => ({
            ...prev,
            resume: e.target.value,
        }));
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        setUploadedFile(file);
        setFormData((prev) => ({
            ...prev,
            resume: file.name, // Or handle file upload logic here
        }));
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        const finalData = { ...formData };

        if (resumeMode === 'upload' && uploadedFile) {
            console.log('Uploading file:', uploadedFile); // Handle actual file upload logic as needed
        }

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/auth/${id}/apply`, finalData, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            console.log(response);
            setApplyStatus({ success: true, message: 'Application submitted successfully!' });
            setShowApplyForm(false);
        } catch (err) {
            console.error(err);
            setApplyStatus({ success: false, message: 'Failed to submit application. Please try again later.' });
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50 font-sora">
                {loading && <p className="text-gray-600">Loading job details...</p>}
                {error && <p className="text-red-500">{error}</p>}
                {job && (
                    <div className="w-full bg-white rounded-lg p-6">
                        <button
                            onClick={() => navigate(-1)}
                            className="mb-4 bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300"
                        >
                            Back
                        </button>

                        <h1 className="text-2xl font-bold text-blue-900 mb-4">{job.title}</h1>
                        <p className="text-gray-700 mb-2"><strong>Role:</strong> {job.role}</p>
                        <p className="text-gray-700 mb-2"><strong>Company:</strong> {job.companyName}</p>
                        <p className="text-gray-700 mb-2"><strong>Location:</strong> {job.companyLocation}</p>
                        <p className="text-gray-700 mb-2"><strong>Posted:</strong> {new Date(job.datePosted).toLocaleDateString()}</p>
                        <p className="text-gray-700 mb-2"><strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}</p>
                        <p className="text-gray-700 mt-4">{job.jobDescription}</p>
                        <button
                            onClick={() => setShowApplyForm(!showApplyForm)}
                            className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF]"
                        >
                            {showApplyForm ? 'Close Application Form' : 'Apply'}
                        </button>
                    </div>
                )}

                {showApplyForm && (
                    <form
                        onSubmit={handleFormSubmit}
                        className="w-full bg-white p-6 mt-6"
                    >
                        <h2 className="text-lg font-bold text-blue-900 mb-4">Apply for {job?.title}</h2>
                        <div className="grid grid-cols-1 gap-4">
                            <input
                                type="text"
                                name="firstName"
                                value={formData.firstName}
                                onChange={handleInputChange}
                                placeholder="First Name"
                                required
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="text"
                                name="lastName"
                                value={formData.lastName}
                                onChange={handleInputChange}
                                placeholder="Last Name"
                                required
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="Email"
                                required
                                className="border p-2 rounded w-full"
                            />
                            <input
                                type="text"
                                name="phone"
                                value={formData.phone}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                                required
                                className="border p-2 rounded w-full"
                            />
                            <div>
                                <label className="block font-medium mb-2">Resume</label>
                                <div className="mb-4">
                                    <label className="mr-4">
                                        <input
                                            type="radio"
                                            name="resumeMode"
                                            value="select"
                                            checked={resumeMode === 'select'}
                                            onChange={() => setResumeMode('select')}
                                        />
                                        Select Existing Resume
                                    </label>
                                    <label>
                                        <input
                                            type="radio"
                                            name="resumeMode"
                                            value="upload"
                                            checked={resumeMode === 'upload'}
                                            onChange={() => setResumeMode('upload')}
                                        />
                                        Upload New Resume
                                    </label>
                                </div>

                                {resumeMode === 'select' && (
                                    <div className="border p-2 rounded w-full">
                                        <p className="mb-2">Select a Resume:</p>
                                        {resumes.length === 0 ? (
                                            <p className="text-gray-600">No resumes available. Please upload one.</p>
                                        ) : (
                                            resumes.map((resume, index) => (
                                                <div key={index} className="flex items-center justify-between border-b pb-2 mb-2">
                                                    <div className="flex items-center">
                                                        <input
                                                            type="radio"
                                                            name="resume"
                                                            value={resume}
                                                            checked={formData.resume === resume}
                                                            onChange={handleResumeChange}
                                                            className="mr-2"
                                                        />
                                                        <span className="text-gray-800">Resume {index + 1}</span>
                                                    </div>
                                                    <a
                                                        href={resume}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-500 hover:underline"
                                                    >
                                                        Preview
                                                    </a>
                                                </div>
                                            ))
                                        )}
                                    </div>
                                )}

                                {resumeMode === 'upload' && (
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx"
                                        onChange={handleFileUpload}
                                        className="border p-2 rounded w-full"
                                    />
                                )}
                            </div>

                            <div>
                                <label className="block font-medium mb-2">Immigration Sponsorship Required?</label>
                                <input
                                    type="checkbox"
                                    name="immigrationSponsorshipRequired"
                                    checked={formData.immigrationSponsorshipRequired}
                                    onChange={handleInputChange}
                                />
                            </div>

                            <select
                                name="currentStatus"
                                value={formData.currentStatus}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                                required
                            >
                                <option value="">-- Current Status --</option>
                                <option value="Currently Employed">Currently Employed</option>
                                <option value="Not Currently Employed">Not Currently Employed</option>
                            </select>

                            <select
                                name="disabilityStatus"
                                value={formData.disabilityStatus}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">-- Disability Status --</option>
                                <option value="Yes">Yes</option>
                                <option value="No">No</option>
                                <option value="Prefer Not to Disclose">Prefer Not to Disclose</option>
                            </select>

                            <select
                                name="veteranStatus"
                                value={formData.veteranStatus}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">-- Veteran Status --</option>
                                <option value="Veteran">Veteran</option>
                                <option value="Not a Veteran">Not a Veteran</option>
                                <option value="Prefer Not to Disclose">Prefer Not to Disclose</option>
                            </select>

                            <select
                                name="gender"
                                value={formData.gender}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">-- Gender --</option>
                                <option value="male">Male</option>
                                <option value="female">Female</option>
                                <option value="others">Others</option>
                            </select>

                            <select
                                name="ethnicity"
                                value={formData.ethnicity}
                                onChange={handleInputChange}
                                className="border p-2 rounded w-full"
                            >
                                <option value="">-- Ethnicity --</option>
                                <option value="Hispanic or Latino">Hispanic or Latino</option>
                                <option value="Black or African American">Black or African American</option>
                                <option value="White">White</option>
                                <option value="Asian">Asian</option>
                                <option value="American Indian or Alaska Native">
                                    American Indian or Alaska Native
                                </option>
                                <option value="Native Hawaiian or Other Pacific Islander">
                                    Native Hawaiian or Other Pacific Islander
                                </option>
                                <option value="Prefer Not to Disclose">Prefer Not to Disclose</option>
                            </select>

                            <button
                                type="submit"
                                className="bg-blue-900 text-gray-100 px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Submit Application
                            </button>
                        </div>
                    </form>
                )}

                {applyStatus && (
                    <p
                        className={`mt-4 p-2 rounded ${
                            applyStatus.success ? 'bg-green-500' : 'bg-red-500'
                        } text-white`}
                    >
                        {applyStatus.message}
                    </p>
                )}
            </div>
        </DashboardLayout>
    );
};

export default JobDetails;
