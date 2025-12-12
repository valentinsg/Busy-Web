import { filesService } from '@/lib/supabase/files';
import { ImageResponse } from 'next/og';
import React from 'react';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return new Response('Missing id', { status: 400 });
  }

  const entry = await filesService.getEntry(id, false);

  if (!entry) {
    return new Response('Not found', { status: 404 });
  }

  const primaryColor = entry.colors?.[0] || '#000000';

  const element = React.createElement(
    'div',
    {
      style: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '48px',
        background: '#020617',
        color: 'white',
        fontFamily: 'system-ui, sans-serif',
      },
    },
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          gap: 32,
        },
      },
      React.createElement(
        'div',
        {
          style: {
            flex: 3,
            borderRadius: 24,
            overflow: 'hidden',
            backgroundColor: '#020617',
            border: '1px solid rgba(148, 163, 184, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 32,
          },
        },
        React.createElement(
          'span',
          { style: { opacity: 0.9 } },
          'Busy Files',
        ),
      ),
      React.createElement(
        'div',
        {
          style: {
            flex: 2,
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
          },
        },
        React.createElement(
          'div',
          {
            style: {
              fontSize: 16,
              letterSpacing: 6,
              textTransform: 'uppercase',
              opacity: 0.7,
            },
          },
          'Busy Files',
        ),
        React.createElement(
          'div',
          {
            style: {
              fontSize: 40,
              fontWeight: 700,
              lineHeight: 1.1,
            },
          },
          entry.microcopy || 'Momentos que valen la pena guardar.',
        ),
        React.createElement(
          'div',
          {
            style: {
              marginTop: 12,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 8,
              fontSize: 16,
              opacity: 0.85,
            },
          },
          ...(entry.mood?.slice(0, 3).map((mood) =>
            React.createElement(
              'span',
              {
                key: mood,
                style: {
                  padding: '4px 10px',
                  borderRadius: 999,
                  border: '1px solid rgba(148, 163, 184, 0.6)',
                },
              },
              mood,
            ),
          ) || []),
          entry.place
            ? React.createElement(
                'span',
                {
                  style: {
                    padding: '4px 10px',
                    borderRadius: 999,
                    border: '1px solid rgba(148, 163, 184, 0.6)',
                  },
                },
                entry.place,
              )
            : null,
        ),
      ),
    ),
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
      },
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          },
        },
        React.createElement('div', {
          style: {
            width: 26,
            height: 26,
            borderRadius: 999,
            backgroundColor: primaryColor,
            boxShadow: '0 0 0 4px rgba(15, 23, 42, 1)',
          },
        }),
        React.createElement(
          'div',
          { style: { fontSize: 18, fontWeight: 500 } },
          'busy_streetwear',
        ),
      ),
      React.createElement(
        'div',
        { style: { fontSize: 16, opacity: 0.7 } },
        `busystreetwear.com/files/${id}`,
      ),
    ),
  );

  return new ImageResponse(element, {
    ...size,
  });
}
