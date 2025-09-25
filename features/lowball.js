import PriceUtils from "../../BloomCore/PriceUtils";
import { fn, getSkyblockItemID } from "../../BloomCore/utils/Utils";
import config from "../config";
import { C0DPacketCloseWindow, S2DPacketOpenWindow, S2EPacketCloseWindow, S2FPacketSetSlot } from "../utils/mappings";
import { reductPercentage } from "../utils/utils";

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
    while (items.length) items.pop();
}).setFilteredClass(S2EPacketCloseWindow)

register("packetSent", () => {
    inTrade = false;
    tradePlayerName = "";
    while (items.length) items.pop();
}).setFilteredClass(C0DPacketCloseWindow)

register("packetReceived", (packet) => {
    if (!inTrade) return;

    const slot = packet.func_149173_d();
    if (slot >= 45) return; // ignore inventory items

    const column = slot % 9;
    if (column < 5) return; // ignore own items

    const itemStack = packet.func_149174_e();
    const item = itemStack != null ? new Item(itemStack) : null;
    if (item == null) return;

    const sbId = getSkyblockItemID(item);
    if (!sbId || !sbId.length) return;

    const value = PriceUtils.getItemValue(item);
    if (!value) return;

    const suggestedOffer = reductPercentage(value, config.profitAmount);

    const formattedValue = fn(Math.floor(value));
    const formattedOffer = fn(Math.floor(suggestedOffer));
    const formattedProfit = fn(Math.floor(value) - Math.floor(suggestedOffer));

    const loreLines = item.getLore().join("\n");
    const hoverLines = [
        "\n",
        "&7Owner: " + tradePlayerName,
        "&7Item Value: " + formattedValue,
        "&7Suggested offer: " + formattedOffer,
        "&7Profit: " + formattedProfit
    ].join("\n");

    new TextComponent("Item found: " + item.getName())
        .setHoverValue(loreLines + hoverLines)
        .chat();
}).setFilteredClass(S2FPacketSetSlot)