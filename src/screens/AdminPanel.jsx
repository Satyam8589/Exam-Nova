import React, { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../config/firebaseConfig';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminPanel.css';

const AdminPanel = () => {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingExam, setEditingExam] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    organization: '',
    state: '',
    category: '',
    qualification: '',
    applicationStart: '',
    applicationDeadline: '',
    examDate: '',
    resultDate: '',
    applicationFee: '',
    ageLimit: '',
    vacancies: '',
    description: '',
    notificationLink: '',
    applicationLink: '',
    status: 'draft'
  });
  const [analytics, setAnalytics] = useState({
    totalExams: 0,
    publishedExams: 0,
    draftExams: 0,
    totalViews: 0,
    totalBookmarks: 0
  });
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      checkAdminStatus();
    } else {
      navigate('/');
    }
  }, [user]);

  const checkAdminStatus = async () => {
    try {
      const userDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', user.uid)));
      if (!userDoc.empty) {
        const userData = userDoc.docs[0].data();
        if (userData.role === 'admin') {
          fetchExams();
          fetchAnalytics();
        } else {
          navigate('/');
        }
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
      navigate('/');
    }
  };

  const fetchExams = async () => {
    try {
      const q = query(collection(db, 'exams'), orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      const examData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setExams(examData);
    } catch (error) {
      console.error('Error fetching exams:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const examsSnapshot = await getDocs(collection(db, 'exams'));
      const usersSnapshot = await getDocs(collection(db, 'users'));

      let totalViews = 0;
      let totalBookmarks = 0;
      let publishedCount = 0;
      let draftCount = 0;

      examsSnapshot.forEach(doc => {
        const exam = doc.data();
        totalViews += exam.views || 0;
        if (exam.status === 'published') publishedCount++;
        if (exam.status === 'draft') draftCount++;
      });

      usersSnapshot.forEach(doc => {
        const user = doc.data();
        totalBookmarks += user.bookmarks ? user.bookmarks.length : 0;
      });

      setAnalytics({
        totalExams: examsSnapshot.size,
        publishedExams: publishedCount,
        draftExams: draftCount,
        totalViews,
        totalBookmarks
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const examData = {
        ...formData,
        createdAt: new Date(),
        updatedAt: new Date(),
        views: 0
      };

      if (editingExam) {
        await updateDoc(doc(db, 'exams', editingExam.id), {
          ...examData,
          updatedAt: new Date()
        });
      } else {
        await addDoc(collection(db, 'exams'), examData);
      }

      setShowForm(false);
      setEditingExam(null);
      setFormData({
        title: '',
        organization: '',
        state: '',
        category: '',
        qualification: '',
        applicationStart: '',
        applicationDeadline: '',
        examDate: '',
        resultDate: '',
        applicationFee: '',
        ageLimit: '',
        vacancies: '',
        description: '',
        notificationLink: '',
        applicationLink: '',
        status: 'draft'
      });
      fetchExams();
      fetchAnalytics();
    } catch (error) {
      console.error('Error saving exam:', error);
    }
  };

  const handleEdit = (exam) => {
    setEditingExam(exam);
    setFormData({
      title: exam.title || '',
      organization: exam.organization || '',
      state: exam.state || '',
      category: exam.category || '',
      qualification: exam.qualification || '',
      applicationStart: exam.applicationStart || '',
      applicationDeadline: exam.applicationDeadline || '',
      examDate: exam.examDate || '',
      resultDate: exam.resultDate || '',
      applicationFee: exam.applicationFee || '',
      ageLimit: exam.ageLimit || '',
      vacancies: exam.vacancies || '',
      description: exam.description || '',
      notificationLink: exam.notificationLink || '',
      applicationLink: exam.applicationLink || '',
      status: exam.status || 'draft'
    });
    setShowForm(true);
  };

  const handleDelete = async (examId) => {
    if (window.confirm('Are you sure you want to delete this exam?')) {
      try {
        await deleteDoc(doc(db, 'exams', examId));
        fetchExams();
        fetchAnalytics();
      } catch (error) {
        console.error('Error deleting exam:', error);
      }
    }
  };

  const toggleStatus = async (exam) => {
    try {
      const newStatus = exam.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'exams', exam.id), {
        status: newStatus,
        updatedAt: new Date()
      });
      fetchExams();
      fetchAnalytics();
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  if (loading) {
    return <div className="loading">Loading admin panel...</div>;
  }

  return (
    <div className="admin-panel">
      <h1>Admin Panel</h1>

      <div className="analytics">
        <div className="analytics-card">
          <h3>Total Exams</h3>
          <p>{analytics.totalExams}</p>
        </div>
        <div className="analytics-card">
          <h3>Published</h3>
          <p>{analytics.publishedExams}</p>
        </div>
        <div className="analytics-card">
          <h3>Drafts</h3>
          <p>{analytics.draftExams}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Views</h3>
          <p>{analytics.totalViews}</p>
        </div>
        <div className="analytics-card">
          <h3>Total Bookmarks</h3>
          <p>{analytics.totalBookmarks}</p>
        </div>
      </div>

      <div className="admin-actions">
        <button onClick={() => setShowForm(true)} className="add-btn">
          Add New Exam
        </button>
      </div>

      {showForm && (
        <div className="modal">
          <div className="modal-content">
            <h2>{editingExam ? 'Edit Exam' : 'Add New Exam'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="text"
                  name="title"
                  placeholder="Exam Title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
                <input
                  type="text"
                  name="organization"
                  placeholder="Organization"
                  value={formData.organization}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-row">
                <select name="state" value={formData.state} onChange={handleInputChange} required>
                  <option value="">Select State</option>
                  <option value="central">Central</option>
                  <option value="andhra-pradesh">Andhra Pradesh</option>
                  {/* Add more states */}
                </select>
                <select name="category" value={formData.category} onChange={handleInputChange} required>
                  <option value="">Select Category</option>
                  <option value="upsc">UPSC</option>
                  <option value="ssc">SSC</option>
                  <option value="banking">Banking</option>
                  <option value="railway">Railway</option>
                  <option value="defense">Defense</option>
                  <option value="state-psc">State PSC</option>
                </select>
              </div>

              <div className="form-row">
                <select name="qualification" value={formData.qualification} onChange={handleInputChange} required>
                  <option value="">Select Qualification</option>
                  <option value="10th">10th Pass</option>
                  <option value="12th">12th Pass</option>
                  <option value="graduate">Graduate</option>
                  <option value="post-graduate">Post Graduate</option>
                </select>
                <select name="status" value={formData.status} onChange={handleInputChange}>
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="form-row">
                <input
                  type="date"
                  name="applicationStart"
                  value={formData.applicationStart}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="applicationDeadline"
                  value={formData.applicationDeadline}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="date"
                  name="examDate"
                  value={formData.examDate}
                  onChange={handleInputChange}
                />
                <input
                  type="date"
                  name="resultDate"
                  value={formData.resultDate}
                  onChange={handleInputChange}
                />
              </div>

              <div className="form-row">
                <input
                  type="text"
                  name="applicationFee"
                  placeholder="Application Fee"
                  value={formData.applicationFee}
                  onChange={handleInputChange}
                />
                <input
                  type="text"
                  name="ageLimit"
                  placeholder="Age Limit"
                  value={formData.ageLimit}
                  onChange={handleInputChange}
                />
              </div>

              <input
                type="text"
                name="vacancies"
                placeholder="Number of Vacancies"
                value={formData.vacancies}
                onChange={handleInputChange}
              />

              <textarea
                name="description"
                placeholder="Exam Description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
              />

              <input
                type="url"
                name="notificationLink"
                placeholder="Official Notification Link"
                value={formData.notificationLink}
                onChange={handleInputChange}
              />

              <input
                type="url"
                name="applicationLink"
                placeholder="Application Link"
                value={formData.applicationLink}
                onChange={handleInputChange}
              />

              <div className="form-actions">
                <button type="submit">{editingExam ? 'Update' : 'Create'}</button>
                <button type="button" onClick={() => { setShowForm(false); setEditingExam(null); }}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="exam-table">
        <table>
          <thead>
            <tr>
              <th>Title</th>
              <th>Organization</th>
              <th>Category</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {exams.map(exam => (
              <tr key={exam.id}>
                <td>{exam.title}</td>
                <td>{exam.organization}</td>
                <td>{exam.category}</td>
                <td>
                  <span className={`status ${exam.status}`}>{exam.status}</span>
                </td>
                <td>
                  <button onClick={() => handleEdit(exam)} className="edit-btn">Edit</button>
                  <button onClick={() => toggleStatus(exam)} className="status-btn">
                    {exam.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button onClick={() => handleDelete(exam.id)} className="delete-btn">Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AdminPanel;