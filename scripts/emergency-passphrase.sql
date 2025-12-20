-- Emergency password reset setup for production
-- Run this in Cloudflare D1 console for zack@sporecmms.com

-- Update user with recovery passphrase
-- Passphrase: "who let the dogs out?"
-- Hash (bcrypt salt factor 12): $2b$12$bAAbVms3swVOJMn1Z6rmjOiLUfiFXxUmhHv7e6eM8k6..1nrMPgUe

UPDATE "User"
SET "recoveryPassphrase" = '$2b$12$bAAbVms3swVOJMn1Z6rmjOiLUfiFXxUmhHv7e6eM8k6..1nrMPgUe'
WHERE "email" = 'zack@sporecmms.com';

-- Verify the update
SELECT email, recoveryPassphrase IS NOT NULL as hasRecoveryPassphrase
FROM "User"
WHERE email = 'zack@sporecmms.com';