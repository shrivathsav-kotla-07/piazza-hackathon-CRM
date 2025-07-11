// File Service - Handles file upload and document processing
export class FileService {
  // Process uploaded files and extract lead data
  static processFiles(files) {
    const processedLeads = [];
    
    files.forEach(file => {
      if (this.isValidFileType(file)) {
        const extractedData = this.extractDataFromFile(file);
        processedLeads.push(extractedData);
      }
    });
    
    return processedLeads;
  }

  // Check if file type is supported
  static isValidFileType(file) {
    const supportedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif'
    ];
    
    return supportedTypes.includes(file.type);
  }

  // Extract lead data from uploaded file (mock implementation)
  static extractDataFromFile(file) {
    // In a real application, this would use OCR or PDF parsing
    // For now, we'll generate mock data
    const mockExtractedData = {
      name: `Extracted User ${Math.floor(Math.random() * 1000)}`,
      email: `user${Math.floor(Math.random() * 1000)}@example.com`,
      phone: 'N/A',
      status: 'New',
      source: 'Document',
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    return mockExtractedData;
  }

  // Handle drag and drop events
  static handleDragOver(e) {
    e.preventDefault();
    return true;
  }

  static handleDragLeave(e) {
    e.preventDefault();
    return false;
  }

  static handleDrop(e) {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    return files;
  }

  // Format file size for display
  static formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Get file extension
  static getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
  }

  // Validate file size (max 10MB)
  static isValidFileSize(file) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    return file.size <= maxSize;
  }
} 