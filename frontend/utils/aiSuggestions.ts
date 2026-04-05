import { supabase } from "../lib/supabase";
import { getCurrentTimeString } from "../utils/debugTime";
// import AsyncStorage from "@react-native-async-storage/async-storage";  // not add this yet becuz of some issues that make force refresh not work and it not real time.

const CACHE_DURATION_MS = 15 * 60 * 1000; // 15 minutes
const GROQ_API_KEY = "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"; // Groq key (now i use my (tat) chula account)

export interface AISuggestion {
  menuId: number;
  menuName: string;
  restaurantId: number;
  restaurantName: string;
  cafeteriaName: string;
  price: number;
  timeSlot: string;
  reason: string;
  imageUrl: string | null;
}

export const fetchAISuggestions = async (
  userId: number,
  forceRefresh: boolean = false
): Promise<AISuggestion[]> => {
  try {
    // const cacheKey = `ai_suggestions_${userId}`;
    console.log("AI: fetching fresh suggestions, forceRefresh:", forceRefresh);

    // // ── Cache: skip API if not force refresh and cache is fresh ──
    // if (!forceRefresh) {
    //   try {
    //     const cached = await AsyncStorage.getItem(cacheKey);
    //     if (cached) {
    //       const { timestamp, data } = JSON.parse(cached);
    //       const age = Date.now() - timestamp;
    //       if (age < CACHE_DURATION_MS) {
    //         console.log("AI: using cache, age:", Math.round(age / 1000), "sec");
    //         return data;
    //       }
    //     }
    //   } catch (e) {
    //     console.log("Cache read failed:", e);
    //   }
    // } else {
    //   // Clear cache on force refresh
    //   try {
    //     await AsyncStorage.removeItem(cacheKey);
    //     console.log("AI: cache cleared for refresh");
    //   } catch (e) {
    //     console.log("Cache clear failed:", e);
    //   }
    // }

    // console.log("AI: fetching fresh suggestions, forceRefresh:", forceRefresh);

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

    // ── 2. Fetch active menu items with image_url + cafeteria
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

    // ── 4. Build time slots — lunch priority first ────────
    const allSlots = generateRemainingSlots(availableMenuItems, currentTime);
    if (allSlots.length === 0) return [];

    // Separate lunch slots (11:30-13:30) from the rest
    const lunchSlots = allSlots.filter(s => {
      const startHour = parseInt(s.substring(0, 2));
      const startMin = parseInt(s.substring(3, 5));
      const totalMin = startHour * 60 + startMin;
      return totalMin >= 11 * 60 + 30 && totalMin <= 13 * 60 + 30;
    });
    const otherSlots = allSlots.filter(s => !lunchSlots.includes(s));

    // Put lunch slots first, then shuffle the rest
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

    // ── 6. Build menu text (ID only for names — no Thai) ──
    const menuText = availableMenuItems.map((item: any) =>
      `ID:${item.id} | ฿${item.price} | RestID:${item.rest_id}`
    ).join("\n");

    // ── 7. Random variation ───────────────────────────────
    const randomSeed = Math.floor(Math.random() * 99999);
    const slotSample = prioritizedSlots.slice(0, 15).join(", ");

    // ── 8. Build prompt ───────────────────────────────────
    const prompt = `You are a meal suggestion assistant for a Thai university canteen app.
Current time: ${currentTime}
Variation: ${randomSeed}

User order history (menuId + time they ordered):
${historyText}

Priority time slots (suggest from these first — lunch hours):
${lunchSlots.slice(0, 10).join(", ")}

All available time slots:
${slotSample}

Available menu IDs and prices:
${menuText}

RULES:
1. Suggest exactly 5 DIFFERENT meals — all different menuIds
2. PRIORITIZE lunch time slots (11:30-13:30) for most suggestions
3. Each suggestion can have a different timeSlot — spread naturally
4. timeSlot MUST come from the available slots list
5. Variation ${randomSeed} — suggest a DIFFERENT combination each time
6. Return menuId as a NUMBER only

Respond ONLY as valid JSON array, no markdown:
[{"menuId":<number>,"restaurantId":<number>,"price":<number>,"timeSlot":"<from available slots>","reason":"<max 8 words in English>"}]`;

    // ── 9. Call Groq ──────────────────────────────────────
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
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
    const clean = rawText.replace(/```json|```/g, "").trim();

    let suggestions: any[] = [];
    try {
      suggestions = JSON.parse(clean);
    } catch (parseErr) {
      console.error("JSON parse failed. Raw was:", clean);
      return [];
    }

    // ── 11. Validate + inject ALL real data from DB ───────
    const menuMap = new Map(availableMenuItems.map((m: any) => [Number(m.id), m]));
    const allSlotsSet = new Set(allSlots);
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
        const cafName = rest?.cafeteria?.name ?? null;

        return {
          menuId: Number(s.menuId),
          menuName: realItem?.name ?? "",           // ← always from DB
          restaurantId: Number(rest?.id ?? s.restaurantId),
          restaurantName: rest?.name ?? "",          // ← always from DB
          cafeteriaName: cafName ?? "",              // ← from DB
          price: Number(realItem?.price ?? s.price), // ← always from DB
          timeSlot: allSlotsSet.has(s.timeSlot)
            ? s.timeSlot
            : prioritizedSlots[Math.floor(Math.random() * Math.min(5, prioritizedSlots.length))],
          reason: s.reason ?? "",
          imageUrl: realItem?.image_url ?? null,     // ← from DB
        };
      });

    console.log("Validated unique:", validated.length);
    console.log("Slots assigned:", validated.map(v => `${v.menuName} → ${v.timeSlot}`));

    // // ── 12. Save to cache ─────────────────────────────────
    // try {
    //   await AsyncStorage.setItem(
    //     cacheKey,
    //     JSON.stringify({ timestamp: Date.now(), data: validated })
    //   );
    //   console.log("AI: saved to cache");
    // } catch (e) {
    //   console.log("Cache write failed:", e);
    // }

    return validated;

  } catch (err) {
    console.error("AI suggestion error:", err);
    return [];
  }
};

// ── Helpers ───────────────────────────────────────────────

const generateRemainingSlots = (menuItems: any[], currentTime: string): string[] => {
  const slots: string[] = [];

  let latestClose = "16:30";
  menuItems.forEach((item: any) => {
    const close = item.restaurant?.close_time?.substring(0, 5) ?? "16:00";
    if (close > latestClose) latestClose = close;
  });

  const [curH, curM] = currentTime.split(":").map(Number);
  const [closeH, closeM] = latestClose.split(":").map(Number);

  const startMinutes = Math.ceil((curH * 60 + curM + 1) / 10) * 10;
  const endMinutes = closeH * 60 + closeM;

  for (let m = startMinutes; m < endMinutes; m += 10) {
    const sh = String(Math.floor(m / 60)).padStart(2, "0");
    const sm = String(m % 60).padStart(2, "0");
    const eh = String(Math.floor((m + 10) / 60)).padStart(2, "0");
    const em = String((m + 10) % 60).padStart(2, "0");
    slots.push(`${sh}:${sm} - ${eh}:${em}`);
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