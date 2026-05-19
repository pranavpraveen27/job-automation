const OpenAI = require('openai');

class AIService {
  constructor() {
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  }

  // Generate cover letter using OpenAI
  async generateCoverLetter(candidateInfo, jobInfo) {
    try {
      const prompt = `
        Generate a professional cover letter for the following candidate and job posting:
        
        CANDIDATE:
        Name: ${candidateInfo.fullName}
        Email: ${candidateInfo.email}
        Experience: ${candidateInfo.experience}
        Skills: ${candidateInfo.skills.join(', ')}
        
        JOB:
        Title: ${jobInfo.title}
        Company: ${jobInfo.company}
        Description: ${jobInfo.description}
        Requirements: ${jobInfo.requirements.join(', ')}
        
        Please generate a compelling, personalized cover letter that highlights relevant skills and experience.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a professional cover letter writer. Write compelling, personalized cover letters.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating cover letter:', error);
      throw error;
    }
  }

  // Analyze resume against job description
  async analyzeResumeJobMatch(resumeText, jobDescription) {
    try {
      const prompt = `
        Analyze how well this resume matches the job description.
        
        RESUME:
        ${resumeText}
        
        JOB DESCRIPTION:
        ${jobDescription}
        
        Provide:
        1. Match score (0-100)
        2. Top matching skills
        3. Missing skills
        4. Overall assessment
        
        Format as JSON.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter analyzing resume-job matches. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 500,
        temperature: 0.3,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing resume-job match:', error);
      throw error;
    }
  }

  // Extract job recommendations based on resume
  async getJobRecommendations(resumeText, preferenceText) {
    try {
      const prompt = `
        Based on this resume and job preferences, suggest 5 types of roles that would be a good fit.
        
        RESUME:
        ${resumeText}
        
        PREFERENCES:
        ${preferenceText}
        
        For each recommendation, provide:
        1. Job title
        2. Why it's a good fit
        3. Expected salary range
        4. Growth potential
        
        Format as JSON array.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are a career advisor. Provide thoughtful job recommendations. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 800,
        temperature: 0.6,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error getting recommendations:', error);
      throw error;
    }
  }

  // Suggest improvements to resume
  async suggestResumeImprovements(resumeText) {
    try {
      const prompt = `
        Analyze this resume and suggest 5-10 specific improvements to make it more effective for job applications.
        
        RESUME:
        ${resumeText}
        
        For each suggestion, provide:
        1. Current issue
        2. Recommended change
        3. Why it improves the resume
        4. Priority (high/medium/low)
        
        Format as JSON array.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert resume writer. Provide constructive, actionable improvements. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1000,
        temperature: 0.5,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error suggesting improvements:', error);
      throw error;
    }
  }

  // Critique resume specifically on formatting and visual impact
  async critiqueResumeFormatting(resumeText) {
    try {
      const prompt = `
        Analyze this resume specifically for formatting and visual impact on recruiters.
        
        RESUME:
        ${resumeText}
        
        For each critique point, provide:
        1. Formatting issue or strength
        2. Visual impact on recruiter
        3. Specific recommendation to improve
        4. Severity (critical/high/medium/low)
        
        Focus on:
        - White space and readability
        - Section organization
        - Bullet point structure
        - Length and conciseness
        - Visual hierarchy
        - ATS (Applicant Tracking System) compatibility
        
        Format as JSON array.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert recruiter and resume formatter. Analyze resumes for visual impact and ATS compatibility. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1200,
        temperature: 0.5,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error critiquing resume formatting:', error);
      throw error;
    }
  }

  // Analyze overall resume quality with scoring
  async analyzeResumeQuality(resumeText) {
    try {
      const prompt = `
        Perform a comprehensive quality analysis of this resume and provide a score.
        
        RESUME:
        ${resumeText}
        
        Provide analysis for:
        1. Content Quality (0-100)
        2. Formatting Quality (0-100)
        3. ATS Compatibility (0-100)
        4. Impact Potential (0-100)
        
        For each category, include:
        - Score
        - Top 2 strengths
        - Top 2 weaknesses
        - Key action items
        
        Also provide:
        - Overall resume score (average of all categories)
        - Executive summary (2-3 sentences)
        - Top 3 priorities for improvement
        
        Format as JSON.
      `;

      const response = await this.client.chat.completions.create({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an expert career coach analyzing resume quality comprehensively. Return valid JSON only.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
        max_tokens: 1500,
        temperature: 0.4,
      });

      return JSON.parse(response.choices[0].message.content);
    } catch (error) {
      console.error('Error analyzing resume quality:', error);
      throw error;
    }
  }
}

module.exports = new AIService();
