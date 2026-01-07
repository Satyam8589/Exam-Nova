import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import notificationService from '../services/notificationService';
import './RemindersScreen.css';

const RemindersScreen = () => {
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadReminders();
    } else {
      navigate('/');
    }
  }, [user]);

  const loadReminders = () => {
    try {
      const allReminders = notificationService.getAllReminders(user.uid);
      // Sort by reminder date
      const sortedReminders = allReminders.sort((a, b) => 
        new Date(a.reminderDate) - new Date(b.reminderDate)
      );
      setReminders(sortedReminders);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteReminder = (examId) => {
    if (window.confirm('Are you sure you want to delete this reminder?')) {
      const success = notificationService.deleteReminder(user.uid, examId);
      if (success) {
        loadReminders(); // Reload the list
      }
    }
  };

  const handleViewExam = (examId) => {
    navigate(`/exam/${examId}`);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  };

  const isUpcoming = (dateString) => {
    return new Date(dateString) > new Date();
  };

  const isPast = (dateString) => {
    return new Date(dateString) <= new Date();
  };

  const upcomingReminders = reminders.filter(r => isUpcoming(r.reminderDate));
  const pastReminders = reminders.filter(r => isPast(r.reminderDate));

  if (loading) {
    return <div className="loading">Loading your reminders...</div>;
  }

  return (
    <div className="reminders-screen">
      <div className="reminders-container">
        <div className="reminders-header">
          <h1>🔔 My Reminders</h1>
          <p className="subtitle">Manage your exam application reminders</p>
        </div>

        {reminders.length === 0 ? (
          <div className="no-reminders">
            <div className="no-reminders-icon">⏰</div>
            <h3>No Reminders Set</h3>
            <p>Set reminders for exam applications so you never miss a deadline!</p>
            <button onClick={() => navigate('/exams')} className="browse-btn">
              Browse Exams
            </button>
          </div>
        ) : (
          <>
            {upcomingReminders.length > 0 && (
              <div className="reminders-section">
                <h2>📅 Upcoming Reminders ({upcomingReminders.length})</h2>
                <div className="reminders-grid">
                  {upcomingReminders.map(reminder => (
                    <div key={reminder.id} className="reminder-card upcoming">
                      <div className="reminder-header">
                        <span className="reminder-badge upcoming-badge">Upcoming</span>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteReminder(reminder.examId)}
                          title="Delete reminder"
                        >
                          🗑️
                        </button>
                      </div>

                      <h3 
                        className="reminder-title clickable" 
                        onClick={() => handleViewExam(reminder.examId)}
                        title="Click to view exam details"
                      >
                        {reminder.examTitle}
                      </h3>

                      <div className="reminder-details">
                        <div className="detail-item">
                          <span className="detail-icon">⏰</span>
                          <div className="detail-content">
                            <span className="detail-label">Reminder On:</span>
                            <span className="detail-value">{formatDate(reminder.reminderDate)}</span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <div className="detail-content">
                            <span className="detail-label">Deadline:</span>
                            <span className="detail-value">{reminder.deadline || 'TBA'}</span>
                          </div>
                        </div>

                        {reminder.email && (
                          <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <div className="detail-content">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{reminder.email}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {pastReminders.length > 0 && (
              <div className="reminders-section">
                <h2>📜 Past Reminders ({pastReminders.length})</h2>
                <div className="reminders-grid">
                  {pastReminders.map(reminder => (
                    <div key={reminder.id} className="reminder-card past">
                      <div className="reminder-header">
                        <span className="reminder-badge past-badge">
                          {reminder.notified ? 'Notified ✓' : 'Expired'}
                        </span>
                        <button
                          className="delete-btn"
                          onClick={() => handleDeleteReminder(reminder.examId)}
                          title="Delete reminder"
                        >
                          🗑️
                        </button>
                      </div>

                      <h3 className="reminder-title">{reminder.examTitle}</h3>

                      <div className="reminder-details">
                        <div className="detail-item">
                          <span className="detail-icon">⏰</span>
                          <div className="detail-content">
                            <span className="detail-label">Reminder Was:</span>
                            <span className="detail-value">{formatDate(reminder.reminderDate)}</span>
                          </div>
                        </div>

                        <div className="detail-item">
                          <span className="detail-icon">📅</span>
                          <div className="detail-content">
                            <span className="detail-label">Deadline:</span>
                            <span className="detail-value">{reminder.deadline || 'TBA'}</span>
                          </div>
                        </div>

                        {reminder.email && (
                          <div className="detail-item">
                            <span className="detail-icon">📧</span>
                            <div className="detail-content">
                              <span className="detail-label">Email:</span>
                              <span className="detail-value">{reminder.email}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        <div className="info-card">
          <h3>💡 How Reminders Work</h3>
          <ul>
            <li>✅ Set reminders for exam applications you don't want to miss</li>
            <li>🔔 You'll get browser notifications at your chosen time</li>
            <li>📧 Optionally add your email to receive email reminders too</li>
            <li>📱 Make sure to enable notifications in your browser</li>
            <li>⏰ Quick options: 1 day, 3 days, or 1 week before deadline</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default RemindersScreen;
