/**
 * Profiles API - CRUD for team members
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  // Handle CORS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get all profiles
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // POST, PUT, DELETE - Protected: Require admin auth
    const auth = await verifyAdminAuth(request);
    if (auth.error) {
      return new Response(JSON.stringify({ success: false, error: auth.error }), { 
        status: auth.status, 
        headers 
      });
    }

    const body = await request.json();

    // POST - Create profile
    if (request.method === 'POST') {
      const { name, role, bio, photo, sort_order } = body;
      
      if (!name) {
        return new Response(JSON.stringify({ success: false, error: 'Name is required' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase
        .from('profiles')
        .insert([{ name, role, bio, photo, sort_order: sort_order || 0 }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // PUT - Update profile (with ID in URL)
    if (request.method === 'PUT') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { name, role, bio, photo, sort_order } = body;

      const { data, error } = await supabase
        .from('profiles')
        .update({ name, role, bio, photo, sort_order })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // DELETE - Delete profile
    if (request.method === 'DELETE') {
      const url = new URL(request.url);
      const id = url.searchParams.get('id');
      
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: 'Profile deleted' }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Profiles API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
