
const Joi = require('joi');

const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    return emailRegex.test(email);
  };
  
  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/; 
    return regex.test(password);
  };
  
  
  const validateUsername = (username) => {
    return username && username.length >= 3 && username.length <= 30;
  };
  
  const ErrorResponse = (message) => {
    return { error: message };
  };
  const validateUserInput = (username, email, password, RepeatPassword) => {
    const errors = [];
  
    if (!validateUsername(username)) {
      errors.push('Username must be between 3 and 30 characters.');
    }
  
    if (!validateEmail(email)) {
      errors.push('Invalid email address.');
    }
  
    if (!validatePassword(password)) {
      errors.push('Password must be at least 8 characters long and contain both letters and numbers.');
    }
  
    if (password !== RepeatPassword) {
      errors.push('Passwords do not match.');
    }
  
    return errors;
  };
  
  
  const validateAdminInput = (name, email, phone_number, country, password, RepeatPassword, user_type_id) => {
    const errors = [];
 
    if (!name || name.length < 3) {
       errors.push('Admin name must be at least 3 characters long.');
    }
 
    if (!validateEmail(email)) {
       errors.push('Invalid email address.');
    }
 
    if (!validatePassword(password)) {
       errors.push('Password must be at least 8 characters long and contain both letters and numbers.');
    }
 
    if (password.trim() !== RepeatPassword.trim()) {
       errors.push('Password and Repeat Password do not match.');
    }
 
    if (user_type_id !== 1) {
       errors.push('Role must be admin to create an admin user.');
    }
 
    return errors;
 };




 const xssRegex = /<script.*?>|<\/script>|<img.*?>|onerror|onload|javascript:|data:/i;

 const validateInput = (data) => {
   const schema = Joi.object({
     status: Joi.string()
       .min(3)
       .max(255)
       .required()
       .custom((value, helpers) => {
     
         if (xssRegex.test(value)) {
           return helpers.error('string.pattern.base', { message: 'Input contains potentially malicious content like <script> or <img> tags.' });
         }
         const sqlInjectionRegex = /SELECT|INSERT|UPDATE|DELETE|DROP|--|\*/i;
         if (sqlInjectionRegex.test(value)) {
           return helpers.error('string.pattern.base', { message: 'Input contains potentially harmful SQL characters.' });
         }
         return value;
       })
       .messages({
         'string.base': 'The Input must be a string.',
         'string.pattern.base': 'Input contains potentially malicious content or SQL injection risk.',
       }),
 
     lang: Joi.string()
       .valid('en', 'ar')
       .required()
       .messages({
         'any.only': 'Language must be either "en" or "ar".',
       }),
   });
 
   return schema.validate(data);
 };
 


 

  module.exports = {
    validatePassword,
    validateEmail,
    validateUserInput,
    validateAdminInput,
    validateInput,
    ErrorResponse
  };
  