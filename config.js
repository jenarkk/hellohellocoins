import { @Vigilant, @TextProperty, @SliderProperty } from "../Vigilance";

@Vigilant("hellohellocoins", "hellohellocoins", {
	getCategoryComparator: () => (a, b) => {
		const categories = ["Lowballer", "Crafter", "Keys"];
		return categories.indexOf(a.name) - categories.indexOf(b.name);
	}
})
class config {
	// API
	@TextProperty({
		name: "API Key",
		description: "https://developer.hypixel.net/",
		category: "Keys",
		subcategory: "Hypixel"
	})
	apiKey = "";

	@TextProperty({
		name: "Bot Token",
		description: "https://discord.com/developers/applications/\n/ct reload after updating this",
		category: "Keys",
		subcategory: "Discord"
	})
	botToken = "";

	@TextProperty({
		name: "Channel ID",
		description: "/ct reload after updating this",
		category: "Keys",
		subcategory: "Discord"
	})
	channelId = "";

	// Value
	@SliderProperty({
        name: "Minimum Value",
        description: "(Millions)",
        category: "Lowballer",
        subcategory: "Value",
        min: 0,
        max: 1000
    })
    minValue = 20;

	@SliderProperty({
        name: "Maximum Value",
        description: "(Millions)",
        category: "Lowballer",
        subcategory: "Value",
        min: 0,
        max: 1000
    })
    maxValue = 1000;

	// Profit
	@SliderProperty({
        name: "Minimum Profit",
        description: "(Percentage)",
        category: "Lowballer",
        subcategory: "Profit",
        min: 0,
        max: 100
    })
    minProfit = 15;

	// Blacklist
	@TextProperty({
		name: "Item Blacklist",
		description: "Use item ids and seperate each item using ','",
		category: "Lowballer",
		subcategory: "Blacklist"
	})
	blacklist = "";

	constructor() {
		this.initialize(this);
	}
}

export default new config();