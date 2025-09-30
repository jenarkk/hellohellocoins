import { S02PacketChat } from "../utils/mappings";

register("packetReceived", (packet) => {
    // check if it's an action bar update
    if (packet.func_179841_c() !== 0) return;

    const chatComponent = packet.func_148915_c();
    const msg = chatComponent.func_150260_c().removeFormatting();

    const regex = /^(.+) has sent you a trade request\. Click here to accept!$/;
    const match = msg.match(regex);
    if (!match) return;

    ChatLib.command("trade " + match[1], false);
}).setFilteredClass(S02PacketChat)