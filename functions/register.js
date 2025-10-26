// Netlify Function: register.js
// Simple example that accepts a POST with JSON body and returns a 200 response.
// When deployed on Netlify, this will be available at /.netlify/functions/register

exports.handler = async function(event, context) {
  // Allow CORS for simple testing (adjust origin in production)
  const headers = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers };
  }

  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, headers, body: JSON.stringify({ message: 'Method Not Allowed' }) };
  }

  try {
    const payload = JSON.parse(event.body || '{}');

    // Basic validation
    if (!payload.name || !payload.college) {
      return { statusCode: 400, headers, body: JSON.stringify({ message: 'Missing required fields' }) };
    }

    // TODO: wire this to a database, Google Sheets, SendGrid, or email alert.
    // For now, just log to function logs and echo back.
    console.log('New registration:', payload);

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({ message: 'Registration received — thank you!' })
    };
  } catch (err) {
    console.error('Register function error', err);
    return { statusCode: 500, headers, body: JSON.stringify({ message: 'Server error' }) };
  }
};
