import sampleData from '../data/data.json';

// RapidAPI configuration
const RAPIDAPI_KEY = 'YOUR_RAPIDAPI_KEY_HERE'; // Replace with your actual key
const RAPIDAPI_HOST = 'sarkari-result.p.rapidapi.com';

// Transform RapidAPI response to our data format
const transformRapidApiData = (apiData) => {
  // Assuming the API returns an array of job objects
  // Adjust this transformation based on actual API response structure
  return apiData.map(job => ({
    name: job.title || job.name || 'Unknown Title',
    title: job.title || job.name || 'Unknown Title',
    organization: job.organization || job.department || 'Unknown Organization',
    state: job.state || job.location || 'All India',
    category: job.category || determineCategory(job.title),
    qualification: job.qualification || job.eligibility || 'Varies',
    applicationStart: job.applicationStart || job.startDate,
    applicationDeadline: job.applicationDeadline || job.deadline || job.lastDate,
    examDate: job.examDate || job.testDate,
    resultDate: job.resultDate || job.declarationDate,
    applicationFee: job.fee || job.applicationFee || 'Varies',
    ageLimit: job.ageLimit || job.age || '18+ years',
    vacancies: job.vacancies || job.posts || 'To be announced',
    description: job.description || job.details || 'No description available',
    notificationLink: job.notificationLink || job.pdfLink || '#',
    applicationLink: job.applicationLink || job.applyLink || '#'
  }));
};

// Determine category based on title keywords
const determineCategory = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('upsc') || titleLower.includes('civil services')) return 'UPSC';
  if (titleLower.includes('ssc') || titleLower.includes('staff selection')) return 'SSC';
  if (titleLower.includes('railway') || titleLower.includes('rrb')) return 'Railway';
  if (titleLower.includes('bank') || titleLower.includes('ibps')) return 'Banking';
  if (titleLower.includes('police') || titleLower.includes('constable')) return 'Police';
  if (titleLower.includes('army') || titleLower.includes('navy') || titleLower.includes('air force')) return 'Defense';
  if (titleLower.includes('psc') || titleLower.includes('public service')) return 'State PSC';
  return 'Other';
};

// Fetch data from RapidAPI
const fetchFromRapidAPI = async () => {
  try {
    const response = await fetch('https://sarkari-result.p.rapidapi.com/', {
      method: 'GET',
      headers: {
        'X-RapidAPI-Key': RAPIDAPI_KEY,
        'X-RapidAPI-Host': RAPIDAPI_HOST
      }
    });

    if (!response.ok) {
      throw new Error(`RapidAPI request failed: ${response.status}`);
    }

    const data = await response.json();
    console.log('RapidAPI response:', data);

    // Transform the data to match our format
    return transformRapidApiData(data);
  } catch (error) {
    console.error('RapidAPI fetch failed:', error);
    throw error;
  }
};

// Main function to fetch latest jobs with fallback
export const fetchLatestJobs = async () => {
  try {
    // Try RapidAPI first
    console.log('Attempting to fetch from RapidAPI...');
    const apiData = await fetchFromRapidAPI();
    if (apiData && apiData.length > 0) {
      console.log('Successfully fetched data from RapidAPI');
      return apiData;
    }
  } catch (error) {
    console.warn('RapidAPI failed, falling back to sample data:', error.message);
  }

  // Fallback to sample data
  console.log('Using sample data as fallback');
  return sampleData;
};

// Fetch job details (if API supports it)
export const fetchJobDetails = async (jobId) => {
  try {
    // Try to get details from RapidAPI if available
    // This would need specific endpoint for job details
    console.log('Job details fetch not implemented yet');
    return null;
  } catch (error) {
    console.error('Error fetching job details:', error);
    return null;
  }
};