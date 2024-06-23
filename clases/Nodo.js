module.exports = class Nodo {
	constructor(id = null, ant = null, sig = null, posicion = null) {
		this.id = id;
		this.ant = ant;
		this.sig = sig;
		this.posicion = posicion;
	}
};
