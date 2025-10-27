export const getBaseUrl = () => {
  // Allow a runtime override (useful for testing the deployed frontend against a local/tunneled backend)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtime = (window as any).__API_BASE_URL__;
    if (runtime) return runtime;
  } catch (e) {
    // window may be undefined in some build contexts - ignore
  }

  // Default backend port 8080
  return process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
};


