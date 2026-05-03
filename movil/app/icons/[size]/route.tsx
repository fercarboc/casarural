import { ImageResponse } from 'next/og'
import { NextRequest } from 'next/server'

export const runtime = 'edge'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ size: string }> },
) {
  const { size: sizeStr } = await params
  const size = parseInt(sizeStr) || 192
  const fontSize = Math.round(size * 0.45)
  const radius = Math.round(size * 0.22)

  return new ImageResponse(
    (
      <div
        style={{
          width: size,
          height: size,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #059669 0%, #10b981 100%)',
          borderRadius: radius,
        }}
      >
        <span
          style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontWeight: 800,
            fontSize,
            color: '#ffffff',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          R
        </span>
      </div>
    ),
    { width: size, height: size },
  )
}
