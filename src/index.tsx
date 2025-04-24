import { serve } from "bun";
import index from "./index.html";
import { fetchPagesByConfig, getDataRoots } from './api/storyblok';
import type { FetchConfig } from './api/storyblok';
import { COUNTRIES, CONTENT_VERSIONS } from './constants';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,
    "/api/pages": {
      POST: async (req) => {
        try {
          // Check if it's a POST request and parse the body
          if (req.method === 'POST') {
            const body = await req.json();
            
            const config: FetchConfig = {
              prefix: body.prefix || undefined,
              ignorePath: body.ignorePath || undefined,
              country: body.country || undefined,
              contentVersion: body.contentVersion || undefined,
              token: body.token || undefined
            };

            console.log(config);
            
            const pages = await fetchPagesByConfig(config);
            return Response.json({
              success: true,
              data: pages
            });
          } else {
            return new Response(
              JSON.stringify({ 
                success: false, 
                error: 'Method not allowed' 
              }),
              { status: 405, headers: { 'Content-Type': 'application/json' } }
            );
          }
        } catch (error: any) {
          return new Response(
            JSON.stringify({ 
              success: false, 
              error: error.message || 'Failed to fetch pages' 
            }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    },
  },

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
