const { SignJWT } = require("jose");
const crypto = require("crypto");

async function test() {
  const secret = new TextEncoder().encode("super-secret-internal-key-for-dev");
  const jwt = await new SignJWT({ userId: "manikdevazad12@gmail.com", email: "manikdevazad12@gmail.com" })
    .setProtectedHeader({ alg: 'HS256' })
    .sign(secret);
    
  const res1 = await fetch("https://cpflow-api.onrender.com/api/users/onboard", {
    method: "POST",
    headers: { "Authorization": `Bearer ${jwt}`, "Content-Type": "application/json" },
    body: JSON.stringify({ name: "Manik Azad", handles: { codeforces: "Manik444" } })
  });
  console.log("POST /onboard:", res1.status, await res1.text());
  
  const res2 = await fetch("https://cpflow-api.onrender.com/api/users/profile", {
    headers: { "Authorization": `Bearer ${jwt}` }
  });
  console.log("GET /profile:", res2.status, await res2.text());
}
test();
