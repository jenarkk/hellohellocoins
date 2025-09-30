import priceUtils from "./priceUtils";
import { getSbApiItemData } from "../../BloomCore/utils/Utils";
import { getItemUUID, getSimilarity, getSkyblockItemID } from "./utils";
import PriceUtils from "../../BloomCore/PriceUtils";

const masterStars = [
    "FIRST_MASTER_STAR",
    "SECOND_MASTER_STAR",
    "THIRD_MASTER_STAR",
    "FOURTH_MASTER_STAR",
    "FIFTH_MASTER_STAR"
];

const stackingEnchants = [
    "champion",
    "cultivating",
    "toxophilite",
    "compact",
    "hecatomb",
    "expertise"
];

const promisingTools = [
    "PROMISING_PICKAXE",
    "PROMISING_SPADE",
    "PROMISING_AXE",
    "PROMISING_HOE"
];

const fields = [
    "recomb",
    "dungeonItem",
    "dye",
    "etherwarp",
    "artOfWar",
    "transmissionTuners",
    "enrichment",
    "scrolls",
    "hotPotatoBooks",
    "starCount",
    "enchants",
    "silexes",
    "gemstoneUnlocks",
    "gemstones"
];

export default class SkyblockItem {
    constructor(data, resp = false) {
        const nbt = resp ? data.nbtData : data.getNBT()?.toObject();
        if (!nbt) return null;

        const extra = resp ? nbt.data : nbt.tag?.ExtraAttributes;
        if (!extra) return null;

        this.sbId = resp ? data.tag : getSkyblockItemID(data);
        if (!this.sbId) return null;

        const itemJsonData = getSbApiItemData(this.sbId);
        if (!itemJsonData) return null;

        this.itemName = (resp ? data.itemName : data.getName()).removeFormatting();
        this.uuid = resp ? extra?.uuid : getItemUUID(data);

        this.itemValue = priceUtils.getBuyPrice(this.sbId) ?? 0;

        // Recomb
        this.recomb = extra.rarity_upgrades === 1;
        if (this.recomb) this.itemValue += priceUtils.getBuyPrice("RECOMBOBULATOR_3000") ?? 0

        // Dungeon conversion
        this.dungeonItem = false;
        if (extra.dungeon_item_conversion_cost || extra.dungeon_item) this.dungeonItem = true;

        // Dyes
        this.dye = extra.dye_item ?? "";
        if (extra.dye_item) this.itemValue += priceUtils.getBuyPrice(extra.dye_item) ?? 0;

        // Etherwarp
        this.etherwarp = Boolean(extra.ethermerge);
        if (extra.ethermerge) this.itemValue += (priceUtils.getBuyPrice("ETHERWARP_MERGER") ?? 0) + (priceUtils.getBuyPrice("ETHERWARP_CONDUIT") ?? 0);

        // Art of peace
        this.artOfPeace = extra.artOfPeaceApplied;
        if (extra.artOfPeaceApplied) this.itemValue += priceUtils.getBuyPrice("THE_ART_OF_PEACE") ?? 0;

        // Art of war
        this.artOfWar = false;
        if (extra.art_of_war_count) {
            this.artOfWar = true;
            this.itemValue += priceUtils.getBuyPrice("THE_ART_OF_WAR");
        }

        // Transmission Tuners
        this.transmissionTuners = extra.tuned_transmission ?? 0;
        if (extra.tuned_transmission) {
            this.itemValue += (priceUtils.getBuyPrice("TRANSMISSION_TUNER") ?? 0) * extra.tuned_transmission;
        }

        // Enrichment
        this.enrichment = "";
        if (extra.talisman_enrichment) {
            this.enrichment = `TALISMAN_ENRICHMENT_${extra.talisman_enrichment.toUpperCase()}`;
            this.itemValue += priceUtils.getBuyPrice(this.enrichment) ?? 0;
        }

        // Hype scrolls etc
        let scrollsPrice = 0;
        this.scrolls = [];

        if (extra.ability_scroll) {
            if (typeof extra.ability_scroll == 'string') {
                this.scrolls.push(extra.ability_scroll);
                this.itemValue += priceUtils.getBuyPrice(extra.ability_scroll);
            } else {
                for (let scroll of extra.ability_scroll) {
                    const price = priceUtils.getBuyPrice(scroll);
                    scrollsPrice += price;
                    this.scrolls.push(scroll);
                }

                this.itemValue += scrollsPrice;
            }
        }

        // Hot Potato Books
        this.hotPotatoBooks = 0;

        const hot_potato_count = (extra.hot_potato_count ?? extra.hpc) ?? null;
        if (hot_potato_count) {
            const hpbCount = hot_potato_count;
            this.hotPotatoBooks = hpbCount;

            const hpbCost = priceUtils.getBuyPrice("HOT_POTATO_BOOK") ?? 0;
            const fpbCost = priceUtils.getBuyPrice("FUMING_POTATO_BOOK") ?? 0;

            let totalHPBCost = 0;

            if (hpbCount > 10) {
                totalHPBCost = hpbCost * 10;
                totalHPBCost += fpbCost * (hpbCount % 10);
            } else totalHPBCost = hpbCost * hpbCount

            this.itemValue += totalHPBCost;
        }

        // Stars and Master Stars
        this.starCount = 0;

        if (extra.upgrade_level) {
            let maxUpgrades = itemJsonData?.upgrade_costs?.length || 0;
            let starPrice = 0;

            for (let i = 0; i < Math.min(extra.upgrade_level, maxUpgrades); i++) {
                starPrice += PriceUtils.getUpgradeCost(itemJsonData.upgrade_costs[i]);
                this.starCount++;
            }

            this.itemValue += starPrice;

            // Master Stars
            if (extra.upgrade_level > maxUpgrades && extra.upgrade_level - maxUpgrades <= 5) {
                let masterStarCount = extra.upgrade_level - maxUpgrades;
                let masterStarPrice = masterStars.slice(0, masterStarCount).reduce((a, b) => {
                    this.starCount++;
                    return a + (priceUtils.getBuyPrice(b) ?? 0)
                }, 0);

                this.itemValue += masterStarPrice;
            }
        }

        // Enchants
        this.enchants = [];
        this.silexes = 0;

        const enchantments = resp ? data.enchantments : Object.entries(extra.enchantments);
        if (enchantments) {
            for (let entry of enchantments) {
                const [enchant, level] = resp ? [entry.type, entry.level] : entry;

                if (enchant == "efficiency" && level > 5 && !promisingTools.includes(sbId)) {
                    let silexes = level - 5;
                    if (sbId == "STONK_PICKAXE") level--;
                    this.silexes = silexes;
                    this.itemValue += (priceUtils.getBuyPrice("SIL_EX") ?? 0) * silexes;
                    continue;
                }

                if (enchant == "scavenger" && itemJsonData.dungeon_item) {
                    continue;
                }

                if (stackingEnchants.includes(enchant)) {
                    level = 1;
                }

                let enchantStr = `ENCHANTMENT_${enchant.toUpperCase()}_${level}`;
                this.enchants.push(enchantStr);

                let enchantValue = (priceUtils.getBuyPrice(enchantStr) || PriceUtils.getBookPriceFromT1s(enchantStr)) || 0;
                if (!enchantValue) continue;

                this.itemValue += enchantValue;
            }
        }

        // Gemstone shit
        this.gemstoneUnlocks = 0;
        this.gemstones = [];

        let gemstoneUnlockPrice = 0;

        if (extra.gems) {
            let gemNbt = extra.gems;

            // Unlocked slots cost
            if (gemNbt.unlocked_slots) {
                let unlockedSlots = gemNbt.unlocked_slots;
                if ("gemstone_slots" in itemJsonData) {
                    gemstoneUnlockPrice = 0;

                    // Store the indexes since the json doesn't
                    let currIndexes = {};

                    for (let unlockableSlot of itemJsonData["gemstone_slots"]) {
                        let type = unlockableSlot.slot_type;
                        if (!(type in currIndexes)) currIndexes[type] = -1;
                        currIndexes[type]++;

                        let typeStr = `${type}_${currIndexes[type]}`;
                        if (!unlockedSlots.includes(typeStr)) continue;

                        gemstoneUnlockPrice += PriceUtils.getUpgradeCost(unlockableSlot.costs);
                        this.gemstoneUnlocks++;
                    }

                    this.itemValue += gemstoneUnlockPrice;
                }
            }

            // Actual gemstones cost
            let gemTypes = {}; // {"COMBAT_0": "SAPPHIRE", ...}
            let keys = Object.keys(gemNbt);

            // Initialize the gem types for combat, universal etc slots
            for (let key of keys) {
                let match = key.match(/^(\w+_\d+)_gem$/);
                if (!match) continue;
                gemTypes[match[1]] = gemNbt[key];
            }

            let gemstonePrice = 0;
            this.gemstones = [];

            for (let entry of Object.entries(gemNbt)) {
                let [key, value] = entry;
                let match = key.match(/^(\w+)_\d+$/);
                if (!match) continue;
                let [_, gemType] = match;

                if (key in gemTypes) gemType = gemTypes[key];

                // If gemstone is perfect, it will have a UUID and a quality key
                // Otherwise, value will just be the quality
                let gemId = `${value.quality ?? value}_${gemType}_GEM`;

                gemstonePrice += priceUtils.getBuyPrice(gemId);
                this.gemstones.push(gemId);
            }

            this.itemValue += gemstonePrice;
        }
    }

    /**
     * @param {SkyblockItem | Object} data
     */
    similarity(data) {
        return Math.floor(getSimilarity(fields, this.getBreakdown(), data) * 100);
    }

    getBreakdown() {
        return { ...this };
    }
}