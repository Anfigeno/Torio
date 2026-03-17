import "./configuracion/variablesDeEntorno.ts";
import { Client, GatewayIntentBits } from "discord.js";
import autenticado from "./caracteristicas/autenticado.ts";
import ping from "./caracteristicas/ping.ts";
import saludo from "./caracteristicas/saludo.ts";
import registro from "./configuracion/registro.ts";
import { Funci } from "./lib/Funci.ts";
import Torio from "./Torio.ts";

main();
async function main() {
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

	torio.agregarCaracteristicas(autenticado, saludo, ping);
	torio.establecerCaracteristicas();

	await torio.cliente.login(process.env.CLAVE_DEL_BOT);

	registro.info("Bot listo!");
}

// async function iniciarCaches(): Promise<Funci.Resultado<null, ErrorAlIniciarCaches>> {
// 	// biome-ignore lint/suspicious/noExplicitAny: Aquí no importan los genéricos
// 	const caches: Cachos<any, any>[] = [
// 		canalDeRegistrosDeCanalesDeTexto,
// 		canalDeRegistrosDeCanalesDeVoz,
// 		canalDeRegistrosDeServidor,
// 		canalDeRegistrosDeUsuarios,
// 		canalDeRegistrosDeModeracion,
// 	];
//
// 	for (const cache of caches) {
// 		const { ok, error } = await cache.iniciar();
// 		if (!ok) return Funci.fallo(new ErrorAlIniciarCaches(error));
// 		await esperar(300);
// 	}
//
// 	return Funci.exito(null);
// }
//
// const esperar = (ms: number): Promise<void> =>
// 	new Promise((resolve) => setTimeout(resolve, ms));
//
// class ErrorAlIniciarCaches extends Error {
// 	constructor(public readonly errorBase?: unknown) {
// 		super();
// 		this.name = "ErrorAlIniciarCaches";
// 	}
// }
