/**
 * Videos API - CRUD for YouTube embeds
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get all videos
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('videos')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // POST, PUT, DELETE - Admin only
    const auth = await verifyAdminAuth(request);
    if (auth.error) {
      return new Response(JSON.stringify({ success: false, error: auth.error }), { 
        status: auth.status, 
        headers 
      });
    }

    const body = await request.json();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    // POST - Create video
    if (request.method === 'POST') {
      const { title, embed_url } = body;

      if (!title || !embed_url) {
        return new Response(JSON.stringify({ success: false, error: 'Title and embed_url required' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase
        .from('videos')
        .insert([{ title, embed_url }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // PUT - Update video
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { title, embed_url } = body;

      const { data, error } = await supabase
        .from('videos')
        .update({ title, embed_url })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // DELETE - Delete video
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { error } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: 'Video deleted' }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Videos API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
