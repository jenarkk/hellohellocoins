const commands = [];

register("command", (cmd, ...args) => {
    if (!args) args = [];
	const result = commands.find(listener => listener[0] === cmd);
	if (result) result[2](...args);
	else commands.find(listener => listener[0] === undefined)?.[2]();
}).setName("hellohellocoins").setAliases(["hhc"])

function addCommand(name, description, command) {
    commands.push([name, description, command]);
}

export default { addCommand, commands };