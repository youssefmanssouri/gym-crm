import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Apex Gym CRM & Management System';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#09090b',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(6, 182, 212, 0.12) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(37, 99, 235, 0.12) 0%, transparent 50%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          padding: '60px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            marginBottom: '28px',
          }}
        >
          <svg
            width="64"
            height="64"
            viewBox="0 0 48 48"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 4L7 10V22.5C7 33.2 14.3 42.8 24 45.5C33.7 42.8 41 33.2 41 22.5V10L24 4Z"
              fill="#09090b"
              stroke="#06b6d4"
              strokeWidth="2.5"
              strokeLinejoin="round"
            />
            <path
              d="M24 10.5L14.5 27H19.5L24 18.5L28.5 27H33.5L24 10.5Z"
              fill="#22d3ee"
            />
            <path
              d="M10 27H38"
              stroke="#ffffff"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
            <rect x="11.5" y="21" width="3" height="12" rx="1" fill="#ffffff" />
            <rect x="15.5" y="23" width="2" height="8" rx="0.75" fill="#38bdf8" />
            <rect x="30.5" y="23" width="2" height="8" rx="0.75" fill="#38bdf8" />
            <rect x="33.5" y="21" width="3" height="12" rx="1" fill="#ffffff" />
            <path
              d="M24 32.5L28.5 38.5H19.5L24 32.5Z"
              fill="#06b6d4"
            />
          </svg>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <span
              style={{
                fontSize: '44px',
                fontWeight: 900,
                color: '#ffffff',
                letterSpacing: '-1px',
              }}
            >
              APEX
            </span>
            <span
              style={{
                fontSize: '18px',
                fontWeight: 700,
                color: '#06b6d4',
                backgroundColor: 'rgba(6, 182, 212, 0.15)',
                border: '1px solid rgba(6, 182, 212, 0.4)',
                padding: '4px 12px',
                borderRadius: '8px',
                letterSpacing: '1px',
              }}
            >
              CRM
            </span>
          </div>
        </div>

        <div
          style={{
            fontSize: '48px',
            fontWeight: 800,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '900px',
            marginBottom: '20px',
            letterSpacing: '-0.5px',
          }}
        >
          Fitness Facility & Member Management System
        </div>

        <div
          style={{
            fontSize: '20px',
            color: '#a1a1aa',
            textAlign: 'center',
            maxWidth: '820px',
            lineHeight: 1.5,
            marginBottom: '40px',
          }}
        >
          Front-Desk Check-In • Member CRM • Workouts & Nutrition • Billing & POS • Staff Audit Trail
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '10px 24px',
            borderRadius: '9999px',
            backgroundColor: 'rgba(24, 24, 27, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
          }}
        >
          <span style={{ fontSize: '15px', color: '#71717a' }}>Portfolio Application by</span>
          <span style={{ fontSize: '15px', fontWeight: 600, color: '#e4e4e7' }}>Youssef Manssouri</span>
          <span style={{ fontSize: '15px', color: '#06b6d4' }}>•</span>
          <span style={{ fontSize: '15px', color: '#a1a1aa' }}>Next.js 14 & TypeScript</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
