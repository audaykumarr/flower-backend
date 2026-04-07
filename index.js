const express = require("express");
const cors = require("cors");
const { createClient } = require("@supabase/supabase-js");

const app = express();

app.use(cors({ origin: "*" }));
app.use(express.json());

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

app.get("/", (req, res) => {
  res.send("Flower Calculator API (Supabase) 🚀");
});

app.post("/entries", async (req, res) => {
  try {
    const { items, total, final, commission } = req.body;

    // Insert entry
    const { data: entry, error } = await supabase
      .from("entries")
      .insert([
        {
          total,
          final,
          commission: commission || 10,
        },
      ])
      .select()
      .single();

    if (error) throw error;

    const entryId = entry.id;

    // Prepare items
    const itemsData = items.map((item, index) => {
      const kgs = item.kgs || 0;
      const price = item.price || 0;
      const amount = kgs > 0 && price > 0 ? kgs * price : 0;

      return {
        entry_id: entryId,
        day: index + 1,
        kgs,
        price,
        amount,
      };
    });

    // Insert items
    const { error: itemsError } = await supabase
      .from("items")
      .insert(itemsData);

    if (itemsError) throw itemsError;

    res.send({ message: "Saved", entryId });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get("/entries", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .order("id", { ascending: false });

    if (error) throw error;

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.get("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("entry_id", id)
      .order("day");

    if (error) throw error;

    res.send(data);
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.put("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { items, commission } = req.body;

    let total = 0;

    // Update each item
    for (const item of items) {
      const kgs = item.kgs || 0;
      const price = item.price || 0;
      const amount = kgs > 0 && price > 0 ? kgs * price : 0;

      total += amount;

      await supabase
        .from("items")
        .update({
          kgs,
          price,
          amount,
        })
        .eq("entry_id", id)
        .eq("day", item.day);
    }

    const commissionPercent = commission || 10;
    const commissionValue = total * (commissionPercent / 100);
    const final = Math.round(total - commissionValue);

    // Update entry
    const { error } = await supabase
      .from("entries")
      .update({
        total,
        final,
        commission: commissionPercent,
      })
      .eq("id", id);

    if (error) throw error;

    res.send({ message: "Updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

app.delete("/entries/:id", async (req, res) => {
  try {
    const { id } = req.params;

    const { error } = await supabase
      .from("entries")
      .delete()
      .eq("id", id);

    if (error) throw error;

    res.send({ message: "Deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).send(err);
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT} 🚀`);
});