import axios from 'axios';
import { isPossiblePhoneNumber } from 'react-phone-number-input';

const API_URL = '/api/leads'; // Use relative URL for Vite proxy

// Lead Service - Handles all lead-related operations
export class LeadService {
  // Get leads with pagination, filtering, and sorting
  static async getLeads(page = 1, filter = 'all', sort = { field: 'createdAt', order: 'desc' }, limit = 10) {
    try {
      const params = {
        page,
        limit,
        filter,
        sortField: sort.field,
        sortOrder: sort.order,
      };
      const response = await axios.get(API_URL, { params });
      return response.data;
    } catch (error) {
      console.error('Error fetching leads:', error);
      throw error;
    }
  }

  // Create a new lead
  static async createLead(leadData) {
    try {
      // If the source is 'document/image', use the new FastAPI endpoint
      if (leadData.source === 'document/image') {
        const response = await axios.post('/save_lead', leadData); // Use relative URL for Vite proxy
        return response.data;
      } else {
        // Otherwise, use the existing API_URL
        const response = await axios.post(API_URL, leadData);
        return response.data;
      }
    } catch (error) {
      console.error('Error creating lead:', error);
      throw error;
    }
  }

  // Update lead status
  static async updateLeadStatus(id, newStatus) {
    try {
      const response = await axios.patch(`${API_URL}/${id}`, { status: newStatus });
      return response.data;
    } catch (error) {
      console.error('Error updating lead status:', error);
      throw error;
    }
  }

  // Delete a lead
  static async deleteLead(id) {
    try {
      await axios.delete(`${API_URL}/${id}`);
    } catch (error) {
      console.error('Error deleting lead:', error);
      throw error;
    }
  }

  // Validate lead data
  static validateLead(leadData) {
    const errors = [];
    
    if (!leadData.name || leadData.name.trim() === '') {
      errors.push('Name is required');
    }
    
    if (!leadData.email || leadData.email.trim() === '') {
      errors.push('Email is required');
    } else if (!this.isValidEmail(leadData.email)) {
      errors.push('Please enter a valid email address');
    }

    if (leadData.phone && !isPossiblePhoneNumber(leadData.phone)) {
      errors.push('Please enter a valid phone number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  // Email validation helper
  static isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}
