import sampleData from '../data/jobs.json';

// RapidAPI configuration
const RAPIDAPI_KEY = 'a7301d4997msh19167ea7c00162dp188d11jsne14adad6fd94'; // Replace with your actual key
const RAPIDAPI_HOST = 'sarkari-result.p.rapidapi.com';

// Transform scraped data from jobs.json to our exam format
const transformJobsData = (jobsData) => {
  return jobsData.map((job, index) => {
    const title = job.title || 'Unknown Title';
    const category = determineCategory(title);
    
    // Extract dates from description if available
    const dates = extractDatesFromDescription(job.description || '');
    
    return {
      name: title,
      title: title,
      organization: job.organization || extractOrganization(title) || 'Government of India',
      state: extractState(title) || 'All India',
      category: category,
      qualification: extractQualification(job.eligibility) || 'As per notification',
      applicationStart: dates.startDate || 'Check Notification',
      applicationDeadline: dates.deadline || 'Check Notification',
      examDate: dates.examDate || 'To be announced',
      resultDate: dates.resultDate || 'To be announced',
      applicationFee: formatApplicationFee(job.applicationFee) || 'As per category',
      ageLimit: job.ageLimit || '18-30 years',
      vacancies: extractVacancies(title) || 'Multiple',
      description: cleanDescription(job.description) || 'Visit official website for complete details',
      notificationLink: job.url || '#',
      applicationLink: job.applyLink || job.url || '#'
    };
  });
};

// Helper functions for data transformation
const determineCategory = (title) => {
  const titleLower = title.toLowerCase();
  if (titleLower.includes('upsc') || titleLower.includes('civil services')) return 'UPSC';
  if (titleLower.includes('ssc') || titleLower.includes('staff selection')) return 'SSC';
  if (titleLower.includes('railway') || titleLower.includes('rrb')) return 'Railway';
  if (titleLower.includes('bank') || titleLower.includes('ibps')) return 'Banking';
  if (titleLower.includes('police') || titleLower.includes('constable')) return 'Police';
  if (titleLower.includes('army') || titleLower.includes('navy') || titleLower.includes('air force')) return 'Defense';
  if (titleLower.includes('psc') || titleLower.includes('public service')) return 'State PSC';
  if (titleLower.includes('dsssb')) return 'DSSSB';
  if (titleLower.includes('rssb') || titleLower.includes('rajasthan')) return 'State PSC';
  return 'Other';
};

const extractOrganization = (title) => {
  if (title.includes('DSSSB')) return 'Delhi Subordinate Services Selection Board';
  if (title.includes('RSSB')) return 'Rajasthan Staff Selection Board';
  if (title.includes('UP Police')) return 'Uttar Pradesh Police Recruitment';
  if (title.includes('SSC')) return 'Staff Selection Commission';
  if (title.includes('UPSC')) return 'Union Public Service Commission';
  if (title.includes('Railway') || title.includes('RRB')) return 'Railway Recruitment Board';
  return null;
};

const extractState = (title) => {
  if (title.includes('Delhi') || title.includes('DSSSB')) return 'Delhi';
  if (title.includes('Rajasthan') || title.includes('RSSB')) return 'Rajasthan';
  if (title.includes('UP') || title.includes('Uttar Pradesh')) return 'Uttar Pradesh';
  if (title.includes('All India')) return 'All India';
  return null;
};

const extractVacancies = (title) => {
  const match = title.match(/(\d+[,\d]*)\s*(?:Post|posts|vacancy|vacancies)/i);
  return match ? match[1].replace(',', '') : null;
};

const extractQualification = (eligibility) => {
  if (!eligibility || !Array.isArray(eligibility)) return null;
  const qual = eligibility.join(' ');
  if (qual.includes('10th') || qual.includes('Xth')) return '10th Pass';
  if (qual.includes('12th') || qual.includes('XIIth')) return '12th Pass';
  if (qual.includes('Graduate') || qual.includes('Degree')) return 'Graduate';
  if (qual.includes('Post Graduate')) return 'Post Graduate';
  return null;
};

const extractDatesFromDescription = (description) => {
  const dates = { startDate: null, deadline: null, examDate: null, resultDate: null };
  
  // Try to extract dates from description
  const startMatch = description.match(/Start Date\s*:\s*([\d\s\w]+)/i);
  const deadlineMatch = description.match(/Last Date\s*:\s*([\d\s\w]+)/i);
  const examMatch = description.match(/Exam Date\s*:\s*([\d\s\w]+)/i);
  
  if (startMatch) dates.startDate = startMatch[1].trim();
  if (deadlineMatch) dates.deadline = deadlineMatch[1].trim();
  if (examMatch) dates.examDate = examMatch[1].trim();
  
  return dates;
};

const formatApplicationFee = (feeObj) => {
  if (!feeObj || typeof feeObj !== 'object') return null;
  const feeStr = JSON.stringify(feeObj);
  const match = feeStr.match(/₹\s*\d+/);  
  return match ? match[0] : null;
};

const cleanDescription = (description) => {
  if (!description) return null;
  // Remove HTML/CSS and keep only relevant text
  let cleaned = description.replace(/<[^>]*>/g, ' ');
  cleaned = cleaned.replace(/\{[^}]*\}/g, ' ');
  cleaned = cleaned.replace(/\s+/g, ' ');
  cleaned = cleaned.trim();
  // Return first 300 characters
  return cleaned.length > 300 ? cleaned.substring(0, 300) + '...' : cleaned;
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
    return transformJobsData(data);
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

  // Fallback to sample data (jobs.json)
  console.log('Using jobs.json data as fallback');
  return transformJobsData(sampleData);
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