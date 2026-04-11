import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const OVERPASS_TIMEOUT_MS = 12000;
const MAX_RETRIES = 2;
const RETRY_DELAY_MS = 2000;

// Multiple Overpass endpoints for redundancy
const OVERPASS_ENDPOINTS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
];

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, category, radius = 5000 } = await req.json();

    if (!latitude || !longitude || !category) {
      return new Response(
        JSON.stringify({ error: "latitude, longitude, and category are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const services = await fetchWithRetry(latitude, longitude, category, radius);

    return new Response(JSON.stringify({ services }), {
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
        return results;
      } catch (e) {
        lastError = e;
        console.warn(`Attempt ${attempt + 1}, endpoint ${endpoint} failed: ${e.message}`);
      }
    }
    if (attempt < MAX_RETRIES) {
      await new Promise((r) => setTimeout(r, RETRY_DELAY_MS));
    }
  }

  throw lastError || new Error("All Overpass API attempts failed");
}

async function fetchFromOverpass(
  endpoint: string,
  latitude: number,
  longitude: number,
  category: string,
  radius: number
): Promise<any[]> {
  const osmFilters = getOsmFilters(category);

  // Build a compact query with a short server-side timeout
  const filterClauses = osmFilters
    .map(
      (f) => `
      node${f}(around:${radius},${latitude},${longitude});
      way${f}(around:${radius},${latitude},${longitude});`
    )
    .join("\n");

  const query = `[out:json][timeout:8];(${filterClauses});out center body qt 30;`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), OVERPASS_TIMEOUT_MS);

  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: `data=${encodeURIComponent(query)}`,
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Overpass ${response.status}`);
    }

    const data = await response.json();

    return (data.elements || [])
      .map((el: any) => {
        const lat = el.lat ?? el.center?.lat;
        const lon = el.lon ?? el.center?.lon;
        if (!lat || !lon) return null;

        const tags = el.tags || {};
        const dist = haversineDistance(latitude, longitude, lat, lon);

        return {
          place_id: `osm_${el.type}_${el.id}`,
          name: tags.name || tags["name:en"] || formatCategoryName(category),
          address: buildAddress(tags),
          latitude: lat,
          longitude: lon,
          distance: dist,
          rating: null,
          category,
          isOpen: null,
          phone: tags.phone || tags["contact:phone"] || null,
        };
      })
      .filter(Boolean)
      .sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`Overpass timeout (${endpoint})`);
    }
    throw error;
  } finally {
    clearTimeout(timeoutId);
  }
}

function getOsmFilters(category: string): string[] {
  const map: Record<string, string[]> = {
    hospital: ['["amenity"="hospital"]', '["amenity"="clinic"]'],
    ambulance: ['["emergency"="ambulance_station"]', '["amenity"="hospital"]["emergency"="yes"]'],
    police: ['["amenity"="police"]'],
    fire: ['["amenity"="fire_station"]'],
    ngo: ['["office"="ngo"]', '["office"="association"]'],
  };
  return map[category] || ['["amenity"="hospital"]'];
}

function formatCategoryName(category: string): string {
  return category.charAt(0).toUpperCase() + category.slice(1);
}

function buildAddress(tags: Record<string, string>): string {
  const parts = [
    tags["addr:housenumber"],
    tags["addr:street"],
    tags["addr:city"],
    tags["addr:postcode"],
  ].filter(Boolean);
  return parts.length > 0 ? parts.join(", ") : tags.name || "Address not available";
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
