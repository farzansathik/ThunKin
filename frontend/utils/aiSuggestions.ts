import { supabase } from "../lib/supabase";
import { getCurrentTimeString, getCurrentDateString } from "../utils/debugTime";
import { DEFAULT_CAPACITY } from "../app/timeslot";

const GROQ_API_KEY = process.env.EXPO_PUBLIC_GROQ_API_KEY || "";

export interface AISuggestion {
  menuId: number;
  menuName: string;
  restaurantId: number;
  restaurantName: string;
  shopNum: number | null;
  cafeteriaName: string;
  price: number;
  timeSlot: string;
  reason: string;
  imageUrl: string | null;
}

export const fetchAISuggestions = async (
  userId: number,
  forceRefresh: boolean = false,
  customApiKey?: string
): Promise<AISuggestion[]> => {
  try {
    const apiKey = customApiKey || GROQ_API_KEY;

    if (!apiKey) {
      console.error("AI: No API key provided");
      return [];
    }

    console.log("AI: fetching suggestions, forceRefresh:", forceRefresh);

    // ── 1. Fetch user order history ───────────────────────
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
      .order("created_at", { ascending: false })
      .limit(30);

    if (historyError) {
      console.error("Failed to fetch history:", historyError);
      return [];
    }

    // ── 2. Fetch active menu items ────────────────────────
    const { data: menuItems, error: menuError } = await supabase
      .from("menu")
      .select(`
        id,
        name,
        price,
        rest_id,
        image_url,
        restaurant:rest_id (
          id,
          name,
          shop_num,
          open_time,
          close_time,
          status,
          cafe_id,
          cafeteria:cafe_id ( name )
        )
      `)
      .eq("status", true);

    if (menuError || !menuItems) {
      console.error("Failed to fetch menu:", menuError);
      return [];
    }

    // ── 3. Filter to open restaurants only ────────────────
    const currentTime = getCurrentTimeString();

    const availableMenuItems = menuItems.filter((item: any) => {
      const rest = item.restaurant;
      if (!rest || !rest.status) return false;
      const stripTime = (t: string) => t?.substring(0, 5) ?? "";
      const openTime = stripTime(rest.open_time);
      const closeTime = stripTime(rest.close_time);
      return currentTime >= openTime && currentTime <= closeTime;
    });

    console.log("Available menu items:", availableMenuItems.length);
    console.log("Current time:", currentTime);

    if (availableMenuItems.length === 0) return [];

    // ── 3.5. Fetch today's orders for capacity check ──────
    const todayStr = getCurrentDateString();

    const { data: todayOrders, error: ordersError } = await supabase
      .from("orders")
      .select(`
        pick_up_time,
        status,
        order_items!inner ( rest_id )
      `)
      .neq("status", "picked_up")
      .gte("pick_up_time", `${todayStr}T00:00:00`)
      .lte("pick_up_time", `${todayStr}T23:59:59`);

    if (ordersError) {
      console.error("Failed to fetch today orders:", ordersError);
      // continue without capacity check
    }

    // Build map: "restId_H:MM" → count (matches timeslot screen key format)
    const slotCountMap = new Map<string, number>();

    (todayOrders || []).forEach((order: any) => {
      const items = order.order_items || [];
      items.forEach((item: any) => {
        const restId = item.rest_id;
        if (!restId || !order.pick_up_time) return;

        const t = new Date(order.pick_up_time);
        const h = t.getHours();                           // no padStart — matches screen
        const m = String(t.getMinutes()).padStart(2, "0"); // padStart minutes only
        const key = `${restId}_${h}:${m}`;               // e.g. "5_11:30"
        slotCountMap.set(key, (slotCountMap.get(key) ?? 0) + 1);
      });
    });

    console.log("Slot count map:", Object.fromEntries(slotCountMap));

    // ── 4. Build slots PER RESTAURANT (with capacity) ─────
    const restaurantSlotsMap = new Map<number, string[]>();
    const restaurantMap = new Map<number, any>();

    availableMenuItems.forEach((item: any) => {
      const restId = item.restaurant?.id;
      if (restId && !restaurantMap.has(restId)) {
        restaurantMap.set(restId, item.restaurant);
      }
    });

    restaurantMap.forEach((restaurant: any, restId: number) => {
      const slots = generateSlotsForRestaurant(
        restaurant,
        currentTime,
        restId,
        slotCountMap,
      );
      restaurantSlotsMap.set(restId, slots);
      console.log(`Restaurant ${restId} (${restaurant.name}): ${slots.length} available slots`);
    });

    // Combined pool for AI prompt
    const allSlotsCombined = Array.from(
      new Set(Array.from(restaurantSlotsMap.values()).flat())
    ).sort();

    if (allSlotsCombined.length === 0) {
      console.log("No available slots across any restaurant");
      return [];
    }

    // Lunch priority (11:30 - 13:30)
    const lunchSlots = allSlotsCombined.filter(s => {
      const startHour = parseInt(s.split(":")[0]);
      const startMin = parseInt(s.split(":")[1].split(" ")[0]);
      const totalMin = startHour * 60 + startMin;
      return totalMin >= 11 * 60 + 30 && totalMin <= 13 * 60 + 30;
    });
    const otherSlots = allSlotsCombined.filter(s => !lunchSlots.includes(s));
    const prioritizedSlots = [
      ...shuffleArray([...lunchSlots]),
      ...shuffleArray([...otherSlots]),
    ];

    // ── 5. Build history text ─────────────────────────────
    const historyText = history && history.length > 0
      ? (history as any[]).flatMap(order =>
          (order.order_items || []).map((item: any) => {
            const t = order.pick_up_time
              ? String(order.pick_up_time).substring(11, 16)
              : "unknown";
            return `- menuId:${item.menu?.id} ordered at ${t}`;
          })
        ).join("\n")
      : "No order history — prioritize lunch slots around 11:30-13:00";

    // ── 6. Build menu text (IDs only — no Thai text to AI) ─
    const menuText = availableMenuItems.map((item: any) =>
      `ID:${item.id} | ฿${item.price} | RestID:${item.rest_id}`
    ).join("\n");

    // ── 7. Random variation ───────────────────────────────
    const randomSeed = Math.floor(Math.random() * 99999);
    const slotSample = prioritizedSlots.slice(0, 20).join(", ");

    // ── 8. Build prompt ───────────────────────────────────
    const prompt = `You are a meal suggestion assistant for a Thai university canteen app.
Current time: ${currentTime}
Variation: ${randomSeed}

User order history (menuId + time they ordered):
${historyText}

Priority time slots (lunch hours — use these first):
${lunchSlots.slice(0, 10).join(", ")}

All available time slots:
${slotSample}

Available menu IDs and prices:
${menuText}

RULES:
1. Suggest exactly 5 DIFFERENT meals — all different menuIds
2. PRIORITIZE lunch time slots (11:30-13:30) for most suggestions
3. Each suggestion can have a different timeSlot — spread naturally
4. timeSlot MUST come from the available slots list above
5. Variation ${randomSeed} — suggest a DIFFERENT combination each time
6. Return menuId and restaurantId as NUMBERS only

Respond ONLY as valid JSON array, no markdown:
[{"menuId":<number>,"restaurantId":<number>,"price":<number>,"timeSlot":"<from available slots>","reason":"<max 8 words in English>"}]`;

    // ── 9. Call Groq ──────────────────────────────────────
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.1-8b-instant",
        messages: [
          {
            role: "system",
            content: `You are a meal suggestion assistant.
Always respond with valid JSON only. No markdown. No extra text.
Suggest exactly 5 meals with DIFFERENT menuIds.
Each meal should have a realistic timeSlot — prioritize lunch hours 11:30-13:30.
Current variation: ${randomSeed}`,
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 1.0,
        max_tokens: 800,
      }),
    });

    console.log("Groq HTTP status:", response.status);
    const data = await response.json();

    if (!response.ok) {
      console.error("Groq API error:", JSON.stringify(data));
      return [];
    }

    const rawText = data?.choices?.[0]?.message?.content ?? "";
    console.log("Groq raw response:", rawText);

    if (!rawText || rawText.length === 0) {
      console.error("Groq returned empty response");
      return [];
    }

    // ── 10. Parse JSON ────────────────────────────────────
    let clean = rawText.replace(/```json|```/g, "").trim();
    clean = clean.replace(/[\u200B-\u200D\uFEFF]/g, "");

    let suggestions: any[] = [];
    try {
      suggestions = JSON.parse(clean);
      if (!Array.isArray(suggestions)) {
        console.error("Groq response is not an array");
        return [];
      }
    } catch (parseErr) {
      console.error("JSON parse failed:", parseErr);
      console.error("Cleaned text:", clean.substring(0, 200));
      return [];
    }

    // Fix common JSON parsing issues (e.g., missing quotes in "reason" field) later if needed. soemtimes the AI forgets to put quotes around the reason, which breaks parsing.

    // ── 11. Validate + inject real data + per-restaurant slots
    const menuMap = new Map(availableMenuItems.map((m: any) => [Number(m.id), m]));
    const seenIds = new Set<number>();

    const validated: AISuggestion[] = suggestions
      .filter(s => {
        const id = Number(s.menuId);
        if (!menuMap.has(id)) {
          console.log("Rejected - menuId not in DB:", s.menuId);
          return false;
        }
        if (seenIds.has(id)) {
          console.log("Rejected - duplicate menuId:", s.menuId);
          return false;
        }
        seenIds.add(id);
        return true;
      })
      .map(s => {
        const realItem = menuMap.get(Number(s.menuId)) as any;
        const rest = realItem?.restaurant;
        const restId = Number(rest?.id);
        const cafName = rest?.cafeteria?.name ?? null;

        // Get THIS restaurant's valid + available slots only
        const restSlots = restaurantSlotsMap.get(restId) ?? [];
        const restSlotsSet = new Set(restSlots);

        // Lunch slots for THIS restaurant
        const restLunchSlots = restSlots.filter(slot => {
          const startHour = parseInt(slot.split(":")[0]);
          const startMin = parseInt(slot.split(":")[1].split(" ")[0]);
          const totalMin = startHour * 60 + startMin;
          return totalMin >= 11 * 60 + 30 && totalMin <= 13 * 60 + 30;
        });

        // Pick valid slot:
        // 1. Use AI's suggestion if valid for this restaurant
        // 2. Fall back to random lunch slot for this restaurant
        // 3. Fall back to any slot for this restaurant
        // 4. Return null if no slots at all (will be filtered out)
        let selectedTimeSlot: string | null = null;

        if (restSlotsSet.has(s.timeSlot)) {
          selectedTimeSlot = s.timeSlot;
        } else if (restLunchSlots.length > 0) {
          selectedTimeSlot = restLunchSlots[
            Math.floor(Math.random() * restLunchSlots.length)
          ];
          console.log(`Slot "${s.timeSlot}" invalid for rest ${restId}, using lunch: ${selectedTimeSlot}`);
        } else if (restSlots.length > 0) {
          selectedTimeSlot = restSlots[
            Math.floor(Math.random() * restSlots.length)
          ];
          console.log(`No lunch slots for rest ${restId}, using: ${selectedTimeSlot}`);
        } else {
          console.log(`No available slots for restaurant ${restId} — skipping`);
          return null;
        }

        return {
          menuId: Number(s.menuId),
          menuName: realItem?.name ?? "",
          restaurantId: restId,
          restaurantName: rest?.name ?? "",
          shopNum: rest?.shop_num ?? null,
          cafeteriaName: cafName ?? "",
          price: Number(realItem?.price ?? s.price),
          timeSlot: selectedTimeSlot,
          reason: s.reason ?? "",
          imageUrl: realItem?.image_url ?? null,
        };
      })
      .filter(Boolean) as AISuggestion[];

    console.log("Validated unique:", validated.length);
    console.log("Slots assigned:", validated.map(v => `${v.menuName} → ${v.timeSlot}`));

    return validated;

  } catch (err) {
    console.error("AI suggestion error:", err);
    return [];
  }
};

// ── Helpers ───────────────────────────────────────────────

const generateSlotsForRestaurant = (
  restaurant: any,
  currentTime: string,
  restId?: number,
  slotCountMap?: Map<string, number>,
): string[] => {
  const slots: string[] = [];

  try {
    if (!restaurant?.open_time || !restaurant?.close_time) return [];

    const [curH, curM] = currentTime.split(":").map(Number);
    const nowInMinutes = curH * 60 + curM;

    const [openH, openM] = restaurant.open_time.substring(0, 5).split(":").map(Number);
    const [closeH, closeM] = restaurant.close_time.substring(0, 5).split(":").map(Number);

    const openInMinutes = openH * 60 + openM;
    const closeInMinutes = closeH * 60 + closeM;

    // Match time slot screen exactly:
    // earliest = max(now + 20min, open + 20min), rounded up to 10-min
    const earliestFromNow = nowInMinutes + 20;
    const earliestFromOpen = openInMinutes + 20;
    const startMinutes = Math.ceil(
      Math.max(earliestFromNow, earliestFromOpen) / 10
    ) * 10;

    // latest = close - 30min (matches timeslot screen)
    const latestSlotStart = closeInMinutes - 30;

    for (let m = startMinutes; m <= latestSlotStart; m += 10) {
      const sh = Math.floor(m / 60);                    // no padStart — matches screen
      const sm = String(m % 60).padStart(2, "0");        // padStart minutes only
      const eh = Math.floor((m + 10) / 60);
      const em = String((m + 10) % 60).padStart(2, "0");

      // ── Capacity check (mirrors timeslot screen logic) ──
      if (restId !== undefined && slotCountMap) {
        const key = `${restId}_${sh}:${sm}`;             // e.g. "5_11:30"
        const booked = slotCountMap.get(key) ?? 0;
        if (booked >= DEFAULT_CAPACITY) {
          console.log(`Slot ${sh}:${sm} rest ${restId} FULL (${booked}/12) — skip`);
          continue;
        }
      }

      slots.push(`${sh}:${sm} - ${eh}:${em}`);
    }
  } catch (err) {
    console.error("Error generating slots for restaurant:", err);
  }

  return slots;
};

const shuffleArray = <T>(arr: T[]): T[] => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};



// ตอนนี้ทำงานเเบบนี้:

// 1. User order history
//    → If user ordered menuId:5 at 12:30 before, AI will suggest similar
//      menu items around that time again

// 2. Time of day priority
//    → Lunch slots (11:30 - 13:30) are sent to AI first in the slot list
//    → AI is explicitly told to prioritize these slots

// 3. Variety
//    → AI must pick 5 DIFFERENT menuIds — no duplicates
//    → Random seed (0-99999) changes each call so combinations vary

// 4. Available menu only
//    → Only menu items from open restaurants are sent
//    → Full capacity slots are already removed before prompt is built

// 5. Price (implicit)
//    → AI can see prices and tends to balance cheap/mid range items
//    → No explicit rule but temperature=1.0 adds variety