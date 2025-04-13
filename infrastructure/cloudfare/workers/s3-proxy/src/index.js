addEventListener('fetch', event => {
    event.respondWith(handleRequest(event.request))
  })
  
  async function handleRequest(request) {
    // Get the original URL and parse it
    const url = new URL(request.url)
    
    // Extract path from the request
    const path = url.pathname
    
    // Set target S3 bucket
    const s3BucketUrl = S3_BUCKET_URL;
    
    // Construct the new S3 URL
    const s3Url = s3BucketUrl + path
    
    // Clone the original request
    const modifiedRequest = new Request(s3Url, {
      method: request.method,
      headers: request.headers,
      body: request.body
    })
    
    // Forward the request to S3
    try {
      const response = await fetch(modifiedRequest)
      
      // Create a new response with appropriate headers
      const modifiedResponse = new Response(response.body, response)
      
      // Add CORS headers if needed
      modifiedResponse.headers.set('Access-Control-Allow-Origin', '*')
      
      return modifiedResponse
    } catch (error) {
      return new Response(`Error accessing S3: ${error.message}`, { status: 500 })
    }
  }