export const getBaseUrl = () => {
  // Default backend port 8080
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
};


