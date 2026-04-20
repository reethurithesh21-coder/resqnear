import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OVERPASS_TIMEOUT_MS = 15000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 1500;

// Overpass mirror endpoints — tried in order. More mirrors = more resilience.
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.openstreetmap.ru/api/interpreter",
  "https://maps.mail.ru/osm/tools/overpass/api/interpreter",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, category, radius = 15000 } = await req.json();

    if (latitude == null || longitude == null || !category) {
      return new Response(
        JSON.stringify({ error: "latitude, longitude, and category are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Try requested radius first, then expand if nothing found
    let services = await fetchWithRetry(latitude, longitude, category, radius);
    if (services.length === 0 && radius < 30000) {
      console.log(`No results at ${radius}m, expanding to 30000m`);
      services = await fetchWithRetry(latitude, longitude, category, 30000);
    }
    if (services.length === 0) {
      console.log(`No results at 30000m, expanding to 50000m`);
      services = await fetchWithRetry(latitude, longitude, category, 50000);
    }

    return new Response(JSON.stringify({ services, count: services.length }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("search-places error:", error.message);
    return new Response(
      JSON.stringify({ services: [], fallback: true, error: error.message }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

async function fetchWithRetry(
  latitude: number,
  longitude: number,
  category: string,
  radius: number
): Promise<any[]> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    for (const endpoint of OVERPASS_ENDPOINTS) {
      try {
        const results = await fetchFromOverpass(endpoint, latitude, longitude, category, radius);
        if (results.length > 0 || attempt === MAX_RETRIES) {
          return results;
        }
        // Empty result — try next endpoint in case it's a server-side hiccup
      } catch (e) {
        lastError = e as Error;
        console.warn(`Attempt ${attempt + 1}, endpoint ${endpoint} failed: ${(e as Error).message}`);
      }
    }
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  if (lastError) throw lastError;
  return [];
}

async function fetchFromOverpass(
  endpoint: string,
  latitude: number,
  longitude: number,
  category: string,
  radius: number
): Promise<any[]> {
  const osmFilters = getOsmFilters(category);

  // Build a valid Overpass QL query.
  // Each filter becomes a node+way+relation around the point.
  const filterClauses = osmFilters
    .map(
      (f) =>
        `node${f}(around:${radius},${latitude},${longitude});` +
        `way${f}(around:${radius},${latitude},${longitude});` +
        `relation${f}(around:${radius},${latitude},${longitude});`
    )
    .join("");

  // Correct syntax: `out center tags 80;` — center for ways/relations, tags for metadata, limit 80
  const query = `[out:json][timeout:25];(${filterClauses});out center tags 80;`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        // Overpass servers require a descriptive User-Agent or they return 429/406
        "User-Agent": "ResQNear-EmergencyApp/1.0 (https://resqnear.app; contact@resqnear.app)",
        Accept: "application/json",
      },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      const text = await response.text().catch(() => "");
      throw new Error(`Overpass ${response.status}${text ? `: ${text.slice(0, 100)}` : ""}`);
    }

    const data = await response.json();

    return (data.elements || [])
      .map((el: any) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) return null;

        const tags = el.tags || {};
        const realName =
          tags.name ||
          tags["name:en"] ||
          tags["official_name"] ||
          tags["alt_name"] ||
          tags["operator"];
        // Skip entries without a real name to avoid generic placeholders
        if (!realName) return null;

        const dist = haversineDistance(latitude, longitude, lat, lon);

        return {
          place_id: `osm_${el.type}_${el.id}`,
          name: realName,
          address: buildAddress(tags),
          latitude: lat,
          longitude: lon,
          distance: dist,
          rating: null,
          category,
          isOpen: tags.opening_hours === "24/7" ? true : null,
          phone: tags.phone || tags["contact:phone"] || tags["contact:mobile"] || null,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } catch (error) {
    if ((error as Error).name === "AbortError") {
      throw new Error(`Overpass timeout (${endpoint})`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getOsmFilters(category: string): string[] {
  const map: Record<string, string[]> = {
    hospital: [
      '["amenity"="hospital"]',
      '["amenity"="clinic"]',
      '["amenity"="doctors"]',
      '["healthcare"="hospital"]',
      '["healthcare"="clinic"]',
      '["healthcare"="doctor"]',
    ],
    ambulance: [
      '["emergency"="ambulance_station"]',
      '["amenity"="hospital"]',
      '["healthcare"="hospital"]',
    ],
    ngo: [
      '["office"="ngo"]',
      '["office"="association"]',
      '["office"="charity"]',
      '["amenity"="social_facility"]',
    ],
  };
  return map[category] || ['["amenity"="hospital"]'];
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"] || tags["addr:suburb"] || tags["addr:village"],
    tags["addr:postcode"],
  ].filter(Boolean);
  if (parts.length > 0) return parts.join(", ");
  if (tags["addr:full"]) return tags["addr:full"];
  return "Address not available";
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
