/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || "https://busy.com.ar",
  generateRobotsTxt: false, // Disabled: using app/robots.ts instead
  exclude: ["/api/*", "/admin/*"],
  generateIndexSitemap: false, // Disabled: using app/sitemap.ts instead
  alternateRefs: [
    { href: (process.env.SITE_URL || "https://busy.com.ar"), hreflang: 'es-AR' },
    { href: (process.env.SITE_URL || "https://busy.com.ar"), hreflang: 'en' },
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/admin/", "/*.woff2$", "/favicon.ico"],
      },
    ],
  },
  transform: async (config, path) => {
    // Custom priority and changefreq for different pages
    if (path === "/") {
      return {
        loc: path,
        changefreq: "daily",
        priority: 1.0,
        lastmod: new Date().toISOString(),
      }
    }

    if (path.startsWith("/products")) {
      return {
        loc: path,
        changefreq: "weekly",
        priority: 0.8,
        lastmod: new Date().toISOString(),
      }
    }

    if (path.startsWith("/blog")) {
      return {
        loc: path,
        changefreq: "monthly",
        priority: 0.7,
        lastmod: new Date().toISOString(),
      }
    }

    return {
      loc: path,
      changefreq: "monthly",
      priority: 0.6,
      lastmod: new Date().toISOString(),
    }
  },
}
