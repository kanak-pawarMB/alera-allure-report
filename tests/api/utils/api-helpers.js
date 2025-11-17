/**
 * API Test Helper Functions
 *
 * Reusable utilities for API testing
 */

/**
 * Get authentication token by logging in
 * @param {Object} apiContext - Playwright API request context
 * @returns {Promise<string>} - Authentication token
 */
export async function getAuthToken(apiContext) {
  try {
    const response = await apiContext.post('/api/auth/login', {
      data: {
        username: process.env.API_USERNAME,
        password: process.env.API_PASSWORD,
      },
    });

    if (!response.ok()) {
      throw new Error(`Login failed with status ${response.status()}`);
    }

    const data = await response.json();

    // Support multiple token field names
    const token = data.token ||
                  data.accessToken ||
                  data.access_token ||
                  data.authToken;

    if (!token) {
      throw new Error('No token found in login response');
    }

    return token;
  } catch (error) {
    console.error('Failed to get auth token:', error.message);
    throw error;
  }
}

/**
 * Create a test patient for testing purposes
 * @param {Object} apiContext - Playwright API request context
 * @param {string} authToken - Authentication token
 * @returns {Promise<Object>} - Created patient object
 */
export async function createTestPatient(apiContext, authToken) {
  const timestamp = Date.now();
  const patientData = {
    firstName: `Test`,
    lastName: `Patient-${timestamp}`,
    dateOfBirth: '1990-01-15',
    email: `test.patient.${timestamp}@example.com`,
    phone: '555-0100',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'CA',
      zipCode: '12345',
    },
  };

  const response = await apiContext.post('/api/patients', {
    headers: {
      'Authorization': `Bearer ${authToken}`,
    },
    data: patientData,
  });

  if (!response.ok()) {
    throw new Error(`Failed to create test patient: ${response.status()}`);
  }

  return await response.json();
}

/**
 * Delete a patient by ID
 * @param {Object} apiContext - Playwright API request context
 * @param {string} authToken - Authentication token
 * @param {string|number} patientId - Patient ID to delete
 * @returns {Promise<boolean>} - True if deleted successfully
 */
export async function deletePatient(apiContext, authToken, patientId) {
  try {
    const response = await apiContext.delete(`/api/patients/${patientId}`, {
      headers: {
        'Authorization': `Bearer ${authToken}`,
      },
      failOnStatusCode: false,
    });

    return response.ok();
  } catch (error) {
    console.error(`Failed to delete patient ${patientId}:`, error.message);
    return false;
  }
}

/**
 * Create authenticated request headers
 * @param {string} authToken - Authentication token
 * @param {Object} additionalHeaders - Additional headers to include
 * @returns {Object} - Headers object
 */
export function getAuthHeaders(authToken, additionalHeaders = {}) {
  return {
    'Authorization': `Bearer ${authToken}`,
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    ...additionalHeaders,
  };
}

/**
 * Wait for API to be ready (useful for CI/CD)
 * @param {Object} apiContext - Playwright API request context
 * @param {number} maxRetries - Maximum number of retries
 * @param {number} retryDelay - Delay between retries in milliseconds
 * @returns {Promise<boolean>} - True if API is ready
 */
export async function waitForAPIReady(apiContext, maxRetries = 10, retryDelay = 2000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await apiContext.get('/healthCheck', {
        timeout: 5000,
      });

      if (response.ok()) {
        console.log('API is ready');
        return true;
      }
    } catch (error) {
      console.log(`API not ready, attempt ${i + 1}/${maxRetries}`);
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  console.error('API did not become ready in time');
  return false;
}

/**
 * Generate random test data
 */
export const testDataGenerator = {
  /**
   * Generate random email
   * @param {string} prefix - Email prefix
   * @returns {string} - Random email address
   */
  randomEmail(prefix = 'test') {
    return `${prefix}.${Date.now()}@example.com`;
  },

  /**
   * Generate random phone number
   * @returns {string} - Random phone number
   */
  randomPhone() {
    const areaCode = Math.floor(Math.random() * 900) + 100;
    const prefix = Math.floor(Math.random() * 900) + 100;
    const lineNumber = Math.floor(Math.random() * 9000) + 1000;
    return `${areaCode}-${prefix}-${lineNumber}`;
  },

  /**
   * Generate random date of birth
   * @param {number} minAge - Minimum age in years
   * @param {number} maxAge - Maximum age in years
   * @returns {string} - Date string in YYYY-MM-DD format
   */
  randomDateOfBirth(minAge = 18, maxAge = 80) {
    const today = new Date();
    const year = today.getFullYear() - Math.floor(Math.random() * (maxAge - minAge + 1)) - minAge;
    const month = String(Math.floor(Math.random() * 12) + 1).padStart(2, '0');
    const day = String(Math.floor(Math.random() * 28) + 1).padStart(2, '0');
    return `${year}-${month}-${day}`;
  },
};

/**
 * Validate API response structure
 * @param {Object} response - API response object
 * @param {Array<string>} requiredFields - Array of required field names
 * @throws {Error} - If validation fails
 */
export function validateResponseStructure(response, requiredFields) {
  const missingFields = requiredFields.filter(field => !(field in response));

  if (missingFields.length > 0) {
    throw new Error(`Response missing required fields: ${missingFields.join(', ')}`);
  }
}

/**
 * Log API response for debugging
 * @param {string} testName - Name of the test
 * @param {Object} response - Playwright response object
 */
export async function logAPIResponse(testName, response) {
  console.log(`\n=== ${testName} ===`);
  console.log(`Status: ${response.status()} ${response.statusText()}`);
  console.log(`URL: ${response.url()}`);

  try {
    const body = await response.json();
    console.log('Response Body:', JSON.stringify(body, null, 2));
  } catch (error) {
    console.log('Response Body: (not JSON)');
  }
  console.log('=================\n');
}
