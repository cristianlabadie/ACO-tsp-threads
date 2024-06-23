const Tour = require("./Tour");

class Ant {
	constructor(mapa, largo, probabilidadInicial, tau) {
		this.m_m = mapa;
		this.m_visitadas = new Array(largo).fill(false);
		this.m_id_ciudad_actual = 0;
		this.m_tau = tau;
		this.m_largo = largo;
		this.rutaSeguida = [];
		this.probabilidadInicial = probabilidadInicial;

		// Esto es para que cuando se cree una hormiga, parta desde una ciudad aleatoria
		this.m_id_ciudad_actual = this.random(this.m_largo - 1);
		this.m_visitadas[this.m_id_ciudad_actual] = true;
		this.rutaSeguida.push(this.m_id_ciudad_actual);
	}

	random(length) {
		return Math.floor(Math.random() * length);
	}

	seleccionarIndice(probabilidad) {
		let suma = probabilidad.reduce((a, b) => a + b, 0);
		let aleatorio = Math.random() * suma;
		let acumulado = 0;

		for (let i = 0; i < probabilidad.length; i++) {
			acumulado += probabilidad[i];
			if (aleatorio < acumulado) {
				return i;
			}
		}
		return probabilidad.length - 1; // Por si acaso no se encuentra un índice (debería ser raro)
	}

	mover(ALFA, BETA) {
		let noVisitadas = [];
		let probabilidad = [];
		let pesos = [];
		for (let i = 0; i < this.m_largo; i++) {
			if (!this.m_visitadas[i]) {
				noVisitadas.push(i);
				probabilidad.push(this.probabilidadInicial[this.m_id_ciudad_actual][i]);
				// let peso=std::pow(m_m.probabilidadInicial[m_id_ciudad_actual][cand],ALFA)*std::pow(m_tau[m_id_ciudad_actual][cand],BETA);
				let peso =
					Math.pow(this.probabilidadInicial[this.m_id_ciudad_actual][i], ALFA) *
					Math.pow(this.m_tau[this.m_id_ciudad_actual][i], BETA);
				pesos.push(peso);
			}
		}

		if (!noVisitadas.length) return 0;

		let indiceSeleccionado = this.seleccionarIndice(pesos);
		let nuevaCiudad = noVisitadas[indiceSeleccionado];
		this.m_id_ciudad_actual = nuevaCiudad;
		this.rutaSeguida.push(nuevaCiudad);
		this.m_visitadas[nuevaCiudad] = true;
		return 1;
	}

	mostrarRuta() {
		for (let ciudad of this.rutaSeguida) {
			console.log(`${ciudad} `);
		}
	}

	buildTour(ALFA, BETA) {
		while (this.mover(ALFA, BETA) > 0);

		let ruta = this.rutaSeguida; //copia
		ruta.push(this.rutaSeguida[0]);

		let t = new Tour(ruta);
		t.costo = t.evaluar(this.m_m);
		return t;
	}
}

module.exports = Ant;
