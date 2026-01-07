import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import notificationService from '../services/notificationService';
import './ExamDetail.css';

const ExamDetail = () => {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState('');
  const [reminderEmail, setReminderEmail] = useState('');
  const [currentReminder, setCurrentReminder] = useState(null);
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
      checkReminderStatus();
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

  const checkReminderStatus = () => {
    if (!user) return;
    try {
      const reminder = notificationService.getReminder(user.uid, exam.id);
      if (reminder) {
        setHasReminder(true);
        setCurrentReminder(reminder);
      }
    } catch (error) {
      console.error('Error checking reminder status:', error);
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

  const handleSetReminder = async () => {
    if (!user) {
      navigate('/');
      return;
    }

    // Request notification permission
    const hasPermission = await notificationService.requestPermission();
    if (!hasPermission) {
      alert('Please enable notifications to receive reminders!');
      return;
    }

    // Auto-populate email with user's email
    if (user.email && !reminderEmail) {
      setReminderEmail(user.email);
    }

    setShowReminderModal(true);
  };

  const handleSaveReminder = () => {
    if (!reminderDate) {
      alert('Please select a reminder date');
      return;
    }

    // Validate email if provided
    if (reminderEmail && !reminderEmail.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      alert('Please enter a valid email address');
      return;
    }

    const reminder = notificationService.saveReminder(
      user.uid,
      exam.id,
      exam.title,
      reminderDate,
      exam.applicationDeadline,
      reminderEmail || null
    );

    if (reminder) {
      setHasReminder(true);
      setCurrentReminder(reminder);
      setShowReminderModal(false);
      const message = reminderEmail 
        ? `✅ Reminder set! You'll receive browser notification and email at ${reminderEmail}`
        : '✅ Reminder set! You will receive a browser notification.';
      alert(message);
    }
  };

  const handleDeleteReminder = () => {
    const success = notificationService.deleteReminder(user.uid, exam.id);
    if (success) {
      setHasReminder(false);
      setCurrentReminder(null);
      setReminderDate('');
      alert('Reminder deleted');
    }
  };

  const handleQuickReminder = (days) => {
    if (!exam.applicationDeadline) return;
    
    const deadline = new Date(exam.applicationDeadline);
    const reminderDate = new Date(deadline);
    reminderDate.setDate(reminderDate.getDate() - days);
    reminderDate.setHours(9, 0, 0, 0);
    
    setReminderDate(reminderDate.toISOString().slice(0, 16));
  };

  if (!exam) {
    return <div className="error">Exam not found.</div>;
  }

  return (
    <div className="exam-detail-container">
      <div className="exam-header">
        <h1>{exam.title}</h1>
        {user && (
          <div className="action-buttons">
            <button
              className={`bookmark-btn ${isBookmarked ? 'bookmarked' : ''}`}
              onClick={toggleBookmark}
            >
              {isBookmarked ? '⭐ Bookmarked' : '☆ Bookmark'}
            </button>
            <button
              className={`reminder-btn ${hasReminder ? 'has-reminder' : ''}`}
              onClick={hasReminder ? handleDeleteReminder : handleSetReminder}
            >
              {hasReminder ? '🔔 Reminder Set' : '⏰ Set Reminder'}
            </button>
          </div>
        )}
      </div>

      {/* Reminder Modal */}
      {showReminderModal && (
        <div className="modal-overlay" onClick={() => setShowReminderModal(false)}>
          <div className="reminder-modal" onClick={(e) => e.stopPropagation()}>
            <h2>🔔 Set Reminder</h2>
            <p className="modal-subtitle">
              Get notified before the application deadline
            </p>

            <div className="quick-reminders">
              <p><strong>Quick Select:</strong></p>
              <div className="quick-buttons">
                <button onClick={() => handleQuickReminder(1)}>1 day before</button>
                <button onClick={() => handleQuickReminder(3)}>3 days before</button>
                <button onClick={() => handleQuickReminder(7)}>1 week before</button>
              </div>
            </div>

            <div className="email-reminder">
              <p><strong>📧 Send reminder to email (optional):</strong></p>
              <input
                type="email"
                value={reminderEmail}
                onChange={(e) => setReminderEmail(e.target.value)}
                placeholder={user?.email || "your.email@example.com"}
                className="reminder-input"
              />
              <small className="email-note">
                {user?.email ? 'Using your account email. You can change it if needed.' : 'You\'ll receive both browser and email notifications'}
              </small>
            </div>

            <div className="custom-reminder">
              <p><strong>Or choose custom date & time:</strong></p>
              <input
                type="datetime-local"
                value={reminderDate}
                onChange={(e) => setReminderDate(e.target.value)}
                max={exam.applicationDeadline}
                className="reminder-input"
              />
            </div>

            <div className="deadline-info">
              <p>📅 Application Deadline: <strong>{exam.applicationDeadline || 'TBA'}</strong></p>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowReminderModal(false)}>
                Cancel
              </button>
              <button className="btn-save" onClick={handleSaveReminder}>
                Save Reminder
              </button>
            </div>
          </div>
        </div>
      )}

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