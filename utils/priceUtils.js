import PriceUtils from "../../BloomCore/PriceUtils";
import { getSbApiItemData } from "../../BloomCore/utils/Utils";
import { MCItemStack } from "./mappings";
import { getSimilarity, getSkyblockItemID, reductPercentage } from "./utils";

function getBuyPrice(sbId, includeLocation = false) {
    return PriceUtils.getPrice(sbId, includeLocation);
}

function getSellPrice(sbId, includeLocation = false) {
    return PriceUtils.getSellPrice(sbId, includeLocation);
}

function getItemValue(item, returnBreakdown = false) {
    return PriceUtils.getItemValue(item, returnBreakdown)
}

function getItemSimilarity(item1, item2) {
    const breakdown1 = getItemBreakdown(item1);
    const breakdown2 = getItemBreakdown(item2);

    const fields = [
        "itemId",
        "recomb",
        "hotPotatoBooks",
        "gemstoneUnlocks",
        "gemstones",
        "scrolls",
        "artOfWar",
        "dungeonConversion",
        "starCount",
        "enchantments",
        "dye",
        "etherwarp",
        "transmissionTuners",
        "enrichment",
        "artOfPeace"
    ];

    return Math.floor(getSimilarity(fields, breakdown1, breakdown2) * 100);
}

function getItemBreakdown(item) {
    if (item instanceof MCItemStack) item = new Item(item);

    const sbId = getSkyblockItemID(item);
    if (!sbId) return null;
    
    const breakdown = {
        itemId: sbId,
        recomb: false,
        reforge: "",
        hotPotatoBooks: 0,
        gemstoneUnlocks: 0,
        gemstones: [],
        scrolls: [],
        artOfWar: false,
        dungeonConversion: false,
        starCount: 0,
        enchantments: [],
        dye: "",
        etherwarp: false,
        transmissionTuners: 0,
        enrichment: "",
        artOfPeace: false
    }

    const nbt = item.getNBT()?.toObject();

    const extra = nbt?.tag?.ExtraAttributes;
    if (!extra) return breakdown;

    const itemJsonData = getSbApiItemData(sbId) ?? {}

    if (extra.rarity_upgrades == 1) breakdown.recomb = true; // Recomb
    if (extra.hot_potato_count) breakdown.hotPotatoBooks = extra.hot_potato_count // Hot Potato Books
    if (extra.modifier) breakdown.reforge = extra.modifier.toUpperCase();
    if (extra.ability_scroll) breakdown.scrolls = extra.ability_scroll;
    if (extra.art_of_war_count) breakdown.artOfWar = true;
    if (extra.dungeon_item_conversion_cost) breakdown.dungeonConversion = extra.dungeon_item_conversion_cost ?? 0
    if (extra.upgrade_level) breakdown.starCount = extra.upgrade_level;
    if (extra.enchantments) breakdown.enchantments = Object.entries(extra.enchantments).map(([enchant, level]) => enchant + ":" + level);
    if (extra.dye_item) breakdown.dye = extra.dye_item;
    if (extra.ethermerge) breakdown.etherwarp = true;
    if (extra.tuned_transmission) breakdown.transmissionTuners = extra.tuned_transmission;
    if (extra.talisman_enrichment) breakdown.enrichment = `TALISMAN_ENRICHMENT_${extra.talisman_enrichment.toUpperCase()}`;
    if (extra.artOfPeaceApplied) breakdown.artOfPeace = true;

    // Gemstone shit
    if (extra.gems) {
        let gemNbt = extra.gems

        // Unlocked slots cost
        if (gemNbt.unlocked_slots) {
            let unlockedSlots = gemNbt.unlocked_slots
            if ("gemstone_slots" in itemJsonData) {
                // Store the indexes since the json doesn't
                let currIndexes = {}
                for (let unlockableSlot of itemJsonData["gemstone_slots"]) {
                    let type = unlockableSlot.slot_type
                    if (!(type in currIndexes)) currIndexes[type] = -1
                    currIndexes[type]++

                    let typeStr = `${type}_${currIndexes[type]}`
                    if (!unlockedSlots.includes(typeStr)) continue

                    breakdown.gemstoneUnlocks++;
                }
            }
        }
        // Actual gemstones cost
        let gemTypes = {} // {"COMBAT_0": "SAPPHIRE", ...}
        let keys = Object.keys(gemNbt)
        // Initialize the gem types for combat, universal etc slots
        for (let key of keys) {
            let match = key.match(/^(\w+_\d+)_gem$/)
            if (!match) continue
            gemTypes[match[1]] = gemNbt[key]
        }

        for (let entry of Object.entries(gemNbt)) {
            let [key, value] = entry
            let match = key.match(/^(\w+)_\d+$/)
            if (!match) continue
            let [_, gemType] = match

            if (key in gemTypes) gemType = gemTypes[key]

            // If gemstone is perfect, it will have a UUID and a quality key
            // Otherwise, value will just be the quality
            let gemId = `${value.quality ?? value}_${gemType}_GEM`

            breakdown.gemstones.push(gemId);
        }
    }

    return breakdown;
}

function getItemBreakdown(nbt, sbId = null) {
    if (!sbId) return null
    
    const breakdown = {
        itemId: getSkyblockItemID(item),
        recomb: false,
        reforge: "",
        hotPotatoBooks: 0,
        gemstoneUnlocks: 0,
        gemstones: [],
        scrolls: [],
        artOfWar: false,
        dungeonConversion: false,
        starCount: 0,
        enchantments: [],
        dye: "",
        etherwarp: false,
        transmissionTuners: 0,
        enrichment: "",
        artOfPeace: false
    }

    const extra = nbt?.tag?.ExtraAttributes;
    if (!extra) return breakdown;

    const itemJsonData = getSbApiItemData(sbId) ?? {}

    if (extra.rarity_upgrades == 1) breakdown.recomb = true; // Recomb
    if (extra.hot_potato_count) breakdown.hotPotatoBooks = extra.hot_potato_count // Hot Potato Books
    if (extra.modifier) breakdown.reforge = extra.modifier.toUpperCase();
    if (extra.ability_scroll) breakdown.scrolls = extra.ability_scroll;
    if (extra.art_of_war_count) breakdown.artOfWar = true;
    if (extra.dungeon_item_conversion_cost) breakdown.dungeonConversion = extra.dungeon_item_conversion_cost ?? 0
    if (extra.upgrade_level) breakdown.starCount = extra.upgrade_level;
    if (extra.enchantments) breakdown.enchantments = Object.entries(extra.enchantments).map(([enchant, level]) => enchant + ":" + level);
    if (extra.dye_item) breakdown.dye = extra.dye_item;
    if (extra.ethermerge) breakdown.etherwarp = true;
    if (extra.tuned_transmission) breakdown.transmissionTuners = extra.tuned_transmission;
    if (extra.talisman_enrichment) breakdown.enrichment = `TALISMAN_ENRICHMENT_${extra.talisman_enrichment.toUpperCase()}`;
    if (extra.artOfPeaceApplied) breakdown.artOfPeace = true;

    // Gemstone shit
    if (extra.gems) {
        let gemNbt = extra.gems

        // Unlocked slots cost
        if (gemNbt.unlocked_slots) {
            let unlockedSlots = gemNbt.unlocked_slots
            if ("gemstone_slots" in itemJsonData) {
                // Store the indexes since the json doesn't
                let currIndexes = {}
                for (let unlockableSlot of itemJsonData["gemstone_slots"]) {
                    let type = unlockableSlot.slot_type
                    if (!(type in currIndexes)) currIndexes[type] = -1
                    currIndexes[type]++

                    let typeStr = `${type}_${currIndexes[type]}`
                    if (!unlockedSlots.includes(typeStr)) continue

                    breakdown.gemstoneUnlocks++;
                }
            }
        }
        // Actual gemstones cost
        let gemTypes = {} // {"COMBAT_0": "SAPPHIRE", ...}
        let keys = Object.keys(gemNbt)
        // Initialize the gem types for combat, universal etc slots
        for (let key of keys) {
            let match = key.match(/^(\w+_\d+)_gem$/)
            if (!match) continue
            gemTypes[match[1]] = gemNbt[key]
        }

        for (let entry of Object.entries(gemNbt)) {
            let [key, value] = entry
            let match = key.match(/^(\w+)_\d+$/)
            if (!match) continue
            let [_, gemType] = match

            if (key in gemTypes) gemType = gemTypes[key]

            // If gemstone is perfect, it will have a UUID and a quality key
            // Otherwise, value will just be the quality
            let gemId = `${value.quality ?? value}_${gemType}_GEM`

            breakdown.gemstones.push(gemId);
        }
    }

    return breakdown;
}

function getBazaarPriceAfterTax(initialPrice) {
    return reductPercentage(initialPrice, 1.25);
}

function getBINPriceAfterTax(initialPrice) {
    if (initialPrice < 10_000_000) return reductPercentage(initialPrice, 1);
    if (initialPrice < 100_000_000) return reductPercentage(initialPrice, 2);
    return reductPercentage(initialPrice, 2.5);
}

export default { getBuyPrice, getSellPrice, getItemValue, getBazaarPriceAfterTax, getBINPriceAfterTax, getItemSimilarity, getItemBreakdown };