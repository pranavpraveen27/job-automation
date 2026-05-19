const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

class PDFService {
  /**
   * Generate a professional PDF from cover letter text
   * @param {Object} data - Cover letter data
   * @param {string} data.candidateName - Candidate's name
   * @param {string} data.company - Company name
   * @param {string} data.coverLetterText - The cover letter content
   * @param {string} data.date - Date of generation (optional)
   * @returns {Promise<Buffer>} PDF buffer
   */
  static async generateCoverLetterPDF(data) {
    return new Promise((resolve, reject) => {
      try {
        const {
          candidateName = 'Candidate',
          company = 'Company',
          coverLetterText = '',
          date = new Date().toLocaleDateString(),
        } = data;

        // Create PDF document
        const doc = new PDFDocument({
          size: 'letter',
          margin: 50,
        });

        // Buffer to store PDF
        const chunks = [];
        doc.on('data', chunk => chunks.push(chunk));
        doc.on('end', () => {
          const buffer = Buffer.concat(chunks);
          resolve(buffer);
        });
        doc.on('error', reject);

        // Header
        doc.fontSize(11).text(candidateName, { align: 'left' });
        doc.fontSize(10).text(date, { align: 'left' });
        doc.moveDown(0.5);

        // Recipient and subject
        doc.fontSize(11)
          .text(company, { align: 'left' })
          .moveDown(0.5);

        // Salutation
        doc.fontSize(11).text('Dear Hiring Manager,', { align: 'left' }).moveDown(0.5);

        // Body - wrap text at word boundaries
        const bodyText = coverLetterText || 'No cover letter content provided.';
        doc.fontSize(11)
          .font('Helvetica')
          .text(bodyText, {
            align: 'left',
            width: 500,
            lineGap: 5,
          });

        doc.moveDown(1);

        // Closing
        doc.fontSize(11).text('Best regards,', { align: 'left' }).moveDown(2);

        // Signature space
        doc.text('_________________________', { align: 'left' });
        doc.fontSize(10).text(candidateName, { align: 'left' });

        // Footer
        doc
          .moveDown(1)
          .fontSize(8)
          .text('Generated with AI Recruit - Smart Job Application Assistant', {
            align: 'center',
            color: '#666666',
          });

        // Finalize PDF
        doc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Save PDF to file system
   * @param {Buffer} pdfBuffer - PDF buffer
   * @param {string} fileName - Name of the file to save
   * @returns {string} Path to saved file
   */
  static savePDFToFile(pdfBuffer, fileName) {
    const uploadsDir = path.join(__dirname, '../uploads/cover-letters');

    // Ensure directory exists
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, pdfBuffer);
    return filePath;
  }

  /**
   * Get downloadable filename
   * @param {string} candidateName - Candidate name
   * @param {string} company - Company name
   * @returns {string} Formatted filename
   */
  static generateFileName(candidateName = 'Candidate', company = 'Company') {
    const timestamp = new Date().getTime();
    const sanitized = `${candidateName}_${company}_${timestamp}`.replace(/\s+/g, '_').toLowerCase();
    return `cover_letter_${sanitized}.pdf`;
  }
}

module.exports = PDFService;
