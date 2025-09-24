import hhcCommand from "../events/hhcCommand";
import apiUtils from "../utils/apiUtils";
import { chat, getBINTax, logError } from "../utils/utils";
import { fn } from "../../BloomCore/utils/Utils";

hhcCommand.addCommand("crafts", "Lists the current best craft flips", (amount = 5) => {
    chat("&aFetching " + amount + " flips...");

    apiUtils.requestCofl("craft/profit", "GET").then(resp => {
        if (resp.status !== 200) return chat("Error code: " + resp.status);

        const flips = resp.data.sort((a, b) => {
            a.fixedPrice = Math.min(a.sellPrice, a.median);
            b.fixedPrice = Math.min(b.sellPrice, b.median);

            a.profit = a.fixedPrice - a.craftCost;
            b.profit = b.fixedPrice - b.craftCost;

            return b.profit - a.profit;
        }).splice(0, amount).sort((a, b) => {
            return b.volume - a.volume;
        })

        for (let i = 0; i < amount; i++) {
            (() => {})(i);

            const flip = flips[i];
            const sellPrice = Math.min(flip.sellPrice, flip.median);
            const profit = Math.floor(Math.max(0, sellPrice - flip.craftCost));
            const volume = flip.volume;
            const itemId = flip.itemId;

            const color = volume > 30 ? "&a" : volume > 15 ? "&e" : volume > 5 ? "&c" : "&4";

            new TextComponent(color + itemId)
                .setHoverValue("Profit Per: " + fn(profit - getBINTax(profit)) + " - Volume: " + volume)
                .setClickAction("hhc craft " + itemId)
                .chat();
        }
    }).catch(e => {
        logError(e);
    });
})

hhcCommand.addCommand("craft", "Starts the crafting macro", (itemId) => {
    if (!itemId) return chat("&cInvalid parameter. (Item ID needed)");
    itemId = itemId.toUpperCase();

    let recipe = ["", "", "", "", "", "", "", "", ""];

    apiUtils.getInfo(itemId).then(resp => {
        if (resp.status !== 200) return chat("&cError code: " + resp.status);

        const data = resp.data;
        if (!data.recipe) return chat("&cCouldn't fetch recipe for: " + itemId);
        if (!data.displayname) return chat("&cCouldn't fetch display name for: " + itemId);

        Object.keys(data.recipe).forEach((mat, idx) => recipe[idx] = data.recipe[mat]);
        if (!recipe.some(m => m.length)) return chat("&cEmpty recipe for: " + itemId);

        craft(recipe);
    });
})

function craft(recipe) {
    const materials = {
        // id: amount
    };

    for (let i = 0; i < recipe.length; i++) {
        const material = recipe[i];
        if (!material.length) continue;

        const info = material.split(":");

        const id = info[0];
        const amount = parseInt(info[1]);

        materials[id] = (materials[id] ?? 0) + amount;
    }

    Object.keys(materials).forEach(id => {
        const amount = materials[id];

        apiUtils.getInfo(id).then(r => {
            if (r.status !== 200) return;

            const data = r.data;

            const displayName = data.displayname;
            if (!displayName) return chat("&cCouldn't fetch display name for: " + id);

            ChatLib.chat(displayName.removeFormatting() + " - " + amount + "x");

            // todo: get whether the material is on the ah / bz
        })
    })
}