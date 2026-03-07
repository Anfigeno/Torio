import "./configuracion/variablesDeEntorno.ts";
import establecerCaracteristicas from "./caracteristicas/caracteristicas";
import cliente from "./cliente";

main();
function main() {
	establecerCaracteristicas(cliente);

	cliente.login(process.env.CLAVE_DEL_BOT);
}
