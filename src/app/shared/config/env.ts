export const ENV = {
  API_URL: import.meta.env.VITE_API_URL || '/api',
  NODE_ENV: import.meta.env.MODE,
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
}