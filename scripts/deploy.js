const fs = require("fs");
const path = require("path");
const { Client } = require("basic-ftp");

const envPath = path.join(__dirname, "..", ".env.deploy");
const raw = fs.readFileSync(envPath, "utf8");
const env = {};
for (const line of raw.split("\n")) {
  if (!line.trim()) continue;
  const idx = line.indexOf("=");
  if (idx > 0) env[line.slice(0, idx)] = line.slice(idx + 1);
}

const HOST = env.FTP_HOST, USER = env.FTP_USER, PASS = env.FTP_PASS;
const LOCAL = path.join(__dirname, "..", "out");

async function deploy() {
  if (!HOST || !USER || !PASS) { console.error("Missing creds"); process.exit(1); }
  if (!fs.existsSync(LOCAL)) { console.error("out/ not found"); process.exit(1); }

  const c = new Client();
  console.log("Connecting...");
  await c.access({ host: HOST, user: USER, password: PASS, port: 21, secure: true, secureOptions: { rejectUnauthorized: false } });
  console.log("Connected\nCleaning...");

  const existing = await c.list();
  for (const f of existing) {
    if (f.name === "cgi-bin") continue;
    try { if (f.isDirectory) await c.removeDir(f.name); else await c.remove(f.name); } catch {}
  }

  console.log("Uploading...");
  const items = [];
  function walk(dir) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const fp = path.join(dir, e.name), rp = path.relative(LOCAL, fp);
      if (e.isDirectory()) { items.push({ t: "d", p: rp }); walk(fp); } else { const s = fs.statSync(fp); items.push({ t: "f", p: rp, fp, sz: s.size }); }
    }
  }
  walk(LOCAL);

  const start = Date.now();
  let done = 0, total = 0;
  for (const i of items) {
    if (i.t === "d") { await c.send("MKD " + i.p, false).catch(() => {}); }
    else {
      total += i.sz; done++;
      process.stdout.write("  " + i.p + " (" + (i.sz / 1024).toFixed(1) + " KB)\r");
      await c.send("CWD /", false).catch(() => {});
      await c.uploadFrom(i.fp, "/" + i.p);
    }
  }

  const sec = ((Date.now() - start) / 1000).toFixed(1);
  console.log("\n\nDONE: " + done + " files, " + (total / 1024 / 1024).toFixed(2) + " MB, " + sec + "s");
  console.log("  https://fuckyoupayme.online");
  c.close();
}
deploy().catch(e => { console.error("\n" + e.message); process.exit(1); });