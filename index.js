import hhcCommand from "./events/hhcCommand";
import config from "./config";

import "./features/craft";
import "./features/lowball";

hhcCommand.addCommand(undefined, "Opens the config gui", () => {
    config.openGUI();
})