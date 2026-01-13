/**
 * Centralized Test Data Configuration
 * Update test data in this single location - changes will reflect across all test files
 */

export const TEST_DATA = {
  // Application URLs
  urls: {
    dashboard: 'https://qa.oneview.alerahealth.com/dashboard',
    login: 'https://qa.oneview.alerahealth.com/login'
  },

  // Test Patients
  patients: {
    // Patient with most complete data (PRIMARY - use for most test cases)
    completeData: {
      medicaidId: 'NC767095351',
      searchTerm: 'Gar 12/09/1961', // First 3 letters of last name + DOB
      description: 'Patient with most complete data - use for most test cases'
    },

    // Patient for switching/secondary tests
    secondary: {
      medicaidId: 'NC335442919',
      description: 'Secondary patient for patient switch tests'
    },

    // Patient for duplicate search testing (multiple patients with same search criteria)
    duplicateSearch: {
      searchTerm: 'wil 01/29/2020', // Multiple patients match this criteria
      description: 'Search term that returns multiple patients (tests duplicate handling)'
    },

    // Legacy patient (kept for backward compatibility if needed)
    legacy: {
      medicaidId: 'NC160943625',
      description: 'Previously used primary patient'
    }
  },

  // Timeouts and Waits
  timeouts: {
    pageLoad: 2000,
    searchResults: 2000,
    elementVisible: 5000,
    pageReload: 3000
  },

  // Expected Data Patterns
  patterns: {
    phoneNumber: /\(\d{3}\) \d{3}-\d{4}|\d{3}-\d{3}-\d{4}/,
    zipCode: /\d{5}(-\d{4})?/,
    state: /[A-Z]{2}/,
    addressStreet: /\d+\s+[A-Za-z\s]+(?:St|Street|Ave|Avenue|Rd|Road|Blvd|Boulevard|Dr|Drive|Ln|Lane|Way|Ct|Court|Pl|Place)/i
  },

  // Field Labels and Identifiers
  fields: {
    demographic: {
      labels: {
        name: 'Name',
        dob: 'DOB',
        age: 'Age',
        gender: 'Gender',
        address: 'Address',
        city: 'City',
        state: 'State',
        zipCode: 'Zip Code',
        phone: 'Phone'
      }
    },
    pcp: {
      labels: {
        providerName: 'Provider Name',
        phone: 'Phone',
        address: 'Address',
        city: 'City',
        state: 'State'
      }
    }
  },

  // Default values for null/missing data
  defaults: {
    nullDisplay: '-' // Character displayed when data is null/missing
  }
};

/**
 * Helper function to get a patient by scenario
 * @param {string} scenario - 'complete', 'secondary', 'legacy'
 * @returns {object} Patient data
 */
export function getPatient(scenario = 'complete') {
  const patientMap = {
    'complete': TEST_DATA.patients.completeData,
    'secondary': TEST_DATA.patients.secondary,
    'legacy': TEST_DATA.patients.legacy
  };

  return patientMap[scenario] || TEST_DATA.patients.completeData;
}

/**
 * Helper function to get timeout values
 * @param {string} type - timeout type
 * @returns {number} Timeout in milliseconds
 */
export function getTimeout(type) {
  return TEST_DATA.timeouts[type] || 5000;
}
