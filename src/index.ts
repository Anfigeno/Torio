import "./configuracion/variablesDeEntorno.ts";
import {
	canalDeRegistrosDeCanalesDeTexto,
	canalDeRegistrosDeCanalesDeVoz,
	canalDeRegistrosDeModeracion,
	canalDeRegistrosDeServidor,
	canalDeRegistrosDeUsuarios,
} from "./caches.ts";
import autenticado from "./caracteristicas/autenticado.ts";
import ping from "./caracteristicas/ping.ts";
import registrosDeCanalesDeTexto from "./caracteristicas/registrosDeDiscord/registrosDeCanalesDeTexto.ts";
import registrosDeCanalesDeVoz from "./caracteristicas/registrosDeDiscord/registrosDeCanalesDeVoz.ts";
import registrosDeServidor from "./caracteristicas/registrosDeDiscord/registrosDeServidor.ts";
import { registrosDeUsuarios } from "./caracteristicas/registrosDeDiscord/registrosDeUsuarios.ts";
import saludo from "./caracteristicas/saludo.ts";
import registro from "./configuracion/registro.ts";
import torio from "./torio.ts";

main();
async function main() {
	torio.agregarCaracteristicas(
		autenticado,
		saludo,
		ping,
		registrosDeCanalesDeTexto,
		registrosDeCanalesDeVoz,
		registrosDeServidor,
		registrosDeUsuarios,
	);

	torio.establecerCaracteristicas();

	await torio.cliente.login(process.env.CLAVE_DEL_BOT);
	await iniciarCaches();

	registro.info("Bot listo!");
}

async function iniciarCaches(): Promise<void> {
	const caches = [
		canalDeRegistrosDeCanalesDeTexto,
		canalDeRegistrosDeCanalesDeVoz,
		canalDeRegistrosDeServidor,
		canalDeRegistrosDeUsuarios,
		canalDeRegistrosDeModeracion,
	];

	for (const cache of caches) {
		cache.iniciar();
		await esperar(300);
	}
}

const esperar = (ms: number) => new Promise((resolver) => setTimeout(resolver, ms));
