/**
 * Settings API - Site configuration
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get settings
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('settings')
        .select('*');

      if (error) throw error;
      // Convert to key-value object
      const settings = data.reduce((acc, item) => {
        acc[item.name] = item.value;
        return acc;
      }, {});
      return new Response(JSON.stringify({ success: true, data: settings }), { headers });
    }

    // POST, PUT - Admin only
    const auth = await verifyAdminAuth(request);
    if (auth.error) {
      return new Response(JSON.stringify({ success: false, error: auth.error }), { 
        status: auth.status, 
        headers 
      });
    }

    const body = await request.json();

    // POST/PUT - Update settings (upsert)
    if (request.method === 'POST' || request.method === 'PUT') {
      const updates = Object.entries(body).map(([name, value]) => ({ name, value }));

      const { data, error } = await supabase
        .from('settings')
        .upsert(updates, { onConflict: 'name' })
        .select();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Settings API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
