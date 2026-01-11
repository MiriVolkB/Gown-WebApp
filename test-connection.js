const https = require('https');

// Your Supabase URL
const url = "https://qpilhhrdijebwcpovabs.supabase.co/auth/v1/health";

console.log("1. Testing connection to Supabase...");

const req = https.get(url, (res) => {
  console.log(`2. Response Status: ${res.statusCode}`);
  console.log("3. SUCCESS! We can reach Supabase.");
});

req.on('error', (e) => {
  console.error(`3. FAILED: ${e.message}`);
  console.error("This confirms your computer/antivirus is blocking Node.js");
});