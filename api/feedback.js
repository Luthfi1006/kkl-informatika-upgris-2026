/**
 * Feedback API - CRUD for testimonials
 */

import { supabase } from './_supabase.js';
import { verifyAdminAuth, corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // GET - Public: Get approved feedback only
    if (request.method === 'GET') {
      const url = new URL(request.url);
      const approved = url.searchParams.get('approved');
      
      let query = supabase
        .from('feedback')
        .select('*')
        .order('created_at', { ascending: false });

      // Public sees only approved, admin sees all
      const authHeader = request.headers.get('authorization') || '';
      if (!authHeader) {
        query = query.eq('approved', true);
      }

      const { data, error } = await query;
      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // POST - Public: Submit feedback (with rate limiting via Supabase)
    if (request.method === 'POST') {
      const body = await request.json();
      const { name, rating, message } = body;

      if (!name || !rating || !message) {
        return new Response(JSON.stringify({ success: false, error: 'All fields required' }), { 
          status: 400, 
          headers 
        });
      }

      if (rating < 1 || rating > 5) {
        return new Response(JSON.stringify({ success: false, error: 'Rating must be 1-5' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase
        .from('feedback')
        .insert([{ name, rating, message, approved: false }])
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data, message: 'Feedback submitted for approval' }), { headers });
    }

    // PUT, DELETE - Admin only
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

    // PUT - Approve/Update feedback
    if (request.method === 'PUT') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { approved, name, rating, message } = body;

      const { data, error } = await supabase
        .from('feedback')
        .update({ approved, name, rating, message })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, data }), { headers });
    }

    // DELETE - Delete feedback
    if (request.method === 'DELETE') {
      if (!id) {
        return new Response(JSON.stringify({ success: false, error: 'ID required' }), { 
          status: 400, 
          headers 
        });
      }

      const { error } = await supabase
        .from('feedback')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true, message: 'Feedback deleted' }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Feedback API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
