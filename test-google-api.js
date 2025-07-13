// Test script to check Google API response format
const testGoogleAPI = async () => {
  const model = 'gemini-2.0-flash';
  const apiKey = 'YOUR_API_KEY'; // Replace with actual API key
  
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
  
  const requestBody = {
    contents: [
      {
        role: 'user',
        parts: [{ text: 'Hello, how are you?' }],
      },
    ],
    generationConfig: {
      maxOutputTokens: 100,
    },
  };

  try {
    console.log('Testing Google API with model:', model);
    console.log('URL:', url.replace(apiKey, '[API_KEY]'));
    console.log('Request body:', JSON.stringify(requestBody, null, 2));
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log('Response status:', response.status);
    console.log('Response headers:', Object.fromEntries(response.headers.entries()));

    if (!response.ok) {
      const error = await response.text();
      console.error('API error:', error);
      return;
    }

    const data = await response.json();
    console.log('Full response:', JSON.stringify(data, null, 2));
    
    // Try to extract content
    if (data.candidates && data.candidates.length > 0) {
      const candidate = data.candidates[0];
      console.log('First candidate:', JSON.stringify(candidate, null, 2));
      
      if (candidate.content && candidate.content.parts && candidate.content.parts.length > 0) {
        const content = candidate.content.parts[0].text || '';
        console.log('Extracted content:', content);
      }
    }
  } catch (error) {
    console.error('Request failed:', error);
  }
};

// Run the test
testGoogleAPI();
