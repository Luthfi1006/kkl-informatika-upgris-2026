/**
 * Auth Middleware for Vercel Functions
 * Verifies admin session using Supabase Auth
 */

import { supabase } from './_supabase.js';

export async function verifyAdminAuth(request) {
  const authHeader = request.headers.get('authorization') || '';
  const token = authHeader.replace('Bearer ', '');
  
  if (!token) {
    return { error: 'No authorization token', status: 401 };
  }

  const { data: { user }, error } = await supabase.auth.getUser(token);
  
  if (error || !user) {
    return { error: 'Invalid or expired token', status: 401 };
  }

  // Check if user is admin (you can add admin check logic here)
  // For now, any authenticated user is admin
  // You can add a check: user.user_metadata.role === 'admin'
  
  return { user, error: null };
}

export function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Content-Type': 'application/json'
  };
}

export function handleOptions(request) {
  return new Response(null, {
    status: 204,
    headers: corsHeaders()
  });
}
