const nodemailer = require('nodemailer');

/**
 * Email Service using Zoho SMTP
 * Sends OTP verification emails from info@leelaah.com
 */
class EmailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.ZOHO_SMTP_HOST || 'smtppro.zoho.com',
            port: parseInt(process.env.ZOHO_SMTP_PORT) || 465,
            secure: true, // SSL
            auth: {
                user: process.env.ZOHO_EMAIL || 'info@leelaah.com',
                pass: process.env.ZOHO_PASSWORD,
            },
        });
    }

    /**
     * Send OTP verification email
     * @param {string} to - Recipient email
     * @param {string} otp - 6-digit OTP
     * @param {string} firstName - User's first name
     */
    async sendOTPEmail(to, otp, firstName = 'Creator') {
        const mailOptions = {
            from: `"Leelaverse" <${process.env.ZOHO_EMAIL || 'info@leelaah.com'}>`,
            to,
            subject: `${otp} — Verify your Leelaverse account`,
            html: this._buildOTPTemplate(otp, firstName),
        };

        try {
            const info = await this.transporter.sendMail(mailOptions);
            console.log('📧 OTP email sent:', info.messageId);
            return { success: true, messageId: info.messageId };
        } catch (error) {
            console.error('📧 Email send error:', error);
            throw new Error('Failed to send verification email');
        }
    }

    /**
     * Build beautiful HTML email template for OTP
     */
    _buildOTPTemplate(otp, firstName) {
        const digits = otp.split('');
        const digitBoxes = digits
            .map(
                (d) =>
                    `<td style="width:44px;height:52px;text-align:center;font-size:28px;font-weight:700;color:#ffffff;background:linear-gradient(135deg,#5d5fef 0%,#9b6cf8 100%);border-radius:10px;letter-spacing:0;font-family:'Segoe UI',Roboto,sans-serif;">${d}</td>`
            )
            .join('<td style="width:8px;"></td>');

        return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#0a0a0f;font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#0a0a0f;padding:40px 20px;">
<tr><td align="center">
<table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:linear-gradient(180deg,#111118 0%,#0d0d14 100%);border-radius:20px;border:1px solid rgba(255,255,255,0.06);overflow:hidden;">

<!-- Header gradient bar -->
<tr><td style="height:4px;background:linear-gradient(90deg,#5d5fef,#9b6cf8,#e879f9,#5d5fef);"></td></tr>

<!-- Logo -->
<tr><td align="center" style="padding:36px 40px 0;">
  <div style="width:48px;height:48px;background:linear-gradient(135deg,#5d5fef,#9b6cf8);border-radius:12px;display:inline-block;line-height:48px;text-align:center;">
    <span style="color:#fff;font-size:24px;font-weight:700;">L</span>
  </div>
</td></tr>

<!-- Greeting -->
<tr><td align="center" style="padding:24px 40px 0;">
  <h1 style="margin:0;font-size:22px;font-weight:600;color:#ffffff;">Hey ${firstName}! 👋</h1>
</td></tr>

<tr><td align="center" style="padding:8px 40px 0;">
  <p style="margin:0;font-size:14px;color:rgba(255,255,255,0.55);line-height:1.5;">
    Enter this code to verify your email and unlock your creative journey on Leelaverse.
  </p>
</td></tr>

<!-- OTP Code -->
<tr><td align="center" style="padding:28px 40px 0;">
  <table role="presentation" cellpadding="0" cellspacing="0">
    <tr>${digitBoxes}</tr>
  </table>
</td></tr>

<!-- Expiry Notice -->
<tr><td align="center" style="padding:16px 40px 0;">
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.35);">
    ⏱ This code expires in <strong style="color:rgba(255,255,255,0.6);">10 minutes</strong>
  </p>
</td></tr>

<!-- Divider -->
<tr><td style="padding:28px 40px 0;">
  <div style="height:1px;background:rgba(255,255,255,0.06);"></div>
</td></tr>

<!-- Security note -->
<tr><td align="center" style="padding:20px 40px 36px;">
  <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.3);line-height:1.5;">
    🔒 If you didn't create a Leelaverse account, you can safely ignore this email.<br>
    This code should never be shared with anyone.
  </p>
</td></tr>

</table>

<!-- Footer -->
<table role="presentation" width="480" cellpadding="0" cellspacing="0">
<tr><td align="center" style="padding:24px 40px;">
  <p style="margin:0;font-size:11px;color:rgba(255,255,255,0.2);">
    © ${new Date().getFullYear()} Leelaverse · Crafted with ✨ for creators
  </p>
</td></tr>
</table>

</td></tr>
</table>
</body>
</html>`;
    }
}

module.exports = new EmailService();
