# Emergency Password Reset Feature

This document describes the emergency password reset feature that allows users to recover their account using a passphrase.

## Overview

The emergency password reset provides a secure way for users to reset their password when they don't have access to email recovery. Users set a recovery passphrase during signup or in their profile, which can be used to initiate a password reset.

## Security Features

- **Passphrase Protection**: Passphrases are hashed using bcrypt with salt factor 12
- **Rate Limiting**: 3 attempts per hour per IP address
- **IP Blocking**: Automated IP blocking after multiple failed attempts
- **Audit Logging**: All reset attempts are logged for security monitoring
- **One-Time Use**: Reset tokens expire after 1 hour and are invalidated after use
- **Secure Token Generation**: Uses crypto.randomUUID() for token generation

## Implementation

### Database Schema

Added to User model:
- `recoveryPassphrase`: String (optional) - Hashed recovery passphrase
- `passwordResetToken`: String (optional, unique) - One-time reset token
- `passwordResetExpiresAt`: DateTime (optional) - Token expiration

### API Endpoints

#### POST /api/auth/emergency-reset
Request body:
```json
{
  "email": "user@example.com",
  "passphrase": "user's recovery passphrase"
}
```

Response:
```json
{
  "success": true,
  "message": "Password reset token generated successfully",
  "resetToken": "uuid-token", // Only in development
  "resetUrl": "/auth/reset-password/uuid-token" // Only in development
}
```

### Pages

- `/auth/emergency-reset` - Form to request password reset using passphrase
- `/auth/reset-password/[token]` - Page to set new password with valid token

## Production Setup

### 1. Database Migration

Run the migration to add the new fields:
```sql
ALTER TABLE "User"
ADD COLUMN "recoveryPassphrase" TEXT,
ADD COLUMN "passwordResetToken" TEXT,
ADD COLUMN "passwordResetExpiresAt" TIMESTAMP(3);

CREATE UNIQUE INDEX "User_passwordResetToken_key" ON "User"("passwordResetToken");
```

### 2. Set Recovery Passphrase

For the initial admin user (zack@sporecmms.com), run in Cloudflare D1 console:

```sql
UPDATE "User"
SET "recoveryPassphrase" = '$2b$12$bAAbVms3swVOJMn1Z6rmjOiLUfiFXxUmhHv7e6eM8k6..1nrMPgUe'
WHERE "email" = 'zack@sporecmms.com';
```

This sets the passphrase to: "who let the dogs out?"

### 3. Security Headers

The implementation leverages existing security headers:
- Content Security Policy (CSP)
- HTTP Strict Transport Security (HSTS)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

## Testing

### Manual Testing

1. Navigate to `/auth/emergency-reset`
2. Enter your email and recovery passphrase
3. In development, you'll see the reset link directly
4. Click the link or navigate to `/auth/reset-password/[token]`
5. Enter your new password
6. Confirm the password and submit

### Automated Testing

Use the test script:
```bash
node scripts/test-emergency-reset.js
```

## Usage Flow

1. User forgets password
2. User goes to `/auth/emergency-reset`
3. User enters email and recovery passphrase
4. System validates credentials
5. System generates one-time reset token (valid for 1 hour)
6. User is redirected to reset page
7. User sets new password
8. Token is invalidated
9. User can log in with new password

## Security Considerations

- Passphrase should be different from password
- Use a memorable but secure passphrase
- Rate limiting prevents brute force attacks
- IP blocking stops malicious attempts
- All actions are logged for audit trails
- Tokens expire automatically after 1 hour

## Future Enhancements

- Add passphrase setup in user profile
- Include passphrase field in registration form
- Implement email recovery as primary method
- Add SMS recovery option
- Implement multi-factor authentication