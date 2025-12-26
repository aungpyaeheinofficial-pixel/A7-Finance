import 'dotenv/config';

const requiredEnvVars = [
  'SUPABASE_URL',
  'SUPABASE_PRIVATE_KEY',
  'GOOGLE_API_KEY'
];

const optionalEnvVars = [
  'GROQ_API_KEY'
];

console.log('🔍 Checking environment variables...\n');

const missing: string[] = [];
const present: string[] = [];
const optionalMissing: string[] = [];

// Check required variables
requiredEnvVars.forEach(key => {
  if (!process.env[key]) {
    missing.push(key);
  } else {
    present.push(key);
  }
});

// Check optional variables
optionalEnvVars.forEach(key => {
  if (!process.env[key]) {
    optionalMissing.push(key);
  } else {
    present.push(key);
  }
});

// Report results
if (present.length > 0) {
  console.log('✅ Present:');
  present.forEach(key => {
    const value = process.env[key] || '';
    const displayValue = key.includes('KEY') || key.includes('SECRET') 
      ? `${value.substring(0, 10)}...` 
      : value;
    console.log(`   ${key}: ${displayValue}`);
  });
  console.log('');
}

if (optionalMissing.length > 0) {
  console.log('⚠️  Optional (missing):');
  optionalMissing.forEach(key => {
    console.log(`   ${key}`);
  });
  console.log('');
}

if (missing.length > 0) {
  console.log('❌ Missing required variables:');
  missing.forEach(key => {
    console.log(`   ${key}`);
  });
  console.log('\n💡 Create a .env.local file in the project root with these variables.');
  process.exit(1);
} else {
  console.log('✅ All required environment variables are set!\n');
  process.exit(0);
}

