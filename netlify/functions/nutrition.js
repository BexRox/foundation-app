// Proxy for USDA FoodData Central API + Claude natural language parsing
const USDA_KEY = process.env.USDA_API_KEY || "DEMO_KEY";

const handler = async (event) => {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (event.httpMethod === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (event.httpMethod !== "POST") return { statusCode: 405, headers, body: "Method not allowed" };

  try {
    const { action, query, fdcId, servingQty } = JSON.parse(event.body);

    if (action === "search") {
      // Search USDA FoodData Central
      const url = `https://api.nal.usda.gov/fdc/v1/foods/search?` +
        `query=${encodeURIComponent(query)}&pageSize=8&` +
        `dataType=Foundation,SR+Legacy,Branded&api_key=${USDA_KEY}`;
      
      const res = await fetch(url);
      const data = await res.json();
      
      // Parse and simplify results
      const foods = (data.foods || []).map(f => {
        const n = {};
        for (const nutrient of (f.foodNutrients || [])) {
          const nm = nutrient.nutrientName;
          if (nm === "Energy") n.cal = Math.round(nutrient.value);
          if (nm === "Protein") n.pro = Math.round(nutrient.value * 10) / 10;
          if (nm === "Fiber, total dietary") n.fib = Math.round(nutrient.value * 10) / 10;
          if (nm === "Carbohydrate, by difference") n.carb = Math.round(nutrient.value * 10) / 10;
          if (nm === "Total lipid (fat)") n.fat = Math.round(nutrient.value * 10) / 10;
        }
        return {
          fdcId: f.fdcId,
          name: f.description,
          brand: f.brandOwner || f.brandName || null,
          servingSize: f.servingSize || 100,
          servingUnit: f.servingSizeUnit || "g",
          per100g: n,
          dataType: f.dataType,
        };
      });
      
      return { statusCode: 200, headers, body: JSON.stringify({ foods }) };
    }

    if (action === "parse") {
      // Use Claude to parse natural language into structured food query
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 300,
          system: `You parse food descriptions into structured data for nutrition lookup. 
Return ONLY valid JSON with this shape: {"items": [{"query": "search term for USDA database", "qty": number, "unit": "g|oz|cup|tbsp|tsp|piece|serving", "displayName": "human readable name"}]}
Examples:
"greek yogurt with berries" -> {"items":[{"query":"greek yogurt plain","qty":1,"unit":"cup","displayName":"Greek yogurt"},{"query":"mixed berries","qty":0.5,"unit":"cup","displayName":"Mixed berries"}]}
"Truvani vanilla chai protein shake with oat milk" -> {"items":[{"query":"Truvani protein powder vanilla","qty":1,"unit":"serving","displayName":"Truvani Vanilla Chai"},{"query":"oat milk","qty":1,"unit":"cup","displayName":"Oat milk"}]}
"2 scrambled eggs" -> {"items":[{"query":"eggs scrambled","qty":2,"unit":"piece","displayName":"Scrambled eggs"}]}`,
          messages: [{ role: "user", content: query }],
        }),
      });
      const data = await res.json();
      const text = data.content?.[0]?.text || "{}";
      try {
        const parsed = JSON.parse(text);
        return { statusCode: 200, headers, body: JSON.stringify(parsed) };
      } catch {
        return { statusCode: 200, headers, body: JSON.stringify({ items: [{ query, qty: 1, unit: "serving", displayName: query }] }) };
      }
    }

    return { statusCode: 400, headers, body: JSON.stringify({ error: "Unknown action" }) };
  } catch (err) {
    return { statusCode: 500, headers, body: JSON.stringify({ error: err.message }) };
  }
};

exports.handler = handler;
