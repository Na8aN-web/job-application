import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import axios from 'axios';

const ViewJobs = () => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/auth/all-created-jobs`);
        setJobs(response.data);
      } catch (err) {
        setError('Failed to fetch jobs. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col items-center p-6 bg-gray-50 font-sora" >
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Available Jobs</h1>

        {loading && <p className="text-gray-600">Loading jobs...</p>}
        {error && <p className="text-red-500">{error}</p>}

        {!loading && !error && jobs.length === 0 && (
          <p className="text-gray-500">No jobs available at the moment.</p>
        )}

        {!loading && !error && jobs.length > 0 && (
          <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <Link
                to={`/jobs/${job._id}`}
                key={job._id}
                className="bg-white rounded-lg shadow-lg p-6 border border-gray-200 hover:shadow-xl transition-shadow"
              >
                <h3 className="text-lg font-bold text-blue-900 mb-2">{job.title}</h3>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Role:</strong> {job.role}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Company:</strong> {job.companyName}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Location:</strong> {job.companyLocation}
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Posted:</strong> {new Date(job.datePosted).toLocaleDateString()}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Deadline:</strong> {new Date(job.deadline).toLocaleDateString()}
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default ViewJobs;
