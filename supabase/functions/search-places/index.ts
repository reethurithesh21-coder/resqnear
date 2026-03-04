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
    const apiKey = Deno.env.get("GOOGLE_MAPS_API_KEY");
    if (!apiKey) {
      throw new Error("GOOGLE_MAPS_API_KEY is not configured");
    }

    const { latitude, longitude, category, radius = 5000 } = await req.json();

    if (!latitude || !longitude || !category) {
      throw new Error("latitude, longitude, and category are required");
    }

    // Map our categories to Google Places types/keywords
    const categoryConfig: Record<string, { type?: string; keyword: string }> = {
      hospital: { type: "hospital", keyword: "hospital emergency" },
      ambulance: { keyword: "ambulance service emergency medical" },
      police: { type: "police", keyword: "police station" },
      fire: { type: "fire_station", keyword: "fire station" },
      ngo: { keyword: "ngo charity humanitarian organization" },
    };

    const config = categoryConfig[category];
    if (!config) {
      throw new Error(`Invalid category: ${category}`);
    }

    // Build Google Places Nearby Search URL
    const params = new URLSearchParams({
      location: `${latitude},${longitude}`,
      radius: String(radius),
      keyword: config.keyword,
      key: apiKey,
    });

    if (config.type) {
      params.set("type", config.type);
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?${params}`;
    const response = await fetch(url);
    const data = await response.json();

    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      console.error("Google Places API error:", data.status, data.error_message);
      throw new Error(`Google Places API error: ${data.status}`);
    }

    const results = (data.results || []).map((place: any) => {
      const loc = place.geometry?.location;
      // Calculate distance using Haversine formula
      const dist = loc
        ? haversineDistance(latitude, longitude, loc.lat, loc.lng)
        : undefined;

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
      };
    });

    // Sort by distance
    results.sort(
      (a: any, b: any) => (a.distance ?? Infinity) - (b.distance ?? Infinity)
    );

    // Now fetch phone numbers for top 10 results using Place Details
    const detailedResults = await Promise.all(
      results.slice(0, 10).map(async (place: any) => {
        try {
          const detailUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=formatted_phone_number&key=${apiKey}`;
          const detailRes = await fetch(detailUrl);
          const detailData = await detailRes.json();
          return {
            ...place,
            phone: detailData.result?.formatted_phone_number || null,
          };
        } catch {
          return { ...place, phone: null };
        }
      })
    );

    // Append remaining without phone
    const finalResults = [
      ...detailedResults,
      ...results.slice(10).map((p: any) => ({ ...p, phone: null })),
    ];

    return new Response(JSON.stringify({ services: finalResults }), {
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

function haversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // km
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
