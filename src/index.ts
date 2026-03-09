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

main();
async function main() {
	establecerCaracteristicas(cliente);

	await cliente.login(process.env.CLAVE_DEL_BOT);

	iniciarCaches();
}

function iniciarCaches() {
	canalDeRegistrosDeCanalesDeTexto.iniciar();
	canalDeRegistrosDeCanalesDeVoz.iniciar();
	canalDeRegistrosDeServidor.iniciar();
	canalDeRegistrosDeUsuarios.iniciar();
	canalDeRegistrosDeModeracion.iniciar();
}
