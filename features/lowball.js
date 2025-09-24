import PriceUtils from "../../BloomCore/PriceUtils";
import { getSkyblockItemID } from "../../BloomCore/utils/Utils";
import { C0DPacketCloseWindow, S2DPacketOpenWindow, S2EPacketCloseWindow, S2FPacketSetSlot } from "../utils/mappings";

let inTrade = false;
const items = [];

register("packetReceived", (packet) => {
    const title = ChatLib.removeFormatting(packet.func_179840_c().func_150260_c());
    if (!title.startsWith("You")) return;

    inTrade = true;
    while (items.length) items.pop();
}).setFilteredClass(S2DPacketOpenWindow)

register("packetReceived", () => {
    inTrade = false;
    while (items.length) items.pop();
}).setFilteredClass(S2EPacketCloseWindow)

register("packetSent", () => {
    inTrade = false;
    while (items.length) items.pop();
}).setFilteredClass(C0DPacketCloseWindow)

register("packetReceived", (packet) => {
    if (!inTrade) return;

    const slot = packet.func_149173_d();
    if (slot >= 45) return; // ignore inventory items

    const itemStack = packet.func_149174_e();
    const item = itemStack != null ? new Item(itemStack) : null;
    if (item == null) return;

    const sbId = getSkyblockItemID(item);
    if (!sbId || !sbId.length) return;

    const price = PriceUtils.getItemValue(item);
    if (!price) return;

    items[slot] = { item, price };
}).setFilteredClass(S2FPacketSetSlot)