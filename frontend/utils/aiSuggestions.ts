import { supabase } from "../lib/supabase";
import { getCurrentTimeString } from "../utils/debugTime";

export interface AISuggestion {
  menuId: number;
  menuName: string;
  restaurantId: number;
  restaurantName: string;
  price: number;
  timeSlot: string;
  reason: string;
}

export const fetchAISuggestions = async (userId: number): Promise<AISuggestion[]> => {
  try {
    // 1. Fetch user's last 30 order history
    const { data: history, error: historyError } = await supabase
    .from("orders")
    .select(`
        pick_up_time,
        created_at,
        order_items (
        quantity,
        menu ( id, name, price ),
        restaurant:rest_id ( id, name )
        )
    `)
    .eq("user_id", userId)
    .order("created_at", { ascending: false })  // ✅ ordering on the root table now
    .limit(30);

    if (historyError) {
      console.error("Failed to fetch history:", historyError);
      return [];
    }

    // 2. Fetch all active menu items with their restaurant info
    const { data: menuItems, error: menuError } = await supabase
      .from("menu")
      .select(`
        id,
        name,
        price,
        rest_id,
        restaurant:rest_id ( id, name, open_time, close_time, status )
      `)
      .eq("status", true);

    if (menuError || !menuItems) {
      console.error("Failed to fetch menu:", menuError);
      return [];
    }

    // 3. Filter to only restaurants that are currently open
    const currentTime = getCurrentTimeString();

    const availableMenuItems = menuItems.filter((item: any) => {
    const rest = item.restaurant;
    if (!rest || !rest.status) return false;

    // "06:00:00+07" → "06:00"
    const stripTime = (t: string) => t?.substring(0, 5) ?? "";
    const openTime = stripTime(rest.open_time);
    const closeTime = stripTime(rest.close_time);

    console.log(`${rest.name}: open=${openTime} close=${closeTime} now=${currentTime} pass=${currentTime >= openTime && currentTime <= closeTime}`);

    return currentTime >= openTime && currentTime <= closeTime;
});

    // ── DEBUG: move logs BEFORE early return ──────────────
    console.log("Total menu items fetched:", menuItems?.length);
    console.log("Current time:", currentTime);
    console.log("Available menu after time filter:", availableMenuItems.length);
    console.log("Sample restaurant:", JSON.stringify(menuItems?.[0]?.restaurant));
    console.log("History length:", history?.length);
    console.log("menuItems sample:", JSON.stringify(menuItems?.[0]));
    // ──────────────────────────────────────────────────────

    if (availableMenuItems.length === 0) return [];

    // 4. Build next available time slot (round up to next 10-min slot)
    const nextSlot = getNextTimeSlot();

    // 5. Format history for prompt
    const historyText = history && history.length > 0
    ? (history as any[]).flatMap(order =>
        (order.order_items || []).map((item: any) =>
            `- ${item.menu?.name} from ${item.restaurant?.name} at ${order.pick_up_time}`
        )
        ).join("\n")
    : "No order history yet — suggest popular affordable items";

    // 6. Format available menu for prompt
    const menuText = availableMenuItems.map((item: any) =>
      `ID:${item.id} | ${item.name} | ฿${item.price} | ${item.restaurant?.name} | RestID:${item.rest_id}`
    ).join("\n");

    // 7. Call Gemini Flash API
    const prompt = `
You are a meal suggestion assistant for a Thai university canteen app called ThunKin.

Current time: ${currentTime}
Next available pickup slot: ${nextSlot}

User's recent order history (most recent first):
${historyText}

Available menu items RIGHT NOW (only suggest from this list):
${menuText}

Based on the user's order patterns (frequency, time of day, preferred restaurant),
suggest exactly 5 meals from the available menu list above.
Prioritize meals they order frequently or at similar times of day.
If no history, suggest popular/affordable items.

Respond ONLY in valid JSON array, no other text:
[
  {
    "menuId": <number from ID: above>,
    "menuName": "<name>",
    "restaurantId": <RestID number>,
    "restaurantName": "<restaurant name>",
    "price": <number>,
    "timeSlot": "${nextSlot}",
    "reason": "<short reason in English, max 8 words>"
  }
]
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyChxwgmdguuFqez4TlGhPum3VYwLhNoW_o`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.3, maxOutputTokens: 1000 },
        }),
      }
    );

    const data = await response.json();
    console.log("HTTP status:", response.status);
    console.log("Full API response:", JSON.stringify(data));
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    // ── DEBUG: log raw Gemini response ──────────────────
    console.log("Gemini raw response:", rawText);
    console.log("Full API response:", JSON.stringify(data));
    // ────────────────────────────────────────────────────


    // 8. Parse JSON — strip markdown fences if present
    const clean = rawText.replace(/```json|```/g, "").trim();
    if (!clean || clean.length === 0) {
    console.error("Gemini returned empty response");
    return [];
    }

    let suggestions: AISuggestion[] = [];
    try {
    suggestions = JSON.parse(clean);
    } catch (parseErr) {
    console.error("JSON parse failed. Raw text was:", clean);
    return [];
    }

    // 9. Validate — make sure each suggestion exists in our menu list
    const validMenuIds = new Set(availableMenuItems.map((m: any) => m.id));
    const validated = suggestions.filter(s => validMenuIds.has(s.menuId));

    return validated.slice(0, 5);

  } catch (err) {
    console.error("AI suggestion error:", err);
    return [];
  }
};

// Round current time up to next 10-min slot
const getNextTimeSlot = (): string => {
  const now = new Date();
  const minutes = now.getMinutes();
  const roundedMinutes = Math.ceil((minutes + 1) / 10) * 10;

  const start = new Date(now);
  start.setMinutes(roundedMinutes, 0, 0);
  if (roundedMinutes >= 60) {
    start.setHours(start.getHours() + 1);
    start.setMinutes(0);
  }

  const end = new Date(start);
  end.setMinutes(end.getMinutes() + 10);

  const fmt = (d: Date) =>
    `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;

  return `${fmt(start)} - ${fmt(end)}`;
};
