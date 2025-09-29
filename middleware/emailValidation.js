const axios = require('axios');

// Email validation using multiple professional APIs
async function validateEmailWithAPI(email) {
  // Method 1: Try Hunter.io Email Verifier (100 free requests/month)
  try {
    console.log('Trying Hunter.io validation for:', email);
    const hunterResponse = await axios.get(`https://api.hunter.io/v2/email-verifier?email=${email}&api_key=${process.env.HUNTER_API_KEY}`);
    console.log('Hunter.io response:', hunterResponse.data);
    
    if (hunterResponse.data && hunterResponse.data.data) {
      const result = hunterResponse.data.data;
      return {
        is_valid_format: { value: result.regexp || false },
        is_mx_found: { value: result.mx || false },
        is_smtp_valid: { value: result.smtp_check || false },
        deliverability: result.result === 'deliverable' ? 'DELIVERABLE' : 'UNDELIVERABLE',
        confidence: result.score || 0,
        api_used: 'Hunter.io'
      };
    }
  } catch (error) {
    console.error('Hunter.io error:', error.response?.data || error.message);
  }

  // Method 2: Try ZeroBounce API (2000 free credits)
  try {
    console.log('Trying ZeroBounce validation for:', email);
    const zeroBounceResponse = await axios.get(`https://api.zerobounce.net/v2/validate?api_key=${process.env.ZEROBOUNCE_API_KEY}&email=${email}`);
    console.log('ZeroBounce response:', zeroBounceResponse.data);
    
    if (zeroBounceResponse.data) {
      const result = zeroBounceResponse.data;
      return {
        is_valid_format: { value: result.status !== 'invalid' },
        is_mx_found: { value: result.mx_found || false },
        is_smtp_valid: { value: ['valid', 'catch-all'].includes(result.status) },
        deliverability: ['valid', 'catch-all'].includes(result.status) ? 'DELIVERABLE' : 'UNDELIVERABLE',
        confidence: result.status === 'valid' ? 100 : 0,
        api_used: 'ZeroBounce'
      };
    }
  } catch (error) {
    console.error('ZeroBounce error:', error.response?.data || error.message);
  }

  // Method 3: Try EmailListVerify (1000 free verifications)
  try {
    console.log('Trying EmailListVerify validation for:', email);
    const elvResponse = await axios.get(`https://apps.emaillistverify.com/api/verifyEmail?secret=${process.env.EMAILLISTVERIFY_KEY}&email=${email}`);
    console.log('EmailListVerify response:', elvResponse.data);
    
    if (elvResponse.data) {
      const isValid = elvResponse.data.status === 'ok';
      return {
        is_valid_format: { value: isValid },
        is_mx_found: { value: isValid },
        is_smtp_valid: { value: isValid },
        deliverability: isValid ? 'DELIVERABLE' : 'UNDELIVERABLE',
        confidence: isValid ? 90 : 0,
        api_used: 'EmailListVerify'
      };
    }
  } catch (error) {
    console.error('EmailListVerify error:', error.response?.data || error.message);
  }

  // Method 4: Try AbstractAPI (if you get a valid key)
  try {
    console.log('Trying AbstractAPI validation for:', email);
    const response = await axios.get(`https://emailvalidation.abstractapi.com/v1/?api_key=${process.env.ABSTRACT_EMAIL_API_KEY}&email=${email}`);
    console.log('AbstractAPI response:', response.data);
    
    if (response.data) {
      return {
        is_valid_format: { value: response.data.is_valid_format?.value || false },
        is_mx_found: { value: response.data.is_mx_found?.value || false },
        is_smtp_valid: { value: response.data.is_smtp_valid?.value || false },
        deliverability: response.data.deliverability || 'UNKNOWN',
        confidence: response.data.quality_score || 0,
        api_used: 'AbstractAPI'
      };
    }
  } catch (error) {
    console.error('AbstractAPI error:', error.response?.data || error.message);
  }

  return null;
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

// Main email validation function with API priority
async function validateEmail(email) {
  console.log('Starting comprehensive validation for email:', email);
  
  // Priority 1: Try professional APIs first (most accurate)
  let result = await validateEmailWithAPI(email);
  
  if (result && result.confidence && result.confidence > 50) {
    console.log(`API validation successful with ${result.api_used}, confidence: ${result.confidence}`);
    return result;
  }
  
  if (!result) {
    console.log('All APIs failed, using enhanced DNS validation');
    result = await validateEmailWithDNS(email);
  }
  
  console.log('Final validation result:', result);
  return result;
}

// Email validation middleware with detailed error messages
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
    
    // Check validation results with specific error messages
    if (validation.is_valid_format && validation.is_valid_format.value === false) {
      return res.status(400).json({ message: 'Invalid email format.' });
    }
    
    if (validation.is_mx_found && validation.is_mx_found.value === false) {
      return res.status(400).json({ message: 'Email domain does not exist or cannot receive emails.' });
    }
    
    if (validation.is_smtp_valid && validation.is_smtp_valid.value === false) {
      return res.status(400).json({ 
        message: 'This email address does not exist or cannot receive emails.' 
      });
    }
    
    // Check deliverability status
    if (validation.deliverability === 'UNDELIVERABLE') {
      return res.status(400).json({ 
        message: 'This email address is not deliverable. Please use a valid email address.' 
      });
    }
    
    // Check confidence score if available
    if (validation.confidence && validation.confidence < 50) {
      return res.status(400).json({ 
        message: 'Email address appears to be invalid or risky. Please use a different email.' 
      });
    }
    
    console.log(`Email validation passed using ${validation.api_used || 'DNS'}`);
    // If validation passes, continue to next middleware
    next();
    
  } catch (error) {
    console.error('Email validation middleware error:', error);
    // Fail closed - reject on error
    return res.status(500).json({ message: 'Email validation failed. Please try again.' });
  }
};

module.exports = emailValidationMiddleware;