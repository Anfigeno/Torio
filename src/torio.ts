import { Client, GatewayIntentBits } from "discord.js";
import { Funci } from "./lib/Funci";
import Torio from "./lib/Torio";

const torio = new Torio(
	new Client({
		intents: Funci.con(GatewayIntentBits, (g) => [
			g.Guilds,
			g.GuildMembers,
			g.MessageContent,
			g.GuildMessages,
			g.GuildMessageReactions,
			g.GuildVoiceStates,
		]),
	}),
);

export default torio;
