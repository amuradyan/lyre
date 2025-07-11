const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);
  console.log(`${req.method} ${url.pathname}`);

  // Serve the main HTML file for root and any non-file paths (SPA routing)
  if (url.pathname === "/" || !url.pathname.includes(".")) {
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Lyre React App</title>
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body>
  <div id="root"></div>
  <script type="module" src="/main.tsx"></script>
</body>
</html>`;

    return new Response(html, {
      headers: { "Content-Type": "text/html" },
    });
  }

  // Serve TypeScript/TSX files
  if (url.pathname.endsWith(".tsx") || url.pathname.endsWith(".ts")) {
    try {
      const filePath = `.${url.pathname}`;
      const content = await Deno.readTextFile(filePath);

      return new Response(content, {
        headers: { "Content-Type": "application/typescript" },
      });
    } catch {
      return new Response("File not found", { status: 404 });
    }
  }

  // Serve other static files
  try {
    const filePath = `.${url.pathname}`;
    const file = await Deno.readFile(filePath);

    let contentType = "text/plain";
    if (url.pathname.endsWith(".css")) contentType = "text/css";
    if (url.pathname.endsWith(".js")) contentType = "application/javascript";
    if (url.pathname.endsWith(".png")) contentType = "image/png";
    if (url.pathname.endsWith(".svg")) contentType = "image/svg+xml";

    return new Response(file, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return new Response("Not found", { status: 404 });
  }
}

console.log(`🚀 Server running at http://localhost:${PORT}`);
console.log("⚛️  React app ready!");

Deno.serve({ port: PORT }, handler);
