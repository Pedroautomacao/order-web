const url = () => {
  if (window.location.href.includes('production')) {
    return {
      baseURL: process.env.REACT_APP_API_URL || 'https://api.production.com',
    }
  }

  return {
    baseURL: process.env.REACT_APP_API_URL || 'http://localhost:8000',
  }
}

const { baseURL } = url()
export { baseURL }

