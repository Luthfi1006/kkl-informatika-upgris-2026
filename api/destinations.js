/**
 * Destinations API - CRUD for itinerary
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get all destinations
    if (request.method === 'GET') {
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('day_no', { ascending: true })
        .order('sort_order', { ascending: true });

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

    // POST - Create destination
    if (request.method === 'POST') {
      const { name, visit_date, description, day_no, route, sort_order } = body;

      if (!name) {
        return new Response(JSON.stringify({ success: false, error: 'Name required' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase
        .from('destinations')
        .insert([{ 
          name, 
          visit_date: visit_date || null, 
          description, 
          day_no: day_no || 1, 
          route, 
          sort_order: sort_order || 1 
        }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // PUT - Update destination
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { name, visit_date, description, day_no, route, sort_order } = body;

      const { data, error } = await supabase
        .from('destinations')
        .update({ name, visit_date, description, day_no, route, sort_order })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // DELETE - Delete destination
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      // Set gallery items destination_id to null first
      await supabase
        .from('gallery')
        .update({ destination_id: null })
        .eq('destination_id', id);

      const { error } = await supabase
        .from('destinations')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: 'Destination deleted' }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Destinations API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
