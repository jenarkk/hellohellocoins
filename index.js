import hhcCommand from "./events/hhcCommand";
import config from "./config";

import "./features/craft";

hhcCommand.addCommand(undefined, "Opens the config gui", () => {
    config.openGUI();
})