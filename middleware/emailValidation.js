const axios = require('axios');

// Email validation middleware using AbstractAPI
async function validateEmailWithAPI(email) {
  try {
    console.log('Trying AbstractAPI validation for:', email);
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_EMAIL_API_KEY}&email=${email}`);
    console.log('AbstractAPI response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Email validation API error:', error.response?.data || error.message);
    return null;
  }
}

// Fallback validation using DNS lookup
const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);

async function validateEmailWithDNS(email) {
  try {
    console.log('Using DNS validation for:', email);
    
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('Email format invalid');
      return { 
        is_valid_format: { value: false },
        is_mx_found: { value: false },
        is_smtp_valid: { value: false },
        deliverability: 'UNDELIVERABLE'
      };
    }
    
    // Extract domain
    const domain = email.split('@')[1];
    console.log('Checking domain:', domain);
    
    // Check if domain has MX record
    try {
      const mxRecords = await resolveMx(domain);
      console.log('MX records found:', mxRecords.length > 0);
      return { 
        is_valid_format: { value: true },
        is_mx_found: { value: true },
        is_smtp_valid: { value: true },
        deliverability: 'DELIVERABLE'
      };
    } catch (error) {
      console.log('No MX records found for domain');
      return { 
        is_valid_format: { value: true },
        is_mx_found: { value: false },
        is_smtp_valid: { value: false },
        deliverability: 'UNDELIVERABLE'
      };
    }
  } catch (error) {
    console.error('DNS validation error:', error);
    // For DNS errors, fail safe (reject)
    return { 
      is_valid_format: { value: false },
      is_mx_found: { value: false },
      is_smtp_valid: { value: false },
      deliverability: 'UNDELIVERABLE'
    };
  }
}

// Main email validation function
async function validateEmail(email) {
  console.log('Starting validation for email:', email);
  
  // Always use DNS validation for now since API key is invalid
  // You can get a free API key from https://app.abstractapi.com/
  let result = await validateEmailWithDNS(email);
  
  console.log('Final validation result:', result);
  return result;
}

// Email validation middleware
const emailValidationMiddleware = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.patientEmail;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    
    console.log('Email validation middleware called for:', email);
    const validation = await validateEmail(email);
    
    if (!validation) {
      return res.status(500).json({ message: 'Email validation service temporarily unavailable.' });
    }
    
    // Check validation results - be more strict
    if (validation.is_valid_format && validation.is_valid_format.value === false) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    
    if (validation.is_mx_found && validation.is_mx_found.value === false) {
      return res.status(400).json({ message: 'Email domain does not exist or cannot receive emails.' });
    }
    
    // Also check deliverability if available
    if (validation.deliverability === 'UNDELIVERABLE') {
      return res.status(400).json({ message: 'Email address is not deliverable.' });
    }
    
    console.log('Email validation passed, proceeding to next middleware');
    // If validation passes, continue to next middleware
    next();
    
  } catch (error) {
    console.error('Email validation middleware error:', error);
    // Changed to fail closed - reject on error instead of allowing
    return res.status(500).json({ message: 'Email validation failed. Please try again.' });
  }
};

module.exports = emailValidationMiddleware;