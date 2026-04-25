export async function onRequest(context) {
  const url = new URL(context.request.url);
  
  // Serve static assets directly
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.endsWith('.js') || 
      url.pathname.endsWith('.css') || 
      url.pathname.endsWith('.png') || 
      url.pathname.endsWith('.jpg') || 
      url.pathname.endsWith('.svg') || 
      url.pathname.endsWith('.ico')) {
    return context.next();
  }
  
  // For all other routes, serve index.html (SPA)
  return env.ASSETS.fetch(new Request('/index.html', context.request));
}
