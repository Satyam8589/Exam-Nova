import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchLatestJobs } from '../services/sarkariApi';
import './ExamList.css';

const ExamList = () => {
  const [exams, setExams] = useState([]);
  const [filteredExams, setFilteredExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    state: '',
    category: '',
    qualification: '',
    organization: '',
    status: 'published'
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [exams, filters, searchTerm]);

  const fetchExams = async () => {
    try {
      const data = await fetchLatestJobs();
      console.log('API Response:', data); // Debug: Check what the API actually returns

      // Transform API data to match our exam format with required fields
      const transformedExams = data.map((job, index) => ({
        id: `exam-${index}`,
        title: job.title || job.name || 'Untitled Job',
        name: job.name || job.title || 'Untitled Job',
        organization: job.organization || job.company || 'Government',
        state: job.state || job.location || 'Central',
        category: job.category || job.type || 'General',
        qualification: job.qualification || job.requirements || 'Varies',
        applicationStart: job.applicationStart || job.startDate || '',
        applicationDeadline: job.applicationDeadline || job.deadline || '',
        examDate: job.examDate || job.testDate || '',
        resultDate: job.resultDate || '',
        applicationFee: job.applicationFee || job.fee || 'Varies',
        ageLimit: job.ageLimit || job.age || 'Varies',
        vacancies: job.vacancies || job.positions || 'Multiple',
        description: job.description || job.details || 'No description available',
        notificationLink: job.notificationLink || job.link || '#',
        applicationLink: job.applicationLink || job.applyLink || '#',
        status: job.status || 'published',
        createdAt: job.createdAt || new Date(),
        views: job.views || 0
      }));
      setExams(transformedExams);
    } catch (error) {
      console.error('Error fetching exams:', error);
      // The API service already handles fallback to sample data
      // If we reach here, there might be a network issue
      setExams([]);
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = exams.filter(exam => exam.status === 'published'); // Only show published by default

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(exam =>
        exam.title.toLowerCase().includes(searchLower) ||
        exam.organization.toLowerCase().includes(searchLower) ||
        exam.category.toLowerCase().includes(searchLower)
      );
    }

    if (filters.state) {
      filtered = filtered.filter(exam => exam.state === filters.state);
    }
    if (filters.category) {
      filtered = filtered.filter(exam => exam.category === filters.category);
    }
    if (filters.qualification) {
      filtered = filtered.filter(exam => exam.qualification === filters.qualification);
    }
    if (filters.organization) {
      filtered = filtered.filter(exam => exam.organization === filters.organization);
    }
    if (filters.status) {
      filtered = filtered.filter(exam => exam.status === filters.status);
    }

    setFilteredExams(filtered);
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleExamClick = (exam) => {
    navigate(`/exam/${exam.id}`, { state: { exam } });
  };

  if (loading) {
    return <div className="loading">Loading exams...</div>;
  }

  return (
    <div className="exam-list-container">
      <div className="header-section">
        <h1>🎓 Latest Government Job Notifications</h1>
        <p className="subtitle">Find the latest Sarkari exams and job opportunities</p>
      </div>

      <div className="search-section">
        <input
          type="text"
          className="search-bar"
          placeholder="🔍 Search by job title, organization, or category..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="filters">
        <select
          value={filters.organization}
          onChange={(e) => handleFilterChange('organization', e.target.value)}
        >
          <option value="">All Organizations</option>
          <option value="Union Public Service Commission">UPSC</option>
          <option value="Staff Selection Commission">SSC</option>
          <option value="Railway Recruitment Board">Railway</option>
          <option value="Institute of Banking Personnel Selection">IBPS</option>
          <option value="State Public Service Commissions">State PSC</option>
        </select>

        <select
          value={filters.state}
          onChange={(e) => handleFilterChange('state', e.target.value)}
        >
          <option value="">All States</option>
          <option value="Central">Central</option>
          <option value="All India">All India</option>
          <option value="Delhi">Delhi</option>
          <option value="Uttar Pradesh">Uttar Pradesh</option>
          <option value="Kerala">Kerala</option>
        </select>

        <select
          value={filters.category}
          onChange={(e) => handleFilterChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          <option value="UPSC">UPSC</option>
          <option value="SSC">SSC</option>
          <option value="Banking">Banking</option>
          <option value="Railway">Railway</option>
          <option value="Defense">Defense</option>
          <option value="State PSC">State PSC</option>
          <option value="Police">Police</option>
        </select>

        <select
          value={filters.qualification}
          onChange={(e) => handleFilterChange('qualification', e.target.value)}
        >
          <option value="">All Qualifications</option>
          <option value="Graduate">Graduate</option>
          <option value="10th/12th">10th/12th</option>
          <option value="10th/12th/Graduate">10th/12th/Graduate</option>
          <option value="SSLC">SSLC</option>
        </select>

        <select
          value={filters.status}
          onChange={(e) => handleFilterChange('status', e.target.value)}
        >
          <option value="published">Published</option>
          <option value="draft">Draft</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="exam-grid">
        {filteredExams.map(exam => (
          <div key={exam.id} className="exam-card" onClick={() => handleExamClick(exam)}>
            <div className="exam-card-header">
              <div className="exam-category-badge">
                {exam.category}
              </div>
              <span className="vacancies-badge">📌 {exam.vacancies} Posts</span>
            </div>

            <h3 className="exam-title">{exam.title}</h3>

            <div className="exam-info">
              <div className="info-row">
                <span className="info-icon">🏛️</span>
                <span className="info-value">{exam.organization}</span>
              </div>

              <div className="info-row">
                <span className="info-icon">📍</span>
                <span className="info-value">{exam.state}</span>
              </div>

              <div className="info-row">
                <span className="info-icon">🎓</span>
                <span className="info-value">{exam.qualification}</span>
              </div>
            </div>

            <div className="exam-dates">
              <div className="date-item urgent">
                <span className="date-icon">⏰</span>
                <div className="date-content">
                  <span className="date-label">Last Date:</span>
                  <span className="date-value">{exam.applicationDeadline || 'TBA'}</span>
                </div>
              </div>

              <div className="date-item">
                <span className="date-icon">📅</span>
                <div className="date-content">
                  <span className="date-label">Exam:</span>
                  <span className="date-value">{exam.examDate || 'TBA'}</span>
                </div>
              </div>
            </div>

            <div className="exam-footer">
              <div className="fee-info">
                <span className="fee-icon">💰</span>
                <span className="fee-text">{exam.applicationFee}</span>
              </div>
              <button className="btn-view-details">View Details →</button>
            </div>
          </div>
        ))}
      </div>

      {filteredExams.length === 0 && (
        <div className="no-exams">
          <div className="no-exams-icon">📭</div>
          <h3>No Jobs Found</h3>
          <p>Try adjusting your search or filters</p>
        </div>
      )}
    </div>
  );
};

export default ExamList;