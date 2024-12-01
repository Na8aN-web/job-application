import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { updateUser } from './store/userSlice';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard'
import SignUp from './components/SignUp';
import SignIn from './components/SignIn';
import CreateApplication from './pages/CreateApplication';
import ViewJobs from './pages/ViewJobs';
import JobDetails from './pages/JobDetails';
import ViewApplications from './pages/ViewApplications';
import EditProfile from './pages/EditProfile';
import SetReminder from './pages/SetReminder';
import OtpSignUp from './components/OtpSignUp';
import PasswordReset from './components/PasswordReset';
import ProtectedRoute from './components/ProtectedRoute';


function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const userData = JSON.parse(localStorage.getItem('userData'));

    if (accessToken && userData) {
      dispatch(updateUser(userData));
    }
  }, [dispatch]);
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/create" element={<ProtectedRoute><CreateApplication /></ProtectedRoute>} />
        <Route path="/jobs" element={<ProtectedRoute><ViewJobs /></ProtectedRoute>} />
        <Route path="/jobs/:id" element={<ProtectedRoute><JobDetails /></ProtectedRoute>} />
        <Route path="/view" element={<ProtectedRoute><ViewApplications /></ProtectedRoute>} />
        <Route path="/edit-profile" element={<ProtectedRoute><EditProfile /></ProtectedRoute>} />
        <Route path="/set-reminder" element={<ProtectedRoute><SetReminder /></ProtectedRoute>} />
        <Route path="/validate-otp" element={<OtpSignUp />} />
        <Route path="/password-reset" element={<PasswordReset />} />
      </Routes>
    </Router>
  );
}

export default App;
