import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { latitude, longitude, category, radius = 5000 } = await req.json();

    if (!latitude || !longitude || !category) {
      throw new Error("latitude, longitude, and category are required");
    }

    // Try Google Places API first
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (apiKey) {
      try {
        const googleResults = await fetchFromGoogle(apiKey, latitude, longitude, category, radius);
        if (googleResults !== null) {
          return new Response(JSON.stringify({ services: googleResults }), {
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          });
        }
      } catch (e) {
        console.warn("Google Places API failed, falling back to Overpass:", e.message);
      }
    }

    // Fallback: OpenStreetMap Overpass API (free, no key needed)
    const overpassResults = await fetchFromOverpass(latitude, longitude, category, radius);

    return new Response(JSON.stringify({ services: overpassResults }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error in search-places:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});

// ── Google Places API ──
async function fetchFromGoogle(
  apiKey: string,
  latitude: number,
  longitude: number,
  category: string,
  radius: number
): Promise<any[] | null> {
  const categoryConfig: Record<string, { type?: string; keyword: string }> = {
    hospital: { type: "hospital", keyword: "hospital emergency" },
    ambulance: { keyword: "ambulance service emergency medical" },
    police: { type: "police", keyword: "police station" },
    fire: { type: "fire_station", keyword: "fire station" },
    ngo: { keyword: "ngo charity humanitarian organization" },
  };

  const config = categoryConfig[category];
  if (!config) throw new Error(`Invalid category: ${category}`);

  const params = new URLSearchParams({
    location: `${latitude},${longitude}`,
    radius: String(radius),
    keyword: config.keyword,
    key: apiKey,
  });
  if (config.type) params.set("type", config.type);

  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
  const response = await fetch(url);
  const data = await response.json();

  if (data.status === "REQUEST_DENIED") {
    throw new Error("Google API key invalid or Places API not enabled");
  }
  if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
    throw new Error(`Google Places API error: ${data.status}`);
  }

  const results = (data.results || []).map((place: any) => {
    const loc = place.geometry?.location;
    const dist = loc ? haversineDistance(latitude, longitude, loc.lat, loc.lng) : undefined;
    return {
      place_id: place.place_id,
      name: place.name,
      address: place.vicinity || place.formatted_address || "",
      latitude: loc?.lat,
      longitude: loc?.lng,
      distance: dist,
      rating: place.rating || null,
      category,
      isOpen: place.opening_hours?.open_now ?? null,
      phone: null,
    };
  });

  results.sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  // Fetch phone numbers for top 10
  const detailed = await Promise.all(
    results.slice(0, 10).map(async (place: any) => {
      try {
        const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number&key=${apiKey}`;
        const res = await fetch(detailUrl);
        const d = await res.json();
        return { ...place, phone: d.result?.formatted_phone_number || null };
      } catch {
        return place;
      }
    })
  );

  return [...detailed, ...results.slice(10)];
}

// ── OpenStreetMap Overpass API (free fallback) ──
async function fetchFromOverpass(
  latitude: number,
  longitude: number,
  category: string,
  radius: number
): Promise<any[]> {
  const osmTags: Record<string, string> = {
    hospital: '["amenity"="hospital"]',
    ambulance: '["emergency"="ambulance_station"]',
    police: '["amenity"="police"]',
    fire: '["amenity"="fire_station"]',
    ngo: '["office"="ngo"]',
  };

  const tag = osmTags[category] || '["amenity"="hospital"]';

  const query = `
    [out:json][timeout:10];
    (
      node${tag}(around:${radius},${latitude},${longitude});
      way${tag}(around:${radius},${latitude},${longitude});
      relation${tag}(around:${radius},${latitude},${longitude});
    );
    out center body;
  `;

  const response = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!response.ok) {
    throw new Error(`Overpass API error: ${response.status}`);
  }

  const data = await response.json();

  const results = (data.elements || [])
    .map((el: any) => {
      const lat = el.lat ?? el.center?.lat;
      const lon = el.lon ?? el.center?.lon;
      if (!lat || !lon) return null;

      const tags = el.tags || {};
      const dist = haversineDistance(latitude, longitude, lat, lon);

      return {
        place_id: `osm_${el.type}_${el.id}`,
        name: tags.name || tags["name:en"] || `${category.charAt(0).toUpperCase() + category.slice(1)}`,
        address: [tags["addr:street"], tags["addr:city"]].filter(Boolean).join(", ") || tags.name || "",
        latitude: lat,
        longitude: lon,
        distance: dist,
        rating: null,
        category,
        isOpen: null,
        phone: tags.phone || tags["contact:phone"] || null,
      };
    })
    .filter(Boolean);

  results.sort((a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  return results;
}

function haversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}
