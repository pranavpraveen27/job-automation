const API_ROOT = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

// Auth endpoints
export async function login(email, password) {
  const response = await fetch(`${API_ROOT}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Login failed');
  }

  return response.json();
}

export async function signup(fullName, email, password) {
  const response = await fetch(`${API_ROOT}/api/auth/signup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fullName, email, password }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Signup failed');
  }

  return response.json();
}

// Resume endpoints
export async function uploadResume(file, token) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_ROOT}/api/resumes`, {
    method: 'POST',
    body: formData,
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to upload resume');
  }

  return response.json();
}

export async function getResumes(token) {
  const response = await fetch(`${API_ROOT}/api/resumes`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch resumes');
  }

  return response.json();
}

export async function getResume(resumeId, token) {
  const response = await fetch(`${API_ROOT}/api/resumes/${resumeId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch resume');
  }

  return response.json();
}

// Resume optimization endpoints
export async function getResumeInsights(resumeId, token) {
  const response = await fetch(`${API_ROOT}/api/resumes/${resumeId}/insights`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get resume insights');
  }

  return response.json();
}

export async function getResumeCritique(resumeId, token) {
  const response = await fetch(`${API_ROOT}/api/resumes/${resumeId}/critique`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get resume critique');
  }

  return response.json();
}

export async function getResumeScore(resumeId, token) {
  const response = await fetch(`${API_ROOT}/api/resumes/${resumeId}/score`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to get resume score');
  }

  return response.json();
}

// Cover letter endpoints
export async function generateCoverLetter(payload, token) {
  const response = await fetch(`${API_ROOT}/api/applications/generate-cover-letter`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to generate cover letter');
  }

  return response.json();
}

// Application endpoints
export async function getApplications(token, filters = {}) {
  const query = new URLSearchParams(filters);
  const response = await fetch(`${API_ROOT}/api/applications?${query}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch applications');
  }

  return response.json();
}

export async function getApplication(applicationId, token) {
  const response = await fetch(`${API_ROOT}/api/applications/${applicationId}`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to fetch application');
  }

  return response.json();
}

export async function createApplication(applicationData, token) {
  const response = await fetch(`${API_ROOT}/api/applications`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(applicationData),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to create application');
  }

  return response.json();
}

export async function updateApplication(applicationId, updates, token) {
  const response = await fetch(`${API_ROOT}/api/applications/${applicationId}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to update application');
  }

  return response.json();
}

// PDF export endpoints
export async function downloadCoverLetterPDF(applicationId, token) {
  const response = await fetch(`${API_ROOT}/api/applications/${applicationId}/download-cover-letter`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to download PDF');
  }

  return response.blob();
}

export async function downloadResumePDF(resumeId, token) {
  const response = await fetch(`${API_ROOT}/api/resumes/${resumeId}/download`, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || 'Failed to download PDF');
  }

  return response.blob();
}
