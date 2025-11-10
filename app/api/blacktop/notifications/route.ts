import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20');
    const unreadOnly = searchParams.get('unread') === 'true';

    const supabase = getServiceClient();
    
    let query = supabase
      .from('blacktop_notifications')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (unreadOnly) {
      query = query.eq('read', false);
    }

    const { data: notifications, error } = await query;

    if (error) {
      console.error('Error fetching blacktop notifications:', error);
      return NextResponse.json({ error: 'Error fetching notifications' }, { status: 500 });
    }

    // Contar no leídas
    const { count: unreadCount } = await supabase
      .from('blacktop_notifications')
      .select('*', { count: 'exact', head: true })
      .eq('read', false);

    return NextResponse.json({
      notifications: notifications || [],
      unreadCount: unreadCount || 0,
    });
  } catch (error) {
    console.error('Error in notifications API:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// Marcar todas como leídas
export async function PATCH(request: NextRequest) {
  try {
    const supabase = getServiceClient();
    
    const { error } = await supabase
      .from('blacktop_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('read', false);

    if (error) {
      console.error('Error marking notifications as read:', error);
      return NextResponse.json({ error: 'Error updating notifications' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH notifications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
