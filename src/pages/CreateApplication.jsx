import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import { setJob } from '../store/jobSlice';

const CreateApplication = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { userId, accessToken } = useSelector((state) => state.user);
    const [error, setError] = useState('');
    const [statusOptions, setStatusOptions] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        role: '',
        status: '',
        dateApplied: '',
        deadline: '',
        companyName: '',
        jobLink: '', // Added job link field
        note: '', // Added note field
    });

    useEffect(() => {
        const fetchStatusOptions = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/status`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${accessToken}`,
                    },
                });

                if (response.ok) {
                    const data = await response.json();
                    setStatusOptions(data);
                } else {
                    console.error('Failed to fetch status options');
                }
            } catch (error) {
                console.error('Error fetching status options:', error);
            }
        };

        fetchStatusOptions();
    }, [accessToken]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        const dateApplied = formData.dateApplied ? new Date(formData.dateApplied).toISOString() : '';
        const deadline = new Date(formData.deadline).toISOString();

        if (new Date(deadline) <= (dateApplied ? new Date(dateApplied) : new Date())) {
            setError('The application deadline must be after the date applied.');
            return;
        }

        try {
            const requestBody = {
                title: formData.title,
                status: formData.status,
                deadline,
                companyName: formData.companyName,
                userId,
                note: formData.note, // Include note in the request body
            };

            if (formData.role) requestBody.role = formData.role;
            if (dateApplied) requestBody.dateApplied = dateApplied;
            if (formData.jobLink) requestBody.jobLink = formData.jobLink;

            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(requestBody),
            });

            const data = await response.json();
            console.log(data)

            if (response.ok) {
                setError('Application created successfully!');
                dispatch(setJob(data));
                setTimeout(() => {
                    navigate('/dashboard');
                }, 1000);
            } else {
                setError(data.message || 'An error occurred while creating the application');
            }
        } catch (error) {
            setError('Error creating application, please try again later');
            console.error('Error creating application:', error);
        }
    };

    return (
        <DashboardLayout>
            <div className="min-h-screen flex overflow-hidden font-sora bg-white">
                <div className="flex-1 flex items-start justify-center">
                    <div className="w-full max-w-md p-6 bg-white rounded-lg">
                        <h1 className="text-2xl xl:text-4xl font-extrabold text-blue-900 text-center">Create Application</h1>
                        <p className="text-sm text-gray-500 text-center my-4">Fill in the details for the new application</p>
                        {error && <p className="text-red-500 text-center text-sm">{error}</p>}
                        <form onSubmit={handleSubmit} className="w-full mt-8">
                            <div className="flex flex-col gap-4">
                                <input
                                    id="title"
                                    className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleChange}
                                    placeholder="Job Title"
                                    required
                                />
                                <input
                                    id="role"
                                    className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    type="text"
                                    name="role"
                                    value={formData.role}
                                    onChange={handleChange}
                                    placeholder="Job Role (Optional)"
                                />
                                <select
                                    id="status"
                                    name="status"
                                    className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    value={formData.status}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="" disabled>Select Job Status</option>
                                    {statusOptions.map((status, index) => (
                                        <option key={index} value={status}>{status}</option>
                                    ))}
                                </select>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="w-full">
                                        <label htmlFor="dateApplied" className="block text-sm font-medium text-gray-700">Date Applied (Optional)</label>
                                        <input
                                            id="dateApplied"
                                            className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            type="date"
                                            name="dateApplied"
                                            value={formData.dateApplied}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="w-full">
                                        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Application Deadline</label>
                                        <input
                                            id="deadline"
                                            className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            type="date"
                                            name="deadline"
                                            value={formData.deadline}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col lg:flex-row gap-4">
                                    <div className="w-full">
                                        <input
                                            id="companyName"
                                            className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            type="text"
                                            name="companyName"
                                            value={formData.companyName}
                                            onChange={handleChange}
                                            placeholder="Company Name"
                                            required
                                        />
                                    </div>
                                    <div className="w-full">
                                        <input
                                            id="jobLink"
                                            className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            type="url"
                                            name="jobLink"
                                            value={formData.jobLink}
                                            onChange={handleChange}
                                            placeholder="Job Link (Optional)"
                                        />
                                    </div>
                                </div>
                                <textarea
                                    id="note"
                                    className="w-full px-5 py-3 rounded-lg font-medium bg-gray-100 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    name="note"
                                    value={formData.note}
                                    onChange={handleChange}
                                    placeholder="Additional Comments (Optional)"
                                    rows="3"
                                />
                                <button
                                    type="submit"
                                    className="mt-5 tracking-wide font-semibold bg-blue-900 text-gray-100 w-full py-4 rounded-lg hover:bg-[#407BFF]"
                                >
                                    <span className="ml-3">Create Application</span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
};

export default CreateApplication;
