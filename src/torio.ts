import { Client, GatewayIntentBits } from "discord.js";
import { con, usando } from "./lib/Funci";
import Torio from "./lib/Torio";

const { CLAVE_DEL_BOT, ID_DEL_BOT, ID_DEL_SERVIDOR } = process.env;

export default usando(new Torio(CLAVE_DEL_BOT, ID_DEL_BOT, ID_DEL_SERVIDOR), t => {
	t.establecerCliente(
		new Client({
			intents: con(GatewayIntentBits, g => [
				g.Guilds,
				g.GuildMembers,
				g.MessageContent,
				g.GuildMessages,
				g.GuildMessageReactions,
				g.GuildVoiceStates,
			]),
		}),
	);
});
