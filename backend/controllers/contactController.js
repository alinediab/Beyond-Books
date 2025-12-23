// controllers/contactController.js
const asyncHandler = require('../middleware/asyncHandler');
const { sendEmail } = require('../utils/email');

// Send contact form message
exports.sendContactMessage = asyncHandler(async (req, res) => {
  const { name, email, subject, message } = req.body;

  // Validate required fields
  if (!name || !email || !subject || !message) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required'
    });
  }

  // Email to send to (same as lost & found notifications)
  const recipientEmail = 'kareemnehmee@gmail.com';

  // Create email HTML
  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4A70A9;">New Contact Form Submission - BeyondBooks</h2>
      <div style="background-color: #f5f5f5; padding: 20px; border-left: 5px solid #4A70A9; margin: 20px 0;">
        <p><strong>From:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Subject:</strong> ${subject}</p>
      </div>
      <div style="background-color: #ffffff; padding: 20px; border: 1px solid #e0e0e0; margin: 20px 0;">
        <h3 style="color: #4A70A9; margin-top: 0;">Message:</h3>
        <p style="white-space: pre-wrap; line-height: 1.6;">${message}</p>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 20px;">
        This message was sent from the BeyondBooks contact form.
      </p>
    </div>
  `;

  try {
    await sendEmail(recipientEmail, `Contact Form: ${subject}`, emailHtml);
    
    res.json({
      success: true,
      message: 'Your message has been sent successfully!'
    });
  } catch (error) {
    console.error('Error sending contact email:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to send message. Please try again later.'
    });
  }
});


