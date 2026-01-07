// Notification Service for Exam Reminders

class NotificationService {
  constructor() {
    this.checkNotificationPermission();
    this.startNotificationChecker();
  }

  // Request notification permission
  async requestPermission() {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return false;
    }

    if (Notification.permission === 'granted') {
      return true;
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }

    return false;
  }

  checkNotificationPermission() {
    if ('Notification' in window && Notification.permission === 'default') {
      console.log('Notification permission not yet requested');
    }
  }

  // Save a reminder for an exam
  saveReminder(userId, examId, examTitle, reminderDate, deadline, email = null) {
    try {
      const remindersKey = `reminders_${userId}`;
      const reminders = JSON.parse(localStorage.getItem(remindersKey) || '[]');
      
      const newReminder = {
        id: `${examId}_${Date.now()}`,
        examId,
        examTitle,
        reminderDate: new Date(reminderDate).toISOString(),
        deadline,
        email,
        notified: false,
        emailSent: false,
        createdAt: new Date().toISOString()
      };

      // Remove existing reminder for this exam if any
      const filteredReminders = reminders.filter(r => r.examId !== examId);
      filteredReminders.push(newReminder);
      
      localStorage.setItem(remindersKey, JSON.stringify(filteredReminders));
      
      // If email is provided, schedule email reminder
      if (email) {
        this.scheduleEmailReminder(newReminder);
      }
      
      return newReminder;
    } catch (error) {
      console.error('Error saving reminder:', error);
      return null;
    }
  }

  // Schedule email reminder (using EmailJS or similar service)
  async scheduleEmailReminder(reminder) {
    try {
      // This would integrate with a backend service or EmailJS
      // For now, we'll store it and check on reminder time
      console.log('Email reminder scheduled for:', reminder.email);
      
      // You would typically call an API here to schedule the email
      // Example with EmailJS (requires setup):
      // await emailjs.send('service_id', 'template_id', {
      //   to_email: reminder.email,
      //   exam_title: reminder.examTitle,
      //   reminder_date: reminder.reminderDate,
      //   deadline: reminder.deadline
      // });
      
      return true;
    } catch (error) {
      console.error('Error scheduling email:', error);
      return false;
    }
  }

  // Get reminder for a specific exam
  getReminder(userId, examId) {
    try {
      const remindersKey = `reminders_${userId}`;
      const reminders = JSON.parse(localStorage.getItem(remindersKey) || '[]');
      return reminders.find(r => r.examId === examId);
    } catch (error) {
      console.error('Error getting reminder:', error);
      return null;
    }
  }

  // Delete a reminder
  deleteReminder(userId, examId) {
    try {
      const remindersKey = `reminders_${userId}`;
      const reminders = JSON.parse(localStorage.getItem(remindersKey) || '[]');
      const filteredReminders = reminders.filter(r => r.examId !== examId);
      localStorage.setItem(remindersKey, JSON.stringify(filteredReminders));
      return true;
    } catch (error) {
      console.error('Error deleting reminder:', error);
      return false;
    }
  }

  // Get all reminders for a user
  getAllReminders(userId) {
    try {
      const remindersKey = `reminders_${userId}`;
      return JSON.parse(localStorage.getItem(remindersKey) || '[]');
    } catch (error) {
      console.error('Error getting all reminders:', error);
      return [];
    }
  }

  // Send browser notification
  async sendNotification(title, body, icon = '🔔') {
    const hasPermission = await this.requestPermission();
    
    if (hasPermission) {
      new Notification(title, {
        body,
        icon,
        badge: icon,
        vibrate: [200, 100, 200],
        tag: 'exam-reminder'
      });
    } else {
      // Fallback to alert if notification permission denied
      alert(`${title}\n\n${body}`);
    }
  }

  // Check for pending notifications
  checkPendingReminders(userId) {
    const reminders = this.getAllReminders(userId);
    const now = new Date();
    
    reminders.forEach(reminder => {
      const reminderDate = new Date(reminder.reminderDate);
      
      // Check if reminder time has passed and not yet notified
      if (reminderDate <= now && !reminder.notified) {
        this.sendNotification(
          '⏰ Exam Application Reminder',
          `Don't forget! Application deadline for "${reminder.examTitle}" is approaching on ${reminder.deadline}`
        );
        
        // Send email if email address was provided and not yet sent
        if (reminder.email && !reminder.emailSent) {
          this.sendEmailNotification(reminder);
        }
        
        // Mark as notified
        this.markAsNotified(userId, reminder.id);
      }
    });
  }

  // Send email notification
  async sendEmailNotification(reminder) {
    try {
      // This is a placeholder - you would integrate with EmailJS, SendGrid, or your backend API
      console.log(`Sending email to ${reminder.email} for exam: ${reminder.examTitle}`);
      
      // Example: You could use mailto as a fallback (opens user's email client)
      // Or integrate with a service like EmailJS
      
      // For demonstration, we'll just log it
      // In production, you'd call an API endpoint or EmailJS:
      /*
      const response = await fetch('https://your-backend.com/api/send-reminder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: reminder.email,
          subject: `⏰ Exam Reminder: ${reminder.examTitle}`,
          message: `Don't forget! Application deadline for "${reminder.examTitle}" is on ${reminder.deadline}`
        })
      });
      */
      
      return true;
    } catch (error) {
      console.error('Error sending email notification:', error);
      return false;
    }
  }

  // Mark reminder as notified
  markAsNotified(userId, reminderId) {
    try {
      const remindersKey = `reminders_${userId}`;
      const reminders = JSON.parse(localStorage.getItem(remindersKey) || '[]');
      const updatedReminders = reminders.map(r => 
        r.id === reminderId ? { ...r, notified: true } : r
      );
      localStorage.setItem(remindersKey, JSON.stringify(updatedReminders));
    } catch (error) {
      console.error('Error marking as notified:', error);
    }
  }

  // Start checking for notifications every minute
  startNotificationChecker() {
    // Check immediately
    const userId = this.getCurrentUserId();
    if (userId) {
      this.checkPendingReminders(userId);
    }

    // Then check every minute
    setInterval(() => {
      const userId = this.getCurrentUserId();
      if (userId) {
        this.checkPendingReminders(userId);
      }
    }, 60000); // Check every minute
  }

  // Helper to get current user ID from auth context or localStorage
  getCurrentUserId() {
    try {
      // Try to get from localStorage (you might need to adjust this based on your auth implementation)
      const authData = localStorage.getItem('user');
      if (authData) {
        const user = JSON.parse(authData);
        return user.uid;
      }
      return null;
    } catch (error) {
      return null;
    }
  }

  // Calculate suggested reminder dates
  getSuggestedReminderDates(deadlineStr) {
    if (!deadlineStr) return [];
    
    try {
      const deadline = new Date(deadlineStr);
      const suggestions = [];
      
      // 1 day before
      const oneDayBefore = new Date(deadline);
      oneDayBefore.setDate(oneDayBefore.getDate() - 1);
      oneDayBefore.setHours(9, 0, 0, 0);
      
      // 3 days before
      const threeDaysBefore = new Date(deadline);
      threeDaysBefore.setDate(threeDaysBefore.getDate() - 3);
      threeDaysBefore.setHours(9, 0, 0, 0);
      
      // 1 week before
      const oneWeekBefore = new Date(deadline);
      oneWeekBefore.setDate(oneWeekBefore.getDate() - 7);
      oneWeekBefore.setHours(9, 0, 0, 0);
      
      const now = new Date();
      
      if (oneWeekBefore > now) suggestions.push({ label: '1 week before', date: oneWeekBefore });
      if (threeDaysBefore > now) suggestions.push({ label: '3 days before', date: threeDaysBefore });
      if (oneDayBefore > now) suggestions.push({ label: '1 day before', date: oneDayBefore });
      
      return suggestions;
    } catch (error) {
      console.error('Error calculating suggested dates:', error);
      return [];
    }
  }
}

// Export a singleton instance
const notificationService = new NotificationService();
export default notificationService;
