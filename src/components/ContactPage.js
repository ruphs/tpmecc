import React, { useState, useRef } from 'react';
import emailjs from '@emailjs/browser';

const ContactPage = () => {
  const form = useRef();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: '',
    requestType: 'general'
  });
  
  const [formStatus, setFormStatus] = useState({
    submitted: false,
    error: false,
    loading: false,
    errorMessage: ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Set loading state
    setFormStatus({
      submitted: false,
      error: false,
      loading: true,
      errorMessage: ''
    });

    // EmailJS configuration
    // To make this work:
    // 1. Sign up at https://www.emailjs.com/
    // 2. Create an Email Service (e.g., Gmail)
    // 3. Create an Email Template with variables: {{from_name}}, {{from_email}}, {{request_type}}, {{message}}
    // 4. Replace the placeholders below with your actual IDs
    const serviceId = 'service_zsorc3g'; // EmailJS service ID
    const templateId = 'template_z083962'; // EmailJS template ID
    const publicKey = 'K9euR-pOnUrM8pedQ'; // EmailJS public key

    // Prepare template parameters
    const templateParams = {
      to_email: 'nailshak@ucm.es',
      from_name: formData.name,
      from_email: formData.email,
      request_type: formData.requestType,
      message: formData.message
    };

    // Send email using EmailJS
    emailjs.send(serviceId, templateId, templateParams, publicKey)
      .then((response) => {
        console.log('Email sent successfully:', response);
        
        // Update form status on success
        setFormStatus({
          submitted: true,
          error: false,
          loading: false,
          errorMessage: ''
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          message: '',
          requestType: 'general'
        });
      })
      .catch((error) => {
        console.error('Email sending failed:', error);
        
        // Update form status on error
        setFormStatus({
          submitted: false,
          error: true,
          loading: false,
          errorMessage: 'Failed to send message. Please try again later.'
        });
      });
  };
  
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Contact Me</h1>
        <p className="text-gray-600">
          Feel free to reach out for job opportunities, CV requests, or to discuss potential projects.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
            <div className="space-y-3">
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                </svg>
                <span>nailshak@ucm.es</span>
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
                </svg>
                <span>+34 633112498</span>
              </p>
              <p className="flex items-center">
                <svg className="w-5 h-5 mr-3 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span>Madrid, Spain</span>
              </p>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
            <p className="text-gray-700">
              My portfolio of programming projects is available upon request. Please use the contact form to request access to my portfolio.
            </p>
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Send a Message</h2>
          
          {formStatus.submitted && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              <p>Thank you for your message! I'll get back to you soon.</p>
            </div>
          )}
          
          {formStatus.error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{formStatus.errorMessage || 'An error occurred. Please try again.'}</p>
            </div>
          )}
          
          <form ref={form} onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="name" className="block text-gray-700 font-medium mb-2">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="email" className="block text-gray-700 font-medium mb-2">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              />
            </div>
            
            <div className="mb-4">
              <label htmlFor="requestType" className="block text-gray-700 font-medium mb-2">Request Type</label>
              <select
                id="requestType"
                name="requestType"
                value={formData.requestType}
                onChange={handleChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="general">General Inquiry</option>
                <option value="cv">CV Request</option>
                <option value="job">Job Opportunity</option>
                <option value="project">Project Collaboration</option>
              </select>
            </div>
            
            <div className="mb-4">
              <label htmlFor="message" className="block text-gray-700 font-medium mb-2">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="4"
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                required
              ></textarea>
            </div>
            
            <button
              type="submit"
              disabled={formStatus.loading}
              className={`w-full py-2 px-4 rounded-lg transition-colors ${
                formStatus.loading 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-indigo-600 hover:bg-indigo-700 text-white'
              }`}
            >
              {formStatus.loading ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </span>
              ) : (
                'Send Message'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
