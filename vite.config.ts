import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import fs from "node:fs";
import path from "node:path";

function withTrailingSlash(value: string) {
  return value.endsWith("/") ? value : `${value}/`;
}

function normalizeBasePath(value: string) {
  const withLeadingSlash = value.startsWith("/") ? value : `/${value}`;
  return withTrailingSlash(withLeadingSlash);
}

function replaceTemplateValues(html: string, replacements: Record<string, string>) {
  return Object.entries(replacements).reduce(
    (currentHtml, [template, value]) => currentHtml.split(template).join(value),
    html,
  );
}

function getGitHubPagesUrl() {
  const [owner, repositoryName] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];
  if (!owner || !repositoryName) return null;

  return `https://${owner}.github.io/${repositoryName}/`;
}

function getSiteAuthor() {
  const [repositoryOwner] = process.env.GITHUB_REPOSITORY?.split("/") ?? [];

  return process.env.VITE_SITE_AUTHOR || process.env.GITHUB_REPOSITORY_OWNER || repositoryOwner || process.env.GITHUB_ACTOR || "";
}

function getSiteConfig() {
  const siteUrl = withTrailingSlash(process.env.VITE_SITE_URL || getGitHubPagesUrl() || "http://localhost:5173/");
  const sitePathname = new URL(siteUrl).pathname;
  const base = process.env.VITE_BASE_PATH ? normalizeBasePath(process.env.VITE_BASE_PATH) : normalizeBasePath(sitePathname);

  return {
    base,
    author: getSiteAuthor(),
    siteUrl,
    siteImageUrl: new URL("favicon.png", siteUrl).toString(),
    sitemapUrl: new URL("sitemap.xml", siteUrl).toString(),
  };
}

const site = getSiteConfig();

export default defineConfig({
  base: site.base,
  plugins: [
    react(),
    {
      name: "trilha-da-fisica-seo",
      transformIndexHtml(html) {
        return replaceTemplateValues(html, {
          "%SITE_AUTHOR%": site.author,
          "%SITE_URL%": site.siteUrl,
          "%SITE_IMAGE_URL%": site.siteImageUrl,
        });
      },
      closeBundle() {
        if (process.env.NODE_ENV === "development") return;

        const distPath = path.resolve(__dirname, "dist");
        fs.mkdirSync(distPath, { recursive: true });
        fs.writeFileSync(
          path.join(distPath, "robots.txt"),
          `User-agent: *\nAllow: /\n\nSitemap: ${site.sitemapUrl}\n`,
        );
        fs.writeFileSync(
          path.join(distPath, "sitemap.xml"),
          `<?xml version="1.0" encoding="UTF-8"?>\n` +
            `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
            `  <url>\n` +
            `    <loc>${site.siteUrl}</loc>\n` +
            `    <changefreq>monthly</changefreq>\n` +
            `    <priority>1.0</priority>\n` +
            `  </url>\n` +
            `</urlset>\n`,
        );
      },
    },
  ],
  assetsInclude: ["**/*.glb"],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
