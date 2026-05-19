class AIService {
  constructor() {
    this.baseUrl = (process.env.AI_SERVICE_URL || 'http://localhost:8000').replace(/\/+$/, '');
  }

  async request(path, options = {}) {
    let response;
    try {
      response = await fetch(`${this.baseUrl}${path}`, options);
    } catch (error) {
      throw new Error(`Python AI service is unreachable at ${this.baseUrl}. Start FastAPI with "python -m fastapi_app.main".`);
    }

    const payload = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(payload.detail || payload.message || `Python AI service failed with ${response.status}`);
    }
    return payload;
  }

  async postJson(path, body) {
    return this.request(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
  }

  normalizeSkills(skills = []) {
    return skills
      .map((skill) => (typeof skill === 'string' ? skill : skill?.name))
      .filter(Boolean);
  }

  // Generate cover letter using Python FastAPI + Qwen
  async generateCoverLetter(candidateInfo, jobInfo) {
    const payload = {
      candidate_name: candidateInfo.fullName || 'Candidate',
      candidate_summary: candidateInfo.experience || candidateInfo.summary || '',
      skills: this.normalizeSkills(candidateInfo.skills),
      job_title: jobInfo.title || 'the role',
      company_name: jobInfo.company || 'the company',
      company_description: [
        jobInfo.description,
        Array.isArray(jobInfo.requirements) ? `Requirements: ${jobInfo.requirements.join(', ')}` : '',
      ].filter(Boolean).join('\n'),
    };

    const result = await this.postJson('/cover-letter/generate', payload);
    return result.cover_letter || '';
  }

  // Extract resume text, skills, and structured fields using Python
  async extractResumeFromFile(file) {
    if (!file?.buffer) {
      return null;
    }

    const formData = new FormData();
    const blob = new Blob([file.buffer], { type: file.mimetype || 'application/pdf' });
    formData.append('file', blob, file.originalname || 'resume.pdf');

    return this.request('/resume/upload', {
      method: 'POST',
      body: formData,
    });
  }

  // Analyze resume against job description
  async analyzeResumeJobMatch(resumeText, jobDescription) {
    const result = await this.postJson('/jobs/analyze', {
      resume_text: resumeText,
      job_description: jobDescription,
    });
    return result.analysis;
  }

  // Extract job recommendations based on resume
  async getJobRecommendations(resumeText, preferenceText) {
    const analysis = await this.analyzeResumeJobMatch(resumeText, preferenceText);
    return analysis.recommendedNextSteps || [];
  }

  // Suggest improvements to resume
  async suggestResumeImprovements(resumeText) {
    const result = await this.postJson('/resume/insights', { resume_text: resumeText });
    return result.insights || [];
  }

  // Critique resume specifically on formatting and visual impact
  async critiqueResumeFormatting(resumeText) {
    const result = await this.postJson('/resume/critique', { resume_text: resumeText });
    return result.critique || [];
  }

  // Analyze overall resume quality with scoring
  async analyzeResumeQuality(resumeText) {
    const result = await this.postJson('/resume/score', { resume_text: resumeText });
    return result.analysis || {};
  }
}

module.exports = new AIService();
