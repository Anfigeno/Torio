import { Client, GatewayIntentBits } from "discord.js";
import { Funci } from "./lib/Funci";

const cliente = new Client({
	intents: Funci.con(GatewayIntentBits, (g) => [
		g.Guilds,
		g.GuildMembers,
		g.MessageContent,
		g.GuildMessages,
		g.GuildMessageReactions,
	]),
});

export default cliente;
