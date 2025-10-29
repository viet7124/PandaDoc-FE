import axios from 'axios';
import { getAuthHeaders } from '../../../utils/authUtils';

const url = import.meta.env.VITE_BASE_URL + 'api';

interface Category {
  id: number;
  name: string;
}

interface Author {
  id: number;
  username: string;
}

interface Template {
  id: number;
  title: string;
  description: string;
  price: number;
  fileUrl: string;
  category: Category;
  author: Author;
}

export interface Collection {
  id: number;
  name: string;
  description: string;
  templateCount: number;
  templates: Template[];
}

// use shared getAuthHeaders to support session/local tokens

// Get all collections of current user
export const getCollections = async (): Promise<Collection[]> => {
  try {
    const response = await axios.get<Collection[]>(`${url}/collections`, {
      headers: getAuthHeaders()
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching collections:', error);
    throw error;
  }
};

// Create a new collection
export const createCollection = async (name: string, description: string): Promise<Collection> => {
  try {
    const response = await axios.post<Collection>(
      `${url}/collections`,
      { name, description },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error creating collection:', error);
    throw error;
  }
};

// Update collection name/description
export const updateCollection = async (
  id: number,
  name: string,
  description: string
): Promise<Collection> => {
  try {
    const response = await axios.put<Collection>(
      `${url}/collections/${id}`,
      { name, description },
      { headers: getAuthHeaders() }
    );
    return response.data;
  } catch (error) {
    console.error('Error updating collection:', error);
    throw error;
  }
};

// Delete a collection
export const deleteCollection = async (id: number): Promise<void> => {
  try {
    await axios.delete(`${url}/collections/${id}`, {
      headers: getAuthHeaders()
    });
  } catch (error) {
    console.error('Error deleting collection:', error);
    throw error;
  }
};

// Add template to collection
export const addTemplateToCollection = async (
  collectionId: number,
  templateId: number
): Promise<void> => {
  try {
    await axios.post(
      `${url}/collections/${collectionId}/templates`,
      { templateId },
      { 
        headers: {
          ...getAuthHeaders(),
          'Content-Type': 'application/json'
        }
      }
    );
  } catch (error) {
    console.error('Error adding template to collection:', error);
    throw error;
  }
};

// Remove template from collection
export const removeTemplateFromCollection = async (
  collectionId: number,
  templateId: number
): Promise<void> => {
  try {
    await axios.delete(
      `${url}/collections/${collectionId}/templates/${templateId}`,
      { headers: getAuthHeaders() }
    );
  } catch (error) {
    console.error('Error removing template from collection:', error);
    throw error;
  }
};

