import { serve } from "https://deno.land/std@0.208.0/http/server.ts";

const PORT = 8000;

function transformTypeScript(code: string, filePath: string): string {
  let transformed = code;

  // Remove TypeScript type annotations
  transformed = transformed.replace(/: (React\.)?FC<[^>]*>/g, "");
  transformed = transformed.replace(/: React\.[A-Za-z<>[\]|,\s]*=/g, " =");
  transformed = transformed.replace(/interface\s+\w+\s*{[^}]*}/g, "");
  transformed = transformed.replace(/: \w+(\[\])?(\s*\|[^;,)]*)?/g, "");
  transformed = transformed.replace(/\?\s*:/g, ":");

  // Transform React imports to use ESM URLs
  transformed = transformed.replace(
    /import React.*from ['"]react['"];?/g,
    "import React from 'https://esm.sh/react@18.2.0';",
  );

  transformed = transformed.replace(
    /import.*createRoot.*from ['"]react-dom\/client['"];?/g,
    "import { createRoot } from 'https://esm.sh/react-dom@18.2.0/client';",
  );

  transformed = transformed.replace(
    /import.*Editor.*from ['"]@monaco-editor\/react['"];?/g,
    "import Editor from 'https://esm.sh/@monaco-editor/react@4.6.0';",
  );

  // Transform local imports
  transformed = transformed.replace(
    /import ([^}]*) from ['"]\.\/(.*?)\.tsx?['"];?/g,
    "import $1 from './$2.tsx';",
  );

  transformed = transformed.replace(
    /import ([^}]*) from ['"]\.\.\/([^'"]*?)\.tsx?['"];?/g,
    "import $1 from '../$2.tsx';",
  );

  // Transform export statements
  transformed = transformed.replace(/export \{ ([^}]*) \}/g, "");
  transformed = transformed.replace(/export interface[^{]*{[^}]*}/g, "");

  return transformed;
}

async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url);

  console.log(`📝 Request: ${url.pathname}`);

  // Handle root path - serve index.html
  if (url.pathname === "/") {
    try {
      const html = await Deno.readTextFile("./public/index.html");
      return new Response(html, {
        headers: {
          "Content-Type": "text/html",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error("❌ Error reading public/index.html:", error);
      return new Response("Index file not found", { status: 404 });
    }
  }

  // Handle TypeScript/TSX files
  if (url.pathname.endsWith(".tsx") || url.pathname.endsWith(".ts")) {
    try {
      const filePath = `.${url.pathname}`;
      console.log(`🔄 Transforming: ${filePath}`);
      const file = await Deno.readTextFile(filePath);

      // Simple transformation for TypeScript to JavaScript
      const transformedCode = transformTypeScript(file, filePath);

      return new Response(transformedCode, {
        headers: {
          "Content-Type": "application/javascript",
          "Cache-Control": "no-cache",
        },
      });
    } catch (error) {
      console.error(`❌ Error transforming ${url.pathname}:`, error);
      return new Response(`// Error: File not found or transformation failed`, {
        status: 404,
        headers: { "Content-Type": "application/javascript" },
      });
    }
  }

  // Handle other static files
  try {
    const filePath = `.${url.pathname}`;
    const file = await Deno.readFile(filePath);

    let contentType = "text/plain";
    if (url.pathname.endsWith(".js")) contentType = "application/javascript";
    if (url.pathname.endsWith(".css")) contentType = "text/css";
    if (url.pathname.endsWith(".html")) contentType = "text/html";
    if (url.pathname.endsWith(".json")) contentType = "application/json";

    return new Response(file, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.log(`❌ File not found: ${url.pathname}`);
    return new Response("File not found", { status: 404 });
  }
}

console.log(
  `🚀 React + TypeScript Dev Server running at http://localhost:${PORT}`,
);
console.log(`📁 Serving React app from ./public/ and ./src/`);
console.log(
  `🔄 TypeScript files will be transformed using simple string replacement`,
);
console.log(`🎯 Navigate to http://localhost:${PORT} to see the React app`);

await serve(handler, { port: PORT });
