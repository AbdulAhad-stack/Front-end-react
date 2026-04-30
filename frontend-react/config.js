// Set VITE_API_URL in Vercel dashboard → Settings → Environment Variables
// Value: https://web-production-ecc88.up.railway.app
const API = import.meta.env.VITE_API_URL || "https://web-production-ecc88.up.railway.app";

export default API;
