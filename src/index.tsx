import { serve } from "bun";
import index from "./index.html";
import { fetchPagesByConfig, getDataRoots } from './api/storyblok';
import type { FetchConfig } from './api/storyblok';
import { COUNTRIES, CONTENT_VERSIONS } from './constants';

const server = serve({
  routes: {
    // Serve index.html for all unmatched routes.
    "/*": index,

    "/api/data-roots": {
      async GET(req) {
        try {
          const dataRoots = getDataRoots();
          return Response.json({
            success: true,
            data: dataRoots
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get data roots' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    },

    "/api/countries": {
      async GET(req) {
        try {
          return Response.json({
            success: true,
            data: COUNTRIES
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get countries' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    },

    "/api/content-versions": {
      async GET(req) {
        try {
          return Response.json({
            success: true,
            data: CONTENT_VERSIONS
          });
        } catch (error) {
          return new Response(
            JSON.stringify({ success: false, error: 'Failed to get content versions' }),
            { status: 500, headers: { 'Content-Type': 'application/json' } }
          );
        }
      }
    },

    "/api/pages": async (req) => {
      try {
        const url = new URL(req.url);
        const params = url.searchParams;
        
        const config: FetchConfig = {
          prefix: params.get('prefix') || undefined,
          ignorePath: params.get('ignorePath') || undefined,
          country: params.get('country') || undefined,
          contentVersion: params.get('contentVersion') || undefined
        };
        
        const pages = await fetchPagesByConfig(config);
        return Response.json({
          success: true,
          data: pages
        });
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

  development: process.env.NODE_ENV !== "production",
});

console.log(`🚀 Server running at ${server.url}`);
