import React, { useEffect, useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import DashboardLayout from '../layouts/DashboardLayout';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { FaTrashAlt } from 'react-icons/fa';

const SetReminder = () => {
  const { userId, accessToken } = useSelector((state) => state.user);
  const [date, setDate] = useState(null);
  const [comment, setComment] = useState('');
  const [reminders, setReminders] = useState([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteReminderId, setDeleteReminderId] = useState(null);

  const fetchReminders = useCallback(async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/reminder`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReminders(data);
      } else {
        console.error('Failed to fetch reminders');
      }
    } catch (error) {
      console.error('Error fetching reminders:', error);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleDateChange = (selectedDate) => {
    if (selectedDate > new Date()) {
      setDate(selectedDate);
      setError(''); // Clear the error when a valid future date is selected
    } else {
      setError('Please select a future date and time.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!date) {
      setError('Please select a valid future date and time.');
      return;
    }

    try {
      const requestBody = {
        title: comment,
        date: date.toISOString(),
        userId,
      };

      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/set-reminder`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (response.ok) {
        const data = await response.json();
        setReminders([...reminders, data]);
        setComment('');
        setDate(null);
        setSuccess('Reminder set successfully!');

        // Clear the success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      
      } else {
        setError('Failed to set reminder. Please try again.');
      }
    } catch (error) {
      setError('Error setting reminder. Please try again later.');
    }
  };

  const confirmDeleteReminder = (id) => {
    setDeleteReminderId(id);
    setShowDeleteModal(true);
  };

  const handleDeleteReminder = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_BASE_URL}/auth/reminder/${deleteReminderId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        setReminders(reminders.filter(reminder => reminder._id !== deleteReminderId));
        setSuccess('Reminder deleted successfully!');

        // Clear the success message after 5 seconds
        setTimeout(() => {
          setSuccess('');
        }, 5000);
      } else {
        setError('Failed to delete reminder. Please try again.');
      }
    } catch (error) {
      setError('Error deleting reminder. Please try again later.');
    } finally {
      setShowDeleteModal(false);
      setDeleteReminderId(null);
    }
  };

  return (
    <DashboardLayout>
      <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-white font-sora">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Set a Reminder</h1>
        <form onSubmit={handleSubmit} className="w-full max-w-md p-6 bg-gray-100 rounded-lg shadow-lg">
          <div className="mb-4">
            <DatePicker
              selected={date}
              onChange={handleDateChange}
              minDate={new Date()}
              showTimeSelect
              dateFormat="Pp"
              placeholderText="Select date and time"
              className="w-full p-3 border rounded"
              wrapperClassName="w-full"
            />
          </div>
          <div className="mb-4">
            <textarea
              className="w-full p-3 border rounded"
              placeholder="Enter reminder note"
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-blue-900 text-white py-3 rounded-lg hover:bg-blue-700"
          >
            Set Reminder
          </button>
          {error && <p className="text-red-500 text-center mt-4">{error}</p>}
          {success && <p className="text-green-500 text-center mt-4">{success}</p>}
        </form>
        <div className="w-full max-w-md mt-8">
          <h2 className="text-xl font-bold text-blue-900 mb-4 text-center">Upcoming Reminders</h2>
          <ul className="bg-gray-100 rounded-lg p-4">
            {reminders.map((reminder) => (
              <li key={reminder._id} className="border-b border-gray-300 py-2 flex justify-between items-center">
                <div>
                  <p className="text-blue-900 font-semibold">{reminder.title}</p>
                  <p className="text-gray-600 text-sm">
                    {new Date(reminder.date).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </p>
                </div>
                <button onClick={() => confirmDeleteReminder(reminder._id)} className="text-red-500 hover:text-red-700">
                  <FaTrashAlt />
                </button>
              </li>
            ))}
            {reminders.length === 0 && <p className="text-gray-500 text-center">No reminders set</p>}
          </ul>
        </div>

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
              <h3 className="text-lg font-bold mb-4">Delete Reminder</h3>
              <p>Are you sure you want to delete this reminder?</p>
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="px-4 py-2 bg-gray-300 rounded-lg mr-2 hover:bg-gray-400"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteReminder}
                  className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default SetReminder;
