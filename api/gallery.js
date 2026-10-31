/**
 * Gallery API - CRUD for photo documentation
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get all gallery items
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('gallery')
        .select('*, destinations(name)')
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

    // POST - Create gallery item
    if (request.method === 'POST') {
      const { title, location, destination_id, photo } = body;

      if (!title || !photo) {
        return new Response(JSON.stringify({ success: false, error: 'Title and photo required' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase
        .from('gallery')
        .insert([{ title, location, destination_id: destination_id || null, photo }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // PUT - Update gallery item
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { title, location, destination_id, photo } = body;

      const { data, error } = await supabase
        .from('gallery')
        .update({ title, location, destination_id: destination_id || null, photo })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // DELETE - Delete gallery item
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      // Get photo URL first to delete from storage
      const { data: item } = await supabase
        .from('gallery')
        .select('photo')
        .eq('id', id)
        .single();

      const { error } = await supabase
        .from('gallery')
        .delete()
        .eq('id', id);

      if (error) throw error;

      // Delete from Supabase Storage if it's a Supabase URL
      if (item?.photo?.includes('supabase')) {
        const path = item.photo.split('/').pop();
        await supabase.storage.from('gallery').remove([path]);
      }

      return new Response(JSON.stringify({ success: true, message: 'Gallery item deleted' }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Gallery API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
