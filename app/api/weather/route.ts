import { NextRequest, NextResponse } from "next/server";

const CHECKWX_BASE_URL = "https://api.checkwx.com/metar";

type CheckWxDecoded = {
  raw_text?: string;
  temperature?: {
    celsius?: number;
  };
  dewpoint?: {
    celsius?: number;
  };
  wind?: {
    speed_kts?: number;
  };
  barometer?: {
    hpa?: number;
  };
};

function parseMetar(decoded: CheckWxDecoded) {
  return {
    temp_c: decoded.temperature?.celsius ?? null,
    dewpoint_c: decoded.dewpoint?.celsius ?? null,
    wind_speed_kts: decoded.wind?.speed_kts ?? null,
    altimeter_hpa: decoded.barometer?.hpa ?? null,
    raw_text: decoded.raw_text ?? "N/A",
  };
}

export async function GET(request: NextRequest) {
  const icao = request.nextUrl.searchParams.get("icao")?.toUpperCase();
  const apiKey = process.env.CHECKWX_API_KEY;

  if (!icao || !/^[A-Z]{4}$/.test(icao)) {
    return NextResponse.json({ error: "Please provide a valid 4-letter ICAO code." }, { status: 400 });
  }

  if (!apiKey) {
    return NextResponse.json({ error: "Server missing CHECKWX_API_KEY." }, { status: 500 });
  }

  try {
    const response = await fetch(`${CHECKWX_BASE_URL}/${icao}/decoded`, {
      headers: {
        "X-API-Key": apiKey,
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json(
        { error: `Failed to fetch METAR from CheckWX (${response.status}).` },
        { status: response.status }
      );
    }

    const payload = (await response.json()) as { data?: CheckWxDecoded[] };

    if (!payload.data?.length) {
      return NextResponse.json({ error: `No METAR payload found for ICAO ${icao}.` }, { status: 404 });
    }

    return NextResponse.json({
      icao,
      ...parseMetar(payload.data[0]),
      fetched_at: new Date().toISOString(),
    });
  } catch {
    return NextResponse.json({ error: "Unexpected server error when requesting CheckWX." }, { status: 502 });
  }
}
