import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchJobs, updateJob, removeJob } from '../store/jobSlice';
import DashboardLayout from '../layouts/DashboardLayout';

const ViewApplications = () => {
    const dispatch = useDispatch();
    const { accessToken } = useSelector((state) => state.user);
    const applications = useSelector((state) => state.jobs.jobs);
    const [error, setError] = useState('');
    const [status, setStatus] = useState('');
    const [dateAppliedStart, setDateAppliedStart] = useState('');
    const [dateAppliedEnd, setDateAppliedEnd] = useState('');
    const [companyName, setCompanyName] = useState('');
    const [editApplicationId, setEditApplicationId] = useState(null);
    const [editFormData, setEditFormData] = useState({ status: '', deadline: '', dateApplied: '', jobLink: '' });
    const [deleteApplicationId, setDeleteApplicationId] = useState(null);
    const [statusOptions, setStatusOptions] = useState([]);
    const [deadlineStart, setDeadlineStart] = useState('');
    const [deadlineEnd, setDeadlineEnd] = useState('');
    const [comments, setComments] = useState([]);
    const [selectedApplicationId, setSelectedApplicationId] = useState(null);
    const [commentModalOpen, setCommentModalOpen] = useState(false);
    const [newComment, setNewComment] = useState('');
    const [resumeFile, setResumeFile] = useState(null); // State for resume file
    const [resumeModalOpen, setResumeModalOpen] = useState(false);
    const [currentResume, setCurrentResume] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (accessToken) {
            dispatch(fetchJobs(accessToken));
            fetchStatusOptions();
        }
    }, [dispatch, accessToken]);

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

    const isImageFile = (fileUrl) => {
        const imageExtensions = ['jpg', 'jpeg', 'png', 'gif'];
        const fileExtension = fileUrl.split('.').pop().toLowerCase();
        return imageExtensions.includes(fileExtension);
    };

    const handleSaveEdit = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({
                    status: editFormData.status,
                    deadline: editFormData.deadline,
                    dateApplied: editFormData.dateApplied,
                    jobLink: editFormData.jobLink,
                }),
            });
            if (response.ok) {
                const updatedJob = await response.json();
                dispatch(updateJob(updatedJob));
                setEditApplicationId(null);
            } else {
                console.error('Failed to update the job');
            }
        } catch (error) {
            console.error('Error updating job:', error);
        }
    };

    const handleDeleteComment = async (index) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/${selectedApplicationId}/notes/${index}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                // Remove the deleted comment from the comments array
                setComments((prevComments) => prevComments.filter((_, i) => i !== index));
            } else {
                console.error('Failed to delete comment');
            }
        } catch (error) {
            console.error('Error deleting comment:', error);
        }
    };


    const handleDelete = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs/${id}`, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });
            if (response.ok) {
                dispatch(removeJob(id));
                setDeleteApplicationId(null);
            } else {
                console.error('Failed to delete the job');
            }
        } catch (error) {
            console.error('Error deleting job:', error);
        }
    };

    const handleClearFilters = () => {
        setStatus('');
        setCompanyName('');
        setDateAppliedStart('');
        setDateAppliedEnd('');
        setDeadlineStart('');
        setDeadlineEnd('');
    };

    const handleOpenCommentModal = async (id) => {
        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/notes/${id}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                console.log(response)
                const allNote = await response.json();

                setComments(allNote)
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
        setSelectedApplicationId(id);
        setNewComment('');
        setCommentModalOpen(true);
    };

    const handleAddComment = async () => {
        if (!newComment) return;

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs-note/${selectedApplicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ note: newComment }),
            });

            if (response.ok) {
                const updatedNote = await response.json();
                console.log(updatedNote)
                setComments(updatedNote.note); // Assuming `updatedNote.note` returns the updated comments array
                setNewComment('');
            } else {
                console.error('Failed to add comment');
            }
        } catch (error) {
            console.error('Error adding comment:', error);
        }
    };

    const handleCloseCommentModal = () => {
        setCommentModalOpen(false);
    };


    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && (file.type === 'application/pdf' || file.type === 'application/msword' || file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
            setResumeFile(file);
            setError(''); // Clear any existing error
        } else {
            setError('Please upload a PDF or Word document (DOC/DOCX) file.');
            setResumeFile(null); // Reset file if invalid
        }
    };


    const openResumeModal = async (applicationId) => {
        setSelectedApplicationId(applicationId);
        setResumeModalOpen(true);
        setIsLoading(true);

        try {
            const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs/${applicationId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (response.ok) {
                const jobData = await response.json();
                console.log(jobData)
                setCurrentResume(jobData.resume || null);
            } else {
                console.error('Failed to fetch job data');
                setError('Failed to load resume.');
            }
        } catch (error) {
            console.error('Error fetching job data:', error);
            setError('Error fetching job data: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAddResume = async (applicationId) => {
        if (!resumeFile) {
            setError('Please select a file to upload.');
            return;
        }
        setIsLoading(true)

        try {
            // Step 1: Upload the file
            const formData = new FormData();
            formData.append('file', resumeFile);

            const uploadResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/upload`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${accessToken}` },
                body: formData,
            });

            if (!uploadResponse.ok) {
                throw new Error('Failed to upload file');
            }

            const uploadData = await uploadResponse.json();
            const resumeUrl = uploadData.url;

            // Step 2: Update the job with the resume URL
            const updateResponse = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/jobs-resume/${applicationId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify({ resume: resumeUrl }),
            });

            if (updateResponse.ok) {
                setCurrentResume(resumeUrl); // Set the resume URL after a successful update
                setResumeFile(null); // Clear the file input
                setResumeModalOpen(false); // Close the modal
                setError('')
                setIsLoading(false)
                alert('Resume updated successfully!');
            } else {
                throw new Error('Failed to update resume');
            }
        } catch (error) {
            console.error('Error uploading resume:', error);
            setError('Error uploading resume: ' + error.message);
        }
    };

    const filteredApplications = applications.filter((app) => {
        const matchStatus = status ? app.status.toLowerCase().includes(status.toLowerCase()) : true;
        const matchCompanyName = companyName ? app.companyName.toLowerCase().includes(companyName.toLowerCase()) : true;

        const matchDateAppliedStart = dateAppliedStart ? new Date(app.dateApplied) >= new Date(dateAppliedStart) : true;
        const matchDateAppliedEnd = dateAppliedEnd ? new Date(app.dateApplied) <= new Date(dateAppliedEnd) : true;
        const matchDateApplied = matchDateAppliedStart && matchDateAppliedEnd;

        const matchDeadlineStart = deadlineStart ? new Date(app.deadline) >= new Date(deadlineStart) : true;
        const matchDeadlineEnd = deadlineEnd ? new Date(app.deadline) <= new Date(deadlineEnd) : true;
        const matchDeadline = matchDeadlineStart && matchDeadlineEnd;

        return matchStatus && matchCompanyName && matchDateApplied && matchDeadline;
    });


    return (
        <DashboardLayout>
            <div className="min-h-screen flex overflow-hidden font-sora bg-white ">
                <div className="flex-1 flex items-start justify-center p-4 overflow-y-auto h-screen">
                    <div className="w-full max-w-3xl mx-auto">
                        <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-blue-900 text-center">Your Applications</h1>
                        <p className="text-sm text-gray-500 text-center my-4">View and manage your job applications</p>
                        {error && <p className="text-red-500 text-center text-sm">{error}</p>}

                        <div className="mb-4">
                            <select
                                className="w-full px-4 py-2 border rounded-lg"
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                            >
                                <option value="">Select Job Status</option>
                                {statusOptions.map((option, index) => (
                                    <option key={index} value={option}>{option}</option>
                                ))}
                            </select>
                            <input
                                type="text"
                                placeholder="Search by company name"
                                value={companyName}
                                onChange={(e) => setCompanyName(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg mt-2"
                            />
                            <div className="flex flex-col sm:flex-row gap-2 items-center mt-2">
                                <label>Date Applied (From):</label>
                                <input
                                    type="date"
                                    value={dateAppliedStart}
                                    onChange={(e) => setDateAppliedStart(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                />
                                <label>Date Applied (To):</label>
                                <input
                                    type="date"
                                    value={dateAppliedEnd}
                                    onChange={(e) => setDateAppliedEnd(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <div className="flex flex-col sm:flex-row gap-2 items-center mt-2">
                                <label>Deadline (From):</label>
                                <input
                                    type="date"
                                    value={deadlineStart}
                                    onChange={(e) => setDeadlineStart(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                />
                                <label>Deadline (To):</label>
                                <input
                                    type="date"
                                    value={deadlineEnd}
                                    onChange={(e) => setDeadlineEnd(e.target.value)}
                                    className="px-4 py-2 border rounded-lg"
                                />
                            </div>
                            <button
                                onClick={handleClearFilters}
                                className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg mt-2"
                            >
                                Clear Filters
                            </button>
                        </div>

                        <div className="">
                            {filteredApplications.length > 0 ? (
                                <div className="grid gap-4">
                                    {filteredApplications.map((app) => (
                                        <div key={app._id} className="p-4 border rounded-lg shadow-md">
                                            <h2 className="text-lg font-bold">{app.title}</h2>
                                            <p><strong>Company:</strong> {app.companyName}</p>
                                            <p><strong>Role:</strong> {app.role}</p>
                                            <p><strong>Status:</strong> {app.status}</p>
                                            <p><strong>Date Applied:</strong> {app.dateApplied ? new Date(app.dateApplied).toLocaleDateString('en-US', { timeZone: 'UTC' }) : ''}</p>
                                            <p><strong>Deadline:</strong> {new Date(app.deadline).toLocaleDateString('en-US', { timeZone: 'UTC' })}</p>
                                            {app.jobLink && (
                                                <p>
                                                    <strong>Job Link:</strong>{' '}
                                                    <a href={app.jobLink} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                                                        {app.jobLink}
                                                    </a>
                                                </p>
                                            )}
                                            <div className="flex gap-2 mt-2">
                                                <button
                                                    onClick={() => handleOpenCommentModal(app._id)}
                                                    className="bg-green-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    View Comments
                                                </button>

                                                <button
                                                    onClick={() => openResumeModal(app._id)} // Open resume upload modal
                                                    className="bg-yellow-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Add/View Resume
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setEditApplicationId(app._id);
                                                        setEditFormData({ status: app.status, deadline: app.deadline, dateApplied: app.dateApplied, jobLink: app.jobLink });
                                                    }}
                                                    className="bg-blue-900 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => setDeleteApplicationId(app._id)}
                                                    className="bg-red-500 text-white px-4 py-2 rounded-lg"
                                                >
                                                    Delete
                                                </button>
                                            </div>

                                            {editApplicationId === app._id && (
                                                <div className="mt-4">
                                                    <div className="flex flex-col md:flex-row md:items-center md:gap-4">
                                                        <div className="flex flex-col">
                                                            <label>Status:</label>
                                                            <select
                                                                value={editFormData.status}
                                                                onChange={(e) => setEditFormData({ ...editFormData, status: e.target.value })}
                                                                className="px-4 py-2 border rounded-lg"
                                                            >
                                                                <option value="">Select Status</option>
                                                                {statusOptions.map((option, index) => (
                                                                    <option key={index} value={option}>
                                                                        {option}
                                                                    </option>
                                                                ))}
                                                            </select>
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label>Date Applied:</label>
                                                            <input
                                                                type="date"
                                                                value={editFormData.dateApplied}
                                                                onChange={(e) => setEditFormData({ ...editFormData, dateApplied: e.target.value })}
                                                                className="px-4 py-2 border rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label>Deadline:</label>
                                                            <input
                                                                type="date"
                                                                value={editFormData.deadline}
                                                                onChange={(e) => setEditFormData({ ...editFormData, deadline: e.target.value })}
                                                                className="px-4 py-2 border rounded-lg"
                                                            />
                                                        </div>
                                                        <div className="flex flex-col">
                                                            <label>Job Link:</label>
                                                            <input
                                                                type="text"
                                                                value={editFormData.jobLink}
                                                                onChange={(e) => setEditFormData({ ...editFormData, jobLink: e.target.value })}
                                                                className="px-4 py-2 border rounded-lg"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex gap-2 mt-4">
                                                        <button
                                                            onClick={() => handleSaveEdit(app._id)}
                                                            className="bg-blue-900 text-white px-4 py-2 rounded-lg"
                                                        >
                                                            Save
                                                        </button>
                                                        <button
                                                            onClick={() => setEditApplicationId(null)}
                                                            className="bg-gray-500 text-white px-4 py-2 rounded-lg"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p>No applications found.</p>
                            )}
                        </div>
                    </div>
                </div>

                {resumeModalOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-90 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[80%] md:w-[500px] shadow-md">
                            {error && <p className="text-red-500 text-center py-4 text-sm">{error}</p>}
                            <h2 className="text-lg font-bold">Upload Resume for this application</h2>

                            {currentResume ? (
                                isImageFile(currentResume) ? (
                                    <img
                                        src={currentResume}
                                        alt="Current Resume"
                                        className="w-full h-auto mb-4"
                                    />
                                ) : (
                                    <a
                                        href={currentResume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-500 underline"
                                    >
                                        View or Download Resume
                                    </a>
                                )
                            ) : (
                                <p>No current resume available.</p>
                            )}

                            <div className="mt-4">
                                <input
                                    type="file"
                                    onChange={handleFileChange}
                                    className="border rounded-lg p-4 w-full"
                                    disabled={isLoading} // Disable input when loading
                                />
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleAddResume(selectedApplicationId)}
                                    className={`bg-blue-900 text-white px-4 py-2 rounded-lg mr-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    disabled={isLoading} // Disable button when loading
                                >
                                    {isLoading ? 'Uploading...' : 'Upload'}
                                </button>
                                <button
                                    onClick={() => setResumeModalOpen(false)}
                                    className="bg-gray-300 text-gray-800 px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {commentModalOpen && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-90 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[80%] md:w-[500px] shadow-md">
                            <h2 className="text-lg font-bold">Comments for this Application</h2>
                            <div className="max-h-60 overflow-y-auto mb-4">
                                {(comments || []).map((comment, index) => (
                                    <div key={comment._id || index} className="border-b py-2">
                                        <p>{comment.text}</p>
                                        <small className="text-gray-500">
                                            {/* Convert timestamp to readable format */}
                                            {new Date(comment.timestamp).toLocaleString()}
                                        </small>
                                        <button
                                            onClick={() => handleDeleteComment(index)}
                                            className="text-red-500 hover:text-red-700 text-sm ml-4"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <textarea
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                placeholder="Add a new comment"
                                className="border px-4 py-2 rounded-lg w-full"
                            />
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={handleAddComment}
                                    className="bg-blue-900 text-white px-4 py-2 rounded-lg mr-2"
                                >
                                    Add Comment
                                </button>
                                <button
                                    onClick={handleCloseCommentModal}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}


                {deleteApplicationId && (
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-90 flex items-center justify-center z-50">
                        <div className="bg-white p-6 rounded-lg w-[80%] md:w-[500px] shadow-md">
                            <h2 className="text-lg font-bold">Confirm Deletion</h2>
                            <p>Are you sure you want to delete this job application?</p>
                            <div className="mt-4 flex justify-end">
                                <button
                                    onClick={() => handleDelete(deleteApplicationId)}
                                    className="bg-red-500 text-white px-4 py-2 rounded-lg mr-2"
                                >
                                    Confirm
                                </button>
                                <button
                                    onClick={() => setDeleteApplicationId(null)}
                                    className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
};

export default ViewApplications;