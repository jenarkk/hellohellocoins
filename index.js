import hhcCommand from "./events/hhcCommand";
import config from "./config";

import "./features/craft";
import "./features/lowball";
//import "./features/autotrade";

import { chat } from "./utils/utils";

hhcCommand.addCommand(undefined, "Opens the config gui", () => {
    config.openGUI();
})

hhcCommand.addCommand("help", "Displays this help message.", () => {
    chat("&aCommands:");
    ChatLib.chat("&a{")

    hhcCommand.commands.forEach(([name, desc, _]) => {
        if (name === undefined) return;

        new TextComponent("      &e\"" + name + "\"&7: " + desc)
            .setHoverValue("&7Click to auto fill this command.")
            .setClickAction("suggest_command")
            .setClickValue("/hhc " + name)
            .chat();
    })

    ChatLib.chat("&a}");
})