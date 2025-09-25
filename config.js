import { @Vigilant, @TextProperty, @SliderProperty } from "../Vigilance";

@Vigilant("hellohellocoins", "hellohellocoins", {
	getCategoryComparator: () => (a, b) => {
		const categories = ["Lowballing", "Crafting"];
		return categories.indexOf(a.name) - categories.indexOf(b.name);
	}
})
class config {

	// Value
	@SliderProperty({
        name: "Profit Amount",
        description: "(Percentage)",
        category: "Lowballing",
        min: 0,
        max: 100
    })
    profitAmount = 20;

	constructor() {
		this.initialize(this);
	}
}

export default new config();