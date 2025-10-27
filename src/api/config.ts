export const getBaseUrl = () => {
  // Allow a runtime override (useful for testing the deployed frontend against a local/tunneled backend)
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const runtime = (window as any).__API_BASE_URL__;
    if (runtime) return runtime;
  } catch (e) {
    // window may be undefined in some build contexts - ignore
  }

  // Default to the Render-deployed backend; allow REACT_APP_API_BASE_URL to override when set
  return process.env.REACT_APP_API_BASE_URL || 'https://springapp-w4kx.onrender.com';
};


