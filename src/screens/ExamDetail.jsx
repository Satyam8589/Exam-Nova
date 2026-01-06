import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import './ExamDetail.css';

const ExamDetail = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const exam = location.state?.exam;

  useEffect(() => {
    if (!exam) {
      navigate('/exams');
      return;
    }
    if (user && exam) {
      checkBookmarkStatus();
    }
  }, [user, exam]);

  const checkBookmarkStatus = () => {
    if (!user) return;
    try {
      const bookmarks = JSON.parse(localStorage.getItem(`bookmarks_${user.uid}`) || '[]');
      setIsBookmarked(bookmarks.includes(exam.id));
    } catch (error) {
      console.error('Error checking bookmark status:', error);
    }
  };

  const toggleBookmark = () => {
    if (!user) {
      navigate('/');
      return;
    }

    try {
      const bookmarksKey = `bookmarks_${user.uid}`;
      const bookmarks = JSON.parse(localStorage.getItem(bookmarksKey) || '[]');

      if (isBookmarked) {
        const updatedBookmarks = bookmarks.filter(id => id !== exam.id);
        localStorage.setItem(bookmarksKey, JSON.stringify(updatedBookmarks));
        setIsBookmarked(false);
      } else {
        bookmarks.push(exam.id);
        localStorage.setItem(bookmarksKey, JSON.stringify(bookmarks));
        setIsBookmarked(true);
      }
    } catch (error) {
      console.error('Error toggling bookmark:', error);
    }
  };

  if (!exam) {
    return <div className="error">Exam not found.</div>;
  }

  return (
    <div className="exam-detail-container">
      <div className="exam-header">
        <h1>{exam.title}</h1>
        {user && (
          <button
            className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
            onClick={toggleBookmark}
          >
            {isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
          </button>
        )}
      </div>

      <div className="exam-info">
        <div className="info-section">
          <h2>Basic Information</h2>
          <p><strong>Organization:</strong> {exam.organization}</p>
          <p><strong>State:</strong> {exam.state}</p>
          <p><strong>Category:</strong> {exam.category}</p>
          <p><strong>Qualification Required:</strong> {exam.qualification}</p>
          <p><strong>Status:</strong> <span className={`status ${exam.status}`}>{exam.status}</span></p>
        </div>

        <div className="info-section">
          <h2>Important Dates</h2>
          <p><strong>Application Start:</strong> {exam.applicationStart}</p>
          <p><strong>Application Deadline:</strong> {exam.applicationDeadline}</p>
          <p><strong>Exam Date:</strong> {exam.examDate}</p>
          <p><strong>Result Date:</strong> {exam.resultDate}</p>
        </div>

        <div className="info-section">
          <h2>Application Details</h2>
          <p><strong>Application Fee:</strong> {exam.applicationFee}</p>
          <p><strong>Age Limit:</strong> {exam.ageLimit}</p>
          <p><strong>Vacancies:</strong> {exam.vacancies}</p>
        </div>

        <div className="info-section">
          <h2>Description</h2>
          <p>{exam.description}</p>
        </div>

        <div className="info-section">
          <h2>Official Links</h2>
          <a href={exam.notificationLink} target="_blank" rel="noopener noreferrer">
            Official Notification
          </a>
          <br />
          <a href={exam.applicationLink} target="_blank" rel="noopener noreferrer">
            Apply Online
          </a>
        </div>
      </div>
    </div>
  );
};

export default ExamDetail;