// Helper to check environment variables
export const checkEnvVariables = () => {
  const required = ['MONGO_URI', 'JWT_ACCESS_SECRET', 'JWT_REFRESH_SECRET'];
  const optional = [
    'CLOUDINARY_CLOUD_NAME', 'CLOUDINARY_API_KEY', 'CLOUDINARY_API_SECRET',
    'FIREBASE_PROJECT_ID', 'FIREBASE_PRIVATE_KEY', 'FIREBASE_CLIENT_EMAIL',
    'SMTP_HOST', 'SMTP_USER', 'SMTP_PASS'
  ];

  console.log('🔧 Environment Variables Check:');
  
  // Check required variables
  let allRequiredPresent = true;
  required.forEach(variable => {
    if (!process.env[variable]) {
      console.log(`   ❌ ${variable}: Missing`);
      allRequiredPresent = false;
    } else {
      console.log(`   ✅ ${variable}: Present`);
    }
  });

  // Check optional variables
  console.log('\n   Optional Variables:');
  optional.forEach(variable => {
    if (!process.env[variable]) {
      console.log(`   ⚠️  ${variable}: Not configured`);
    } else {
      // Don't show full values for security
      const value = process.env[variable];
      const displayValue = value.length > 20 ? 
        `${value.substring(0, 10)}...${value.substring(value.length - 5)}` : 
        'Present';
      console.log(`   ✅ ${variable}: ${displayValue}`);
    }
  });

  return allRequiredPresent;
};