import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { fetchLatestJobs } from '../services/sarkariApi';
import './Bookmarks.css';

const Bookmarks = () => {
  const [bookmarkedExams, setBookmarkedExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      fetchBookmarkedExams();
    } else {
      navigate('/');
    }
  }, [user]);

  const fetchBookmarkedExams = async () => {
    try {
      // Get all jobs from API
      const allJobs = await fetchLatestJobs();
      const transformedJobs = allJobs.map((job, index) => ({
        id: `exam-${index}`,
        title: job.title || 'Untitled Job',
        organization: job.organization || 'Government',
        state: job.state || 'Central',
        category: job.category || 'General',
        qualification: job.qualification || 'Varies',
        applicationStart: job.applicationStart || '',
        applicationDeadline: job.applicationDeadline || '',
        examDate: job.examDate || '',
        resultDate: job.resultDate || '',
        applicationFee: job.applicationFee || 'Varies',
        ageLimit: job.ageLimit || 'Varies',
        vacancies: job.vacancies || 'Multiple',
        description: job.description || 'No description available',
        notificationLink: job.notificationLink || '#',
        applicationLink: job.applicationLink || '#',
        status: 'published',
        createdAt: new Date(),
        views: 0
      }));

      // Get user's bookmarks from localStorage
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${user.uid}`) || '[]');

      // Filter jobs that are bookmarked
      const bookmarkedJobs = transformedJobs.filter(job => bookmarks.includes(job.id));
      setBookmarkedExams(bookmarkedJobs);
    } catch (error) {
      console.error('Error fetching bookmarked exams:', error);
      setBookmarkedExams([]);
    } finally {
      setLoading(false);
    }
  };

  const handleExamClick = (exam) => {
    navigate(`/exam/${exam.id}`, { state: { exam } });
  };

  if (loading) {
    return <div className="loading">Loading your bookmarks...</div>;
  }

  return (
    <div className="bookmarks-container">
      <h1>My Exams</h1>

      {bookmarkedExams.length === 0 ? (
        <div className="no-bookmarks">
          <p>You haven't bookmarked any exams yet.</p>
          <button onClick={() => navigate('/exams')} className="browse-btn">
            Browse Exams
          </button>
        </div>
      ) : (
        <div className="exam-grid">
          {bookmarkedExams.map(exam => (
            <div key={exam.id} className="exam-card" onClick={() => handleExamClick(exam.id)}>
              <h3>{exam.title}</h3>
              <p><strong>Organization:</strong> {exam.organization}</p>
              <p><strong>State:</strong> {exam.state}</p>
              <p><strong>Category:</strong> {exam.category}</p>
              <p><strong>Application Deadline:</strong> {exam.applicationDeadline}</p>
              <p><strong>Exam Date:</strong> {exam.examDate}</p>
              <span className={`status ${exam.status}`}>{exam.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Bookmarks;