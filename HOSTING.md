# Hosting the live site

This package is the complete website as static files. It needs no Node.js,
database or server-side code. Any web server or static host can serve it.

## Requirements for the web server

1. Serve this folder as the website root (the folder containing `index.html`).
2. For a path such as `/events/`, serve `/events/index.html`.
3. Redirect `/events` (no trailing slash) to `/events/`.
4. For paths that don't exist, return `404.html` with status 404.
5. Use HTTPS.
6. Optional but recommended: cache `/_next/static/` for one year (`immutable`);
   those file names change on every release.

## Firebase Hosting (owner's own Firebase project)

Put this in `firebase.json` next to the unzipped folder (named `site` here):

```json
{
  "hosting": {
    "public": "site",
    "cleanUrls": true,
    "trailingSlash": true,
    "headers": [{ "source": "/_next/static/**", "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }] }]
  }
}
```

Then run `firebase deploy --only hosting --project <live-project-id>`.

## Nginx

```nginx
server {
  listen 443 ssl http2;
  server_name tickets.example.zm;
  root /var/www/event-management-system;

  location /_next/static/ { add_header Cache-Control "public, max-age=31536000, immutable"; }
  location / { try_files $uri $uri/index.html $uri/ =404; }
  error_page 404 /404.html;
}
```

## Apache

Static files work as-is with `DirectorySlash On` (the default) and
`ErrorDocument 404 /404.html`.

## Other static hosts

Netlify, Cloudflare Pages, AWS S3 + CloudFront, Azure Static Web Apps and
Google Cloud Storage all work. Upload the folder contents and set `404.html`
as the error page.
