
const API_BASE_URL = process.env.VUE_APP_API_BASE_URL || 'http://localhost:8080';

export const API_URLS = {
  CALCULATOR: `${API_BASE_URL}/tax-calculator`,
  CREATE_RECORD: `${API_BASE_URL}/tax-calculator/create-record`,
  DELETE_RECORD: (id: string) => `${API_BASE_URL}/tax-calculator/delete-record/${id}`,
  GET_CALCULATION_HISTORY: `${API_BASE_URL}/tax-calculator/calculation-history`,
};

export default API_URLS;
