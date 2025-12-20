// Test script for emergency password reset
// Run this in development to test the flow

async function testEmergencyReset() {
  try {
    // 1. Request password reset with email and passphrase
    const resetResponse = await fetch('http://localhost:5173/api/auth/emergency-reset', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'zack@sporecmms.com',
        passphrase: 'who let the dogs out?'
      })
    });

    const resetData = await resetResponse.json();
    console.log('Reset request response:', resetData);

    if (resetData.success && resetData.resetToken) {
      // 2. Use the reset token to set a new password
      const form = new FormData();
      form.append('token', resetData.resetToken);
      form.append('password', 'NewPassword123!');
      form.append('confirmPassword', 'NewPassword123!');

      const confirmResponse = await fetch(`http://localhost:5173/auth/reset-password/${resetData.resetToken}`, {
        method: 'POST',
        body: form
      });

      // Note: This will be a redirect, so check the response
      console.log('Password reset response status:', confirmResponse.status);
    }
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Instructions:
// 1. Start the dev server: npm run dev
// 2. Run: node scripts/test-emergency-reset.js
// 3. Check console output
console.log('Emergency Reset Test Script');
console.log('==========================');
console.log('1. Make sure the dev server is running');
console.log('2. Update the email in this script to match your test user');
console.log('3. Run: node scripts/test-emergency-reset.js');
console.log('');
console.log('For manual testing:');
console.log('1. Go to http://localhost:5173/auth/emergency-reset');
console.log('2. Enter your email and passphrase');
console.log('3. Follow the reset link provided');
console.log('4. Set your new password');