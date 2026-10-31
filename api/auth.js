/**
 * Auth API - Admin login/logout
 */

import { supabase } from './_supabase.js';
import { corsHeaders, handleOptions } from './_auth.js';

export default async function handler(request) {
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }

  const headers = corsHeaders();

  try {
    // POST - Login
    if (request.method === 'POST') {
      const body = await request.json();
      const { email, password } = body;

      if (!email || !password) {
        return new Response(JSON.stringify({ success: false, error: 'Email and password required' }), { 
          status: 400, 
          headers 
        });
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return new Response(JSON.stringify({ success: false, error: error.message }), { 
          status: 401, 
          headers 
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        data: {
          user: data.user,
          session: data.session
        }
      }), { headers });
    }

    // DELETE - Logout
    if (request.method === 'DELETE') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (token) {
        await supabase.auth.signOut();
      }

      return new Response(JSON.stringify({ success: true, message: 'Logged out' }), { headers });
    }

    // GET - Check session
    if (request.method === 'GET') {
      const authHeader = request.headers.get('authorization') || '';
      const token = authHeader.replace('Bearer ', '');

      if (!token) {
        return new Response(JSON.stringify({ success: false, error: 'No token' }), { 
          status: 401, 
          headers 
        });
      }

      const { data: { user }, error } = await supabase.auth.getUser(token);

      if (error || !user) {
        return new Response(JSON.stringify({ success: false, error: 'Invalid token' }), { 
          status: 401, 
          headers 
        });
      }

      return new Response(JSON.stringify({ success: true, data: { user } }), { headers });
    }

    return new Response(JSON.stringify({ success: false, error: 'Method not allowed' }), { 
      status: 405, 
      headers 
    });

  } catch (error) {
    console.error('Auth API Error:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), { 
      status: 500, 
      headers 
    });
  }
}
