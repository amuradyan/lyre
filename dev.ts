import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const PORT = 8000;

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  console.log(`Request: ${url.pathname}`);

  // Handle root path - serve index.html
  if (url.pathname === "/") {
    try {
      const html = await Deno.readTextFile("./public/index.html");
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error reading index.html:", error);
      return new Response("Index file not found", { status: 404 });
    }
  }

  // Handle TypeScript/TSX files - transform to JavaScript
  if (url.pathname.endsWith(".tsx") || url.pathname.endsWith(".ts")) {
    try {
      const filePath = `.${url.pathname}`;
      console.log(`Reading file: ${filePath}`);
      const file = await Deno.readTextFile(filePath);

      // Simple transformation - replace imports and basic JSX
      let transformed = file;

      // Replace React imports
      transformed = transformed.replace(
        /import React.*from ['"]react['"];?/g,
        'import React from "https://esm.sh/react@18.2.0";',
      );

      transformed = transformed.replace(
        /import.*from ['"]react-dom\/client['"];?/g,
        'import { createRoot } from "https://esm.sh/react-dom@18.2.0/client";',
      );

      transformed = transformed.replace(
        /import.*from ['"]@monaco-editor\/react['"];?/g,
        'import Editor from "https://esm.sh/@monaco-editor/react@4.6.0";',
      );

      // Replace local imports
      transformed = transformed.replace(
        /import.*from ['"]\.\/(.*?)\.tsx?['"];?/g,
        'import $1 from "./$1.tsx";',
      );

      transformed = transformed.replace(
        /import.*from ['"]\.\.\/(.*?)\.tsx?['"];?/g,
        'import $1 from "../$1.tsx";',
      );

      return new Response(transformed, {
        headers: {
          "Content-Type": "application/javascript",
          "Access-Control-Allow-Origin": "*",
        },
      });
    } catch (error) {
      console.error("Error transforming file:", error);
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { "Content-Type": "text/plain" },
      });
    }
  }

  // Handle other static files
  try {
    const filePath = `.${url.pathname}`;
    const file = await Deno.readFile(filePath);

    // Determine content type
    let contentType = "text/plain";
    if (url.pathname.endsWith(".js")) contentType = "application/javascript";
    if (url.pathname.endsWith(".css")) contentType = "text/css";
    if (url.pathname.endsWith(".html")) contentType = "text/html";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch {
    return new Response("File not found", { status: 404 });
  }
}

console.log(`🚀 Development server running at http://localhost:${PORT}`);
console.log("📁 Serving files from current directory");

await serve(handler, { port: PORT });
