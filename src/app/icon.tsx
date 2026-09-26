import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = {
  width: 32,
  height: 32,
};
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 18,
          background: 'linear-gradient(135deg, #06b6d4, #2563eb)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#09090b',
          borderRadius: '8px',
          fontWeight: 900,
        }}
      >
        ⚡
      </div>
    ),
    {
      ...size,
    }
  );
}
