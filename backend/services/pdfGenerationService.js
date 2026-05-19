const PDFDocument = require('pdfkit');
const { Readable } = require('stream');

class PDFGenerationService {
  /**
   * Generate a professional cover letter PDF
   * @param {Object} coverLetterData - Cover letter data
   * @param {string} coverLetterData.text - The cover letter text
   * @param {string} coverLetterData.candidateName - Candidate name
   * @param {string} coverLetterData.candidateEmail - Candidate email
   * @param {string} coverLetterData.candidatePhone - Candidate phone
   * @param {string} coverLetterData.jobTitle - Job title
   * @param {string} coverLetterData.company - Company name
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateCoverLetterPDF(coverLetterData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50,
          },
        });

        const chunks = [];

        // Collect PDF data
        doc.on('data', (chunk) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // Add header with candidate info
        if (coverLetterData.candidateName) {
          doc
            .fontSize(16)
            .font('Helvetica-Bold')
            .text(coverLetterData.candidateName, {
              align: 'left',
            });
        }

        // Add contact info
        const contactInfo = [];
        if (coverLetterData.candidateEmail) {
          contactInfo.push(coverLetterData.candidateEmail);
        }
        if (coverLetterData.candidatePhone) {
          contactInfo.push(coverLetterData.candidatePhone);
        }

        if (contactInfo.length > 0) {
          doc
            .fontSize(10)
            .font('Helvetica')
            .text(contactInfo.join(' | '), {
              align: 'left',
            });
        }

        // Add date
        doc
          .fontSize(10)
          .text(new Date().toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          }), {
            align: 'left',
            margin: [10, 0, 0, 0],
          });

        // Add some space
        doc.moveDown(0.5);

        // Add hiring manager salutation (generic)
        doc
          .fontSize(11)
          .font('Helvetica')
          .text('Dear Hiring Manager,', {
            align: 'left',
          });

        // Add space before body
        doc.moveDown(0.5);

        // Add cover letter body
        doc
          .fontSize(11)
          .font('Helvetica')
          .text(coverLetterData.text, {
            align: 'justify',
            lineGap: 5,
          });

        // Add space before closing
        doc.moveDown(1);

        // Add closing
        doc
          .fontSize(11)
          .font('Helvetica')
          .text('Sincerely,', {
            align: 'left',
          });

        // Add space for signature
        doc.moveDown(2.5);

        // Add name again
        if (coverLetterData.candidateName) {
          doc
            .fontSize(11)
            .font('Helvetica')
            .text(coverLetterData.candidateName, {
              align: 'left',
            });
        }

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Generate a resume PDF with professional formatting
   * @param {Object} resumeData - Resume data
   * @returns {Promise<Buffer>} PDF buffer
   */
  async generateResumePDF(resumeData) {
    return new Promise((resolve, reject) => {
      try {
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 40,
            bottom: 40,
            left: 40,
            right: 40,
          },
        });

        const chunks = [];

        doc.on('data', (chunk) => {
          chunks.push(chunk);
        });

        doc.on('end', () => {
          resolve(Buffer.concat(chunks));
        });

        doc.on('error', reject);

        // Header - Name and contact
        const personalInfo = resumeData.personalInfo || {};
        
        if (personalInfo.fullName) {
          doc
            .fontSize(18)
            .font('Helvetica-Bold')
            .text(personalInfo.fullName, { align: 'center' });
        }

        // Contact info
        const contactLine = [];
        if (personalInfo.email) contactLine.push(personalInfo.email);
        if (personalInfo.phone) contactLine.push(personalInfo.phone);
        if (personalInfo.location) contactLine.push(personalInfo.location);

        if (contactLine.length > 0) {
          doc
            .fontSize(9)
            .font('Helvetica')
            .text(contactLine.join(' | '), { align: 'center' });
        }

        // LinkedIn and GitHub links if available
        const links = [];
        if (personalInfo.linkedinUrl) links.push(`LinkedIn: ${personalInfo.linkedinUrl}`);
        if (personalInfo.githubUrl) links.push(`GitHub: ${personalInfo.githubUrl}`);

        if (links.length > 0) {
          doc.fontSize(8).text(links.join(' | '), { align: 'center' });
        }

        doc.moveTo(40, doc.y + 5).lineTo(555, doc.y + 5).stroke();
        doc.moveDown(0.5);

        // Professional Summary
        if (resumeData.summary) {
          this.addSection(doc, 'PROFESSIONAL SUMMARY', resumeData.summary);
        }

        // Experience
        if (resumeData.experience && resumeData.experience.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('EXPERIENCE');
          doc.moveDown(0.3);

          resumeData.experience.forEach((exp) => {
            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(`${exp.position} at ${exp.company}`);
            
            if (exp.duration) {
              doc.fontSize(9).font('Helvetica').text(exp.duration);
            }
            
            if (exp.description) {
              doc
                .fontSize(10)
                .font('Helvetica')
                .text(exp.description, { lineGap: 2 });
            }
            
            if (exp.highlights && exp.highlights.length > 0) {
              exp.highlights.forEach((highlight) => {
                doc.fontSize(9).text(`• ${highlight}`);
              });
            }
            
            doc.moveDown(0.3);
          });
        }

        // Education
        if (resumeData.education && resumeData.education.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('EDUCATION');
          doc.moveDown(0.3);

          resumeData.education.forEach((edu) => {
            doc
              .fontSize(10)
              .font('Helvetica-Bold')
              .text(`${edu.degree} in ${edu.field}`);
            
            doc
              .fontSize(9)
              .font('Helvetica')
              .text(`${edu.institution}${edu.graduationDate ? ` • ${edu.graduationDate}` : ''}`);
            
            doc.moveDown(0.3);
          });
        }

        // Skills
        if (resumeData.skills && resumeData.skills.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('SKILLS');
          doc.moveDown(0.3);

          const skillNames = resumeData.skills.map((s) => s.name).join(', ');
          doc.fontSize(10).font('Helvetica').text(skillNames);
          doc.moveDown(0.3);
        }

        // Certifications
        if (resumeData.certifications && resumeData.certifications.length > 0) {
          doc.fontSize(12).font('Helvetica-Bold').text('CERTIFICATIONS');
          doc.moveDown(0.3);

          resumeData.certifications.forEach((cert) => {
            doc
              .fontSize(10)
              .font('Helvetica')
              .text(`• ${cert.name}${cert.issuer ? ` - ${cert.issuer}` : ''}`);
          });
        }

        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Add a section to PDF
   */
  addSection(doc, title, content) {
    doc
      .fontSize(12)
      .font('Helvetica-Bold')
      .text(title);
    doc.moveDown(0.3);

    doc
      .fontSize(10)
      .font('Helvetica')
      .text(content, {
        align: 'justify',
        lineGap: 2,
      });
    doc.moveDown(0.5);
  }
}

module.exports = new PDFGenerationService();
