exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'method not allowed' }) };
  }

  let password;
  try {
    password = JSON.parse(event.body || '{}').password;
  } catch (e) {
    return { statusCode: 400, body: JSON.stringify({ error: 'invalid request' }) };
  }

  const correctPassword = process.env.LIFELINE_PASSWORD;
  if (!correctPassword || password !== correctPassword) {
    return { statusCode: 401, body: JSON.stringify({ error: 'invalid password' }) };
  }

  let data;
  try {
    data = JSON.parse(process.env.LIFELINE_DATA || '[]');
  } catch (e) {
    data = [];
  }

  return {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ data }),
  };
};
