const axios = require('axios');

// Email validation middleware using AbstractAPI
async function validateEmailWithAPI(email) {
  try {
    // Using AbstractAPI Email Validation - it's more reliable and has better free tier
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_EMAIL_API_KEY}&email=${email}`);
    return response.data;
  } catch (error) {
    console.error('Email validation API error:', error);
    return null;
  }
}

// Fallback validation using DNS lookup
const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);

async function validateEmailWithDNS(email) {
  try {
    // Basic format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { 
        is_valid_format: { value: false },
        is_mx_found: { value: false },
        is_smtp_valid: { value: false }
      };
    }
    
    // Extract domain
    const domain = email.split('@')[1];
    
    // Check if domain has MX record
    try {
      await resolveMx(domain);
      return { 
        is_valid_format: { value: true },
        is_mx_found: { value: true },
        is_smtp_valid: { value: true }
      };
    } catch (error) {
      return { 
        is_valid_format: { value: true },
        is_mx_found: { value: false },
        is_smtp_valid: { value: false }
      };
    }
  } catch (error) {
    console.error('DNS validation error:', error);
    return { 
      is_valid_format: { value: true },
      is_mx_found: { value: true },
      is_smtp_valid: { value: true }
    };
  }
}

// Main email validation function
async function validateEmail(email) {
  console.log('Validating email:', email);
  
  // Try API first, fallback to DNS
  let result = await validateEmailWithAPI(email);
  
  if (!result) {
    console.log('API validation failed, using DNS fallback');
    result = await validateEmailWithDNS(email);
  }
  
  console.log('Email validation result:', result);
  return result;
}

// Email validation middleware
const emailValidationMiddleware = async (req, res, next) => {
  try {
    const email = req.body.email || req.body.patientEmail;
    
    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }
    
    const validation = await validateEmail(email);
    
    if (!validation) {
      return res.status(500).json({ message: 'Email validation service temporarily unavailable.' });
    }
    
    // Check validation results
    if (validation.is_valid_format && validation.is_valid_format.value === false) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    
    if (validation.is_mx_found && validation.is_mx_found.value === false) {
      return res.status(400).json({ message: 'Email domain does not exist.' });
    }
    
    if (validation.is_smtp_valid && validation.is_smtp_valid.value === false) {
      return res.status(400).json({ message: 'Email address does not exist.' });
    }
    
    // If validation passes, continue to next middleware
    next();
    
  } catch (error) {
    console.error('Email validation middleware error:', error);
    // In case of error, proceed without validation (fail open)
    next();
  }
};

module.exports = emailValidationMiddleware;