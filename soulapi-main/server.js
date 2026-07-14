const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const compression = require("compression");
const { minify } = require("html-minifier-terser");
const JavaScriptObfuscator = require("javascript-obfuscator");

const app = express();
const port = process.env.PORT || 3000;

const htmlCache = new Map();
const scriptCache = new Map();
const assetJsCache = new Map();
const homeHtmlCache = new Map();

const PAGE_CONFIGS = [
  {
    route: "/admin",
    filePath: path.join(__dirname, "admin.html"),
    title: "SoulAI Admin Panel | Key Management",
    description:
      "SoulAI admin dashboard for key management, user approvals, plan control, and support operations.",
    pagePath: "/admin",
  },
  {
    route: "/user",
    filePath: path.join(__dirname, "user.html"),
    title: "SoulAI User Panel | Access Control",
    description:
      "Manage your SoulAI access, scripts, predictor modules, and support tickets from one user panel.",
    pagePath: "/user",
  },
  {
    route: "/mines",
    filePath: path.join(__dirname, "mines", "index.html"),
    title: "Soul Predictor | Mines and Crash",
    description:
      "Mines and crash prediction interface with secure access workflow and advanced interactive UI.",
    pagePath: "/mines",
  },
];

const bundleByRoute = new Map(
  PAGE_CONFIGS.map((page) => [
    page.route,
    {
      ...page,
      // Keep bundle IDs deterministic across serverless instances.
      bundleId: crypto
        .createHash("sha1")
        .update(page.route)
        .digest("hex")
        .slice(0, 24),
    },
  ]),
);

function readHtml(filePath) {
  if (htmlCache.has(filePath)) {
    return htmlCache.get(filePath);
  }
  const html = fs.readFileSync(filePath, "utf8");
  htmlCache.set(filePath, html);
  return html;
}

function normalizeBaseUrl(url) {
  return String(url || "").replace(/\/+$/, "");
}

function resolveBaseUrl(req) {
  if (process.env.SITE_URL) {
    return normalizeBaseUrl(process.env.SITE_URL);
  }
  const forwardedProto = req.headers["x-forwarded-proto"];
  const proto =
    typeof forwardedProto === "string" && forwardedProto.length > 0
      ? forwardedProto.split(",")[0].trim()
      : "http";
  const forwardedHost = req.headers["x-forwarded-host"];
  const host =
    (typeof forwardedHost === "string" && forwardedHost.length > 0
      ? forwardedHost.split(",")[0].trim()
      : "") || req.headers.host;
  if (host) {
    return `${proto}://${host}`;
  }
  return `http://localhost:${port}`;
}

function buildSeoTags({ title, description, pagePath }, siteBaseUrl) {
  const canonical = `${siteBaseUrl}${pagePath}`;
  return `
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:url" content="${canonical}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <link rel="canonical" href="${canonical}">
  `;
}

function injectHead(html, seoTags, title) {
  let output = html;
  if (/<title>[\s\S]*?<\/title>/i.test(output)) {
    output = output.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
  } else {
    output = output.replace(/<head>/i, `<head><title>${title}</title>`);
  }
  if (/<\/head>/i.test(output)) {
    output = output.replace(/<\/head>/i, `${seoTags}\n</head>`);
  }
  return output;
}

function getSafeLocalPath(requestPath) {
  const cleaned = decodeURIComponent(requestPath).replace(/^\/+/, "");
  const resolved = path.resolve(__dirname, cleaned);
  if (!resolved.startsWith(path.resolve(__dirname))) return null;
  return resolved;
}

function obfuscateJsAsset(filePath) {
  if (assetJsCache.has(filePath)) return assetJsCache.get(filePath);
  const source = fs.readFileSync(filePath, "utf8");
  const obfuscated = JavaScriptObfuscator.obfuscate(source, {
    compact: true,
    controlFlowFlattening: true,
    deadCodeInjection: true,
    stringArray: true,
    stringArrayShuffle: true,
    splitStrings: true,
    splitStringsChunkLength: 6,
    simplify: true,
    unicodeEscapeSequence: false,
  }).getObfuscatedCode();
  assetJsCache.set(filePath, obfuscated);
  return obfuscated;
}

function renderShell(res, page, siteBaseUrl) {
  const seo = buildSeoTags(page, siteBaseUrl);
  const bundleSrc = `/__bundle/${page.bundleId}.js`;
  const iconHref = page.pagePath === "/mines" ? "/mines/favicon.png" : "/favicon.png";
  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${page.title}</title><link rel="icon" href="${iconHref}" type="image/png">${seo}</head><body><noscript>This page requires JavaScript.</noscript><script src="${bundleSrc}" defer></script></body></html>`;
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "no-store");
  res.send(html);
}

function renderBootstrapJs(res, page) {
  try {
    const siteBaseUrl = resolveBaseUrl(res.req);
    const cacheKey = `${page.filePath}::${page.pagePath}::${page.title}::${siteBaseUrl}`;
    let js = scriptCache.get(cacheKey);
    if (!js) {
      const rawHtml = readHtml(page.filePath);
      let withSeo = injectHead(rawHtml, buildSeoTags(page, siteBaseUrl), page.title);
      // When we serve a page at a route different from its asset folder,
      // relative URLs (styles.css, script.js, favicon.png, etc.) break.
      // Mines assets live under `/mines/*`, but the route is `/mines`.
      if (page.pagePath === "/mines" && !/<base\s/i.test(withSeo)) {
        withSeo = withSeo.replace(/<head(\s[^>]*)?>/i, (m) => `${m}<base href="/mines/">`);
      }
      const payload = Buffer.from(withSeo, "utf8").toString("base64");
      const bootstrap = `(()=>{const p="${payload}";const html=atob(p);document.open();document.write(html);document.close();})();`;
      js = JavaScriptObfuscator.obfuscate(bootstrap, {
        compact: true,
        controlFlowFlattening: true,
        deadCodeInjection: true,
        stringArray: true,
        stringArrayShuffle: true,
        splitStrings: true,
        splitStringsChunkLength: 6,
        simplify: true,
        unicodeEscapeSequence: false,
      }).getObfuscatedCode();
      scriptCache.set(cacheKey, js);
    }
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(js);
  } catch (e) {
    res.status(500).send("console.error('bootstrap failed')");
  }
}

app.use(
  compression({
    threshold: 1024,
  }),
);
app.disable("x-powered-by");

app.use((req, res, next) => {
  if (!req.path.toLowerCase().endsWith(".html")) {
    next();
    return;
  }
  const queryPart = req.url.includes("?") ? `?${req.url.split("?")[1]}` : "";
  const redirects = {
    "/index.html": "/",
    "/1.html": "/",
    "/admin.html": "/admin",
    "/user.html": "/user",
    "/mines/index.html": "/mines",
  };
  const target = redirects[req.path];
  if (target) {
    res.redirect(301, `${target}${queryPart}`);
    return;
  }
  res.status(404).send("Not found");
});

app.get("/", async (req, res) => {
  const siteBaseUrl = resolveBaseUrl(req);
  const options = {
    title: "SoulAI | Premium AI Predictions",
    description:
      "SoulAI predictor platform with modern dashboard, premium modules, and real-time access workflows.",
    pagePath: "/",
  };
  // Home stays server-rendered for best crawler compatibility.
  const filePath = path.join(__dirname, "index.html");
  try {
    const cacheKey = `${filePath}::${options.title}::${siteBaseUrl}`;
    let html = homeHtmlCache.get(cacheKey);
    if (!html) {
      const rawHtml = readHtml(filePath);
      const withSeo = injectHead(rawHtml, buildSeoTags(options, siteBaseUrl), options.title);
      // SEO-safe minification: keeps full HTML content while reducing readability.
      html = await minify(withSeo, {
        collapseWhitespace: true,
        removeComments: true,
        removeRedundantAttributes: true,
        removeEmptyAttributes: true,
        minifyCSS: true,
        minifyJS: true,
        keepClosingSlash: true,
        decodeEntities: true,
      });
      homeHtmlCache.set(cacheKey, html);
    }
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.setHeader("Cache-Control", "public, max-age=0, must-revalidate");
    res.send(html);
  } catch {
    res.status(500).send("Unable to render page");
  }
});

for (const page of bundleByRoute.values()) {
  app.get(page.route, (req, res) => {
    renderShell(res, page, resolveBaseUrl(req));
  });
}

app.get("/__bundle/:bundleId.js", (req, res) => {
  const { bundleId } = req.params;
  const page = [...bundleByRoute.values()].find((p) => p.bundleId === bundleId);
  if (!page) {
    res.status(404).send("Not found");
    return;
  }
  renderBootstrapJs(res, page);
});

app.get("/favicon.ico", (req, res) => {
  res.redirect(302, "/favicon.png");
});

app.get("/mines/favicon.ico", (req, res) => {
  res.redirect(302, "/mines/favicon.png");
});

app.get("/robots.txt", (req, res) => {
  const siteBaseUrl = resolveBaseUrl(req);
  const text = `User-agent: *\nAllow: /\n\nSitemap: ${siteBaseUrl}/sitemap.xml\n`;
  res.type("text/plain").send(text);
});

app.get("/sitemap.xml", (req, res) => {
  const siteBaseUrl = resolveBaseUrl(req);
  const urls = ["/", "/admin", "/user", "/mines"];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (url) => `  <url>
    <loc>${siteBaseUrl}${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === "/" ? "1.0" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>`;
  res.type("application/xml").send(xml);
});

app.get("/1.html", (req, res) => {
  res.redirect(301, "/");
});

app.get("/admin.html", (req, res) => {
  res.redirect(301, "/admin");
});

app.get("/user.html", (req, res) => {
  res.redirect(301, "/user");
});

app.get("/mines/index.html", (req, res) => {
  res.redirect(301, "/mines");
});

app.get(/.*\.js$/i, (req, res, next) => {
  if (req.path.startsWith("/__bundle/")) {
    next();
    return;
  }
  try {
    const filePath = getSafeLocalPath(req.path);
    if (!filePath || !fs.existsSync(filePath) || !fs.statSync(filePath).isFile()) {
      next();
      return;
    }
    const obfuscated = obfuscateJsAsset(filePath);
    res.setHeader("Content-Type", "application/javascript; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(obfuscated);
  } catch {
    res.status(404).send("Not found");
  }
});

app.use(
  express.static(path.join(__dirname), {
    index: false,
  }),
);

app.use((req, res) => {
  res.status(404).send("Not found");
});

app.listen(port, () => {
  console.log(`Soul server running on http://localhost:${port}`);
});
