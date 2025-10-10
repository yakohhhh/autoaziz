# Gmail SMTP Authentication Fix Guide

## The Problem
You're getting this error because Gmail no longer accepts regular passwords for SMTP authentication:
```
Error: Invalid login: 535-5.7.8 Username and Password not accepted
```

## Solution: Use Gmail App Password

### Step 1: Enable 2-Factor Authentication (2FA)
1. Go to your Google Account: https://myaccount.google.com/
2. Click on "Security" in the left sidebar
3. Under "How you sign in to Google", click "2-Step Verification"
4. Follow the setup process to enable 2FA

### Step 2: Generate App Password
1. Once 2FA is enabled, go back to Security settings
2. Click on "2-Step Verification"
3. Scroll down and click "App passwords"
4. Select "Mail" from the dropdown
5. Click "Generate"
6. Copy the 16-character password (it will look like: `abcd efgh ijkl mnop`)

### Step 3: Update Your .env File
Replace your current SMTP_PASSWORD in `/home/depop/delivery/part-time/autoaziz/backend/.env`:

```env
# OLD (won't work):
SMTP_PASSWORD=Shinnoword1@

# NEW (use the 16-character app password):
SMTP_PASSWORD=abcd efgh ijkl mnop
```

### Step 4: Restart Your Application
After updating the .env file, restart your Nest.js application for the changes to take effect.

## Alternative Solutions

### Option 1: Use a Different Email Service
If you don't want to use Gmail App Passwords, consider:
- **SendGrid** (free tier: 100 emails/day)
- **Mailgun** (free tier: 5,000 emails/month)
- **AWS SES** (very cheap and reliable)

### Option 2: Use OAuth2 (Advanced)
For production applications, OAuth2 is more secure but requires more setup:
1. Create a Google Cloud Console project
2. Enable Gmail API
3. Create OAuth2 credentials
4. Implement OAuth2 flow in your application

## Testing Your Fix
After implementing the app password, you should see this log message:
```
[EmailService] SMTP connection verified successfully
```

Instead of the authentication errors you're currently seeing.

## Security Notes
- App passwords are less secure than OAuth2 but easier to implement
- Store your app password securely and don't commit it to version control
- Consider using environment-specific .env files for different deployment stages