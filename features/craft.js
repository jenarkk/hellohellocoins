import hhcCommand from "../events/hhcCommand";
import apiUtils from "../utils/apiUtils";
import priceUtils from "../utils/priceUtils";
import colorUtils from "../utils/colorUtils";
import { chat, getLocation, logError } from "../utils/utils";
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
        })

        ChatLib.chat("");

        for (let i = 0; i < amount; i++) {
            (() => {})(i);

            const flip = flips[i];

            const volume = flip.volume;

            const itemName = ChatLib.removeFormatting(flip.itemName);
            const itemId = flip.itemId;

            const sellInfo = priceUtils.getSellPrice(itemId, true);
            const location = getLocation(sellInfo[1]);

            let profit = Math.max(0, Math.min(flip.sellPrice, flip.median) - flip.craftCost);
            profit = sellInfo[1] ? priceUtils.getBazaarPriceAfterTax(profit) : priceUtils.getBINPriceAfterTax(profit); // apply tax
            profit = fn(Math.floor(profit)); // format the number

            const coinsColor = colorUtils.getCoinsColor(profit);
            const volumeColor = colorUtils.getVolumeColor(volume);

            const hoverLines = [
                "&e&lClick to show the recipe of this item.    ",
                "",
                coinsColor + "Profit: " + profit,
                volumeColor + "Volume: " + volume,
                "",
                "&7Sell Price: " + fn(Math.floor(sellInfo[0])),
                "&7Location: " + location,
                "&7Item ID: " + itemId
            ].join("\n");

            new TextComponent(volumeColor + itemName)
                .setHoverValue(hoverLines)
                .setClickAction("run_command")
                .setClickValue("/hhc viewrecipe " + itemId)
                .chat();
        }
    }).catch(e => {
        logError(e);
    });
})

hhcCommand.addCommand("viewrecipe", "Shows info about the recipe for an item", (itemId) => {
    if (!itemId) return chat("&cInvalid parameter. (Item ID)");
    itemId = itemId.toUpperCase();

    apiUtils.getRecipe(itemId).then(recipe => {
        if (!recipe) return chat("Failed to fetch the recipe for: " + itemId);
        showRecipe(recipe);
    });
})

function showRecipe(recipe) {
    ChatLib.chat("");

    Object.entries(recipe).forEach(([itemId, amount]) => {
        apiUtils.getDisplayName(itemId).then(displayName => {
            if (!displayName) return chat("&cFailed to fetch display name for: " + itemId);

            const buyInfo = priceUtils.getBuyPrice(itemId, true);
            if (buyInfo == null) return chat("&Failed to fetch item value for: " + itemId);

            const buyPrice = buyInfo[0] * parseInt(amount);
            const location = getLocation(buyInfo[1]);

            const coinsColor = colorUtils.reverse(colorUtils.getCoinsColor(buyPrice));
            const amountColor = colorUtils.getAmountColor(amount);

            const hoverLines = [
                "&e&lClick to purchase this material.    ",
                "",
                coinsColor + "Price: " + fn(Math.floor(buyPrice)),
                amountColor + "Amount: " + amount,
                "",
                "&7Item ID: " + itemId,
                "&7Location: " + location
            ].join("\n");

            new TextComponent(coinsColor + displayName)
                .setHoverValue(hoverLines)
                .setClickAction("run_command")
                .setClickValue("/hhc purchase " + buyInfo[1] + " " + amount + " " + ChatLib.removeFormatting(displayName))
                .chat();
        })
    })
}

hhcCommand.addCommand("purchase", "Purchases a material from the AH / BZ", (location, amount, ...name) => {
    if (!location) return chat("&cInvalid parameter. (Item Location)")
    if (!amount) return chat("&cInvalid parameter. (Amount)");

    if (!name) return chat("&cInvalid parameter. (Item Name)");
    name = name.join(" ");

    chat("&aPurchasing item: " + name);

    switch (location) {
        // AH
        case "0": {
            ChatLib.command("ahs " + name, false);

            break;
        }
        // BZ
        case "1": {
            ChatLib.command("bz " + name, false);

            break;
        }
    }
})