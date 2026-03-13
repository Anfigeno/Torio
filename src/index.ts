import "./configuracion/variablesDeEntorno.ts";
import {
	canalDeRegistrosDeCanalesDeTexto,
	canalDeRegistrosDeCanalesDeVoz,
	canalDeRegistrosDeModeracion,
	canalDeRegistrosDeServidor,
	canalDeRegistrosDeUsuarios,
} from "./caches.ts";
import establecerCaracteristicas from "./caracteristicas/caracteristicas";
import cliente from "./cliente";
import registro from "./configuracion/registro.ts";
import type Cachos from "./lib/Cachos.ts";
import { Funci } from "./lib/Funci.ts";

main();
async function main() {
	establecerCaracteristicas(cliente);

	await cliente.login(process.env.CLAVE_DEL_BOT);

	const { ok: cachesIniciados, error } = await iniciarCaches();
	if (!cachesIniciados) registro.fatal(error);

	registro.info("Bot listo!");
}

async function iniciarCaches(): Promise<Funci.Resultado<null, ErrorAlIniciarCaches>> {
	// biome-ignore lint/suspicious/noExplicitAny: Aquí no importan los genéricos
	const caches: Cachos<any, any>[] = [
		canalDeRegistrosDeCanalesDeTexto,
		canalDeRegistrosDeCanalesDeVoz,
		canalDeRegistrosDeServidor,
		canalDeRegistrosDeUsuarios,
		canalDeRegistrosDeModeracion,
	];

	for (const cache of caches) {
		const { ok, error } = await cache.iniciar();
		if (!ok) return Funci.fallo(new ErrorAlIniciarCaches(error));
		await esperar(300);
	}

	return Funci.exito(null);
}

const esperar = (ms: number): Promise<void> =>
	new Promise((resolve) => setTimeout(resolve, ms));

class ErrorAlIniciarCaches extends Error {
	constructor(public readonly errorBase?: unknown) {
		super();
		this.name = "ErrorAlIniciarCaches";
	}
}
