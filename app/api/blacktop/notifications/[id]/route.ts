import { NextRequest, NextResponse } from 'next/server';
import { getServiceClient } from '@/lib/supabase/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = getServiceClient();
    
    const { error } = await supabase
      .from('blacktop_notifications')
      .update({ read: true, read_at: new Date().toISOString() })
      .eq('id', params.id);

    if (error) {
      console.error('Error marking notification as read:', error);
      return NextResponse.json({ error: 'Error updating notification' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error in PATCH notification:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
