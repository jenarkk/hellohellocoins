import priceUtils from "../utils/priceUtils";
import config from "../config";
import hhcCommand from "../events/hhcCommand";
import apiUtils from "../utils/apiUtils";
import SkyblockItem from "../utils/skyblockItem";
import { fn } from "../../BloomCore/utils/Utils";
import { C0DPacketCloseWindow, S2DPacketOpenWindow, S2EPacketCloseWindow, S2FPacketSetSlot } from "../utils/mappings";
import { chat, getLocation, reductPercentage, getSkyblockItemID, PREFIX, logError } from "../utils/utils";

let inTrade = false;
let tradePlayerName = "";
const items = [];

register("packetReceived", (packet) => {
    inTrade = false;
    tradePlayerName = "";
    while (items.length) items.pop();

    const title = ChatLib.removeFormatting(packet.func_179840_c().func_150260_c());
    if (!title.startsWith("You")) return;

    const regex = /^You( {3,})(.+)$/;
    const match = title.match(regex);
    if (!match) return;

    inTrade = true;
    tradePlayerName = match[2];
}).setFilteredClass(S2DPacketOpenWindow)

register("packetReceived", () => {
    inTrade = false;
    tradePlayerName = "";
}).setFilteredClass(S2EPacketCloseWindow)

register("packetSent", () => {
    inTrade = false;
    tradePlayerName = "";
}).setFilteredClass(C0DPacketCloseWindow)

register("worldLoad", () => {
    while (items.length) items.pop();
})

register("packetReceived", (packet) => {
    if (!inTrade) return;

    const slot = packet.func_149173_d();
    if (slot >= 45) return; // ignore inventory items

    //const column = slot % 9;
    //if (column < 5) return; // ignore own items

    const itemStack = packet.func_149174_e();
    const item = itemStack != null ? new Item(itemStack) : null;
    if (item == null) return;

    const sbId = getSkyblockItemID(item);
    if (!sbId || !sbId.length) return;

    let value = priceUtils.getItemValue(item);
    if (!value) return chat("&cFailed to fetch the value for: " + sbId);

    const sellInfo = priceUtils.getSellPrice(sbId, true);
    let location = null;

    if (sellInfo != null) {
        location = getLocation(sellInfo[1]);
        value = sellInfo[1] ? priceUtils.getBazaarPriceAfterTax(value) : priceUtils.getBINPriceAfterTax(value); // apply tax
    }

    const suggestedOffer = reductPercentage(value, config.profitAmount);

    const formattedValue = fn(Math.floor(value));
    const formattedOffer = fn(Math.floor(suggestedOffer));
    const formattedProfit = fn(Math.floor(value) - Math.floor(suggestedOffer));

    const loreLines = item.getLore().join("\n");
    const hoverLines = [
        "\n",
        "&e&lClick to show auctions with similar items.    ",
        "",
        "&7Owner: " + tradePlayerName,
        sellInfo != null ? ("&7Location: " + location) : "&cFailed to fetch selling info (location, tax)",
        "",
        "&7Item Value: " + formattedValue,
        "&7Suggested offer: " + formattedOffer,
        "&7Profit: " + formattedProfit
    ].join("\n");

    items.push(item);
    const index = items.length - 1;

    new TextComponent(PREFIX + "Item found: " + item.getName())
        .setHoverValue(loreLines + hoverLines)
        .setClickAction("run_command")
        .setClickValue(`/hhc similarauctions ${index}`)
        .chat();
}).setFilteredClass(S2FPacketSetSlot)

hhcCommand.addCommand("similarauctions", "Displays similar auctions to this item.", (index = Player.getHeldItemIndex()) => {
    const item = items[index] ?? Player.getInventory().getStackInSlot(index);
    if (item == null) return chat("&cCouldn't find item.");

    const sbId = getSkyblockItemID(item);
    if (!sbId) return chat("&cCouldn't get the ID for: " + item.getName());

    chat("&7Finding similar auctions for: " + sbId);

    apiUtils.requestCofl("auctions/tag/" + sbId + "/sold").then(resp => {
        if (resp.status !== 200) return chat("&cError code: " + resp.status);

        const sbItem = new SkyblockItem(item);

        const auctions = resp.data.sort((a, b) => {
            a.sbItem = a.sbItem ?? new SkyblockItem(a, true);
            b.sbItem = b.sbItem ?? new SkyblockItem(b, true);

            a.similarity = a.sbItem.similarity(sbItem);
            b.similarity = b.sbItem.similarity(sbItem);

            return b.similarity - a.similarity;
        });

        ChatLib.chat("");
        chat("&aSimilar Auctions:");
        ChatLib.chat("&a[")

        for (let i = 0; i < 10; i++) {
            (() => {})(i);

            const auction = auctions[i];
            const item = auction.sbItem;

            const hoverLines = [
                "&e&lBIN Price: " + fn(Math.floor(auction.highestBidAmount)) + "    ",
                "",
                "&7Auctioneer UUID: " + auction.auctioneerId,
                "&7Item UUID: " + item.uuid,
                "&7End Time: " + auction.end,
                Object.entries(item.getBreakdown()).map(([k, v]) => "\n&7" + k + ": " + v.toString())
            ].join("\n");

            new TextComponent("      &e" + auction.similarity + "% Similarity")
                .setHoverValue(hoverLines)
                .chat();
        }
    
        ChatLib.chat("&a]\n");

        chat("&e&lINFO &r&c» &7This feature is still WIP");
    }).catch(e => {
        logError(e);
    })
})