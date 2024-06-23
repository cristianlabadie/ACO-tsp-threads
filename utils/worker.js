const { parentPort } = require("worker_threads");
const Ant = require("../clases/Ant2");

parentPort.on("message", (data) => {
	const { mapa, largo, probabilidadInicial } = data;

	const ant = new Ant(mapa, largo, probabilidadInicial);

	while (ant.mover()) {}
	let ruta = ant.rutaSeguida;
	ruta.push(ant.rutaSeguida[0]);
	parentPort.postMessage(ruta);
});
