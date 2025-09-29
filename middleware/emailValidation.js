const axios = require('axios');

// Email validation using multiple APIs
async function validateEmailWithAPI(email) {
  try {
    console.log('Trying AbstractAPI validation for:', email);
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_EMAIL_API_KEY}&email=${email}`);
    console.log('AbstractAPI response:', response.data);
    return response.data;
  } catch (error) {
    console.error('AbstractAPI error:', error.response?.data || error.message);
    
    // Try alternative free API - EmailJS
    try {
      console.log('Trying EmailJS validation for:', email);
      const emailJSResponse = await axios.get(`https://api.emailjs.com/api/v1.0/email/validate?email=${email}`);
      console.log('EmailJS response:', emailJSResponse.data);
      
      // Convert EmailJS response to our format
      return {
        is_valid_format: { value: emailJSResponse.data.is_valid },
        is_mx_found: { value: emailJSResponse.data.is_mx_found },
        is_smtp_valid: { value: emailJSResponse.data.is_smtp_valid },
        deliverability: emailJSResponse.data.is_smtp_valid ? 'DELIVERABLE' : 'UNDELIVERABLE'
      };
    } catch (emailJSError) {
      console.error('EmailJS error:', emailJSError.response?.data || emailJSError.message);
      return null;
    }
  }
}

// DNS validation setup
const dns = require('dns');
const { promisify } = require('util');
const resolveMx = promisify(dns.resolveMx);

// Enhanced DNS validation with SMTP-like checks
async function validateEmailWithDNS(email) {
  try {
    console.log('Using enhanced DNS validation for:', email);
    
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
    
    // Extract domain and local part
    const [localPart, domain] = email.split('@');
    console.log('Checking domain:', domain, 'local part:', localPart);
    
    // Check for obviously fake patterns
    const suspiciousPatterns = [
      /^[a-z]{6,}$/,  // 6+ repeated letters like "abcabc"
      /^(test|fake|dummy|sample|example)/i,
      /^[0-9]{6,}$/,  // 6+ numbers
      /^(.)\1{5,}$/,  // Same character repeated 6+ times
    ];
    
    const isSuspicious = suspiciousPatterns.some(pattern => pattern.test(localPart));
    if (isSuspicious) {
      console.log('Email appears suspicious:', localPart);
      return { 
        is_valid_format: { value: true },
        is_mx_found: { value: false },
        is_smtp_valid: { value: false },
        deliverability: 'UNDELIVERABLE'
      };
    }
    
    // Check if domain has MX record
    try {
      const mxRecords = await resolveMx(domain);
      console.log('MX records found:', mxRecords.length > 0);
      
      // For free email providers, be more strict
      const freeProviders = ['gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com'];
      const isFreeProvider = freeProviders.includes(domain.toLowerCase());
      
      if (isFreeProvider) {
        console.log('Free email provider detected, applying stricter validation');
        // For suspicious looking emails on free providers, mark as undeliverable
        if (isSuspicious || localPart.length < 3) {
          return { 
            is_valid_format: { value: true },
            is_mx_found: { value: true },
            is_smtp_valid: { value: false },
            deliverability: 'UNDELIVERABLE'
          };
        }
      }
      
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
  
  // Try API first if available, then fall back to enhanced DNS
  let result = await validateEmailWithAPI(email);
  
  if (!result) {
    console.log('API validation failed, using enhanced DNS validation');
    result = await validateEmailWithDNS(email);
  }
  
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