Deno.serve(async (req) => {
  const content = await Deno.readFile('./index.html');
  return new Response(content, {
    headers: { 'Content-Type': 'text/html' },
  });
});
