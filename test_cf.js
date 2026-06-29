const fs = require('fs');
fetch("https://codeforces.com/problemset/status?my=on")
  .then(res => res.text())
  .then(html => {
    fs.writeFileSync("cf.html", html);
    console.log("Saved to cf.html");
  });
