class Ant {
	constructor(m) {
		this.m_m = m;
		this.m_visitadas = new Array(this.m_m.getSize()).fill(false);
		this.m_id_ciudad_actual = 0;
		this.m_largo = this.m_m.getSize();
		this.rutaSeguida = [];

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

	mover() {
		let noVisitadas = [];
		let probabilidad = [];

		for (let i = 0; i < this.m_largo; i++) {
			if (!this.m_visitadas[i]) {
				noVisitadas.push(i);
				probabilidad.push(
					this.m_m.probabilidadInicial[this.m_id_ciudad_actual][i],
				);
			}
		}

		if (!noVisitadas.length) return 0;

		let indiceSeleccionado = this.seleccionarIndice(probabilidad);
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
}

module.exports = Ant;
