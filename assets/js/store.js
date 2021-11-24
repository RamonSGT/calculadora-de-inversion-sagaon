class Store {
  constructor(initialState) {
    this.state = initialState;
  }

  // Esto nos permitirá guardar el estado de una variable en la aplicación.
  setState(key, value) {
    this.state = {
      ...this.state,
      [key]: value,
    };
  }

  // Esto nos devolverá el valor de la variable a la cual queremos acceder.
  getState(key) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  // Función auxiliar para seleccionar una máquian especifica en el estado de máquinas.
  selectMachine(id_producto) {
    this.state.selectedMachine = this.state.machines.find(
      (m) => m.id_producto === id_producto
    );
  }

  selectConsumption(id_consumo) {
    return this.state.selectedConsumption = this.state.consumptions.find(
      (c) => c.id_consumo === id_consumo
    );
  }

  selectHomeRate(id_tarifa) {
    this.state.selectedRate = this.state.homeRates.find(
      (c) => c.id_tarifa === id_tarifa
    );
  }

  selectDACRate(id_tarifa) {
    this.state.selectedRate = this.state.DACRates.find(
      (dr) => dr.id_tarifa === id_tarifa
    );
  }

  selectCharge(id_cargo) {
    this.state.selectedCharge = this.state.charges.find(
      (c) => c.id_cargo === id_cargo
    );
  }

  // Función para calcular el costo por pedazo de hoja.
  calculateCostPerChunkLeaf() {
    if(!this.state.selectedMachine || !this.state.totalCost || !this.state.widthLeaf || !this.state.largeLeaf) return null
    const totalChunks = this.calculateChunks()
    if(!this.state.totalCost && !totalChunks) return null
    const costPerChunk = (parseFloat(this.state.totalCost) / totalChunks).toFixed(2)
    return costPerChunk
  }

  calculateChunks() {
    if(!store.getState("widthLeaf") || !store.getState("largeLeaf") || !store.getState("selectedMachine")) return null
    const width = parseFloat(store.getState("widthLeaf"))
    const large = parseFloat(store.getState("largeLeaf"))
    const { corte_ancho, corte_largo } = store.getState("selectedMachine")
    if(!width || !large || !corte_ancho || !corte_largo) return null
    return parseFloat((width * large) / ((corte_ancho) * (corte_largo))).toFixed(2)
  }

  calculateDesignChunks() {
    if(!store.getState("widthLeafDesign") || !store.getState("largeLeafDesign") || !store.getState("selectedMachine")) return null
    const widthLeafDesign = store.getState("widthLeafDesign")
    const largeLeafDesign = store.getState("largeLeafDesign")
    const { corte_ancho, corte_largo } = store.getState("selectedMachine")
    if(!widthLeafDesign || !largeLeafDesign || !corte_ancho || !corte_largo) return null
    const designPerChunk = (corte_ancho * corte_largo ) / ((widthLeafDesign + 0.1) * (largeLeafDesign + 0.1))
    store.setState("designPerChunk", designPerChunk)
    const total = parseFloat(designPerChunk * parseFloat($("#numeroPedazos").val())).toFixed(2)
    store.setState("totalDesignChunks", total)
    return total
  }

  calculateDesignsChunksPerLeaf() {
    if(!store.getState("widthLeafDesign") || !store.getState("largeLeafDesign") || !store.getState("selectedMachine")) return null
    const widthLeafDesign = store.getState("widthLeafDesign")
    const largeLeafDesign = store.getState("largeLeafDesign")
    const { corte_ancho, corte_largo } = store.getState("selectedMachine")
    if(!widthLeafDesign || !largeLeafDesign || !corte_ancho || !corte_largo) return null
    const designPerChunk = (corte_ancho * corte_largo ) / ((widthLeafDesign + 0.1) * (largeLeafDesign + 0.1))
    store.setState("designPerChunk", designPerChunk)
    const total = parseFloat(designPerChunk).toFixed(2)
    store.setState("totalDesignChunks", total)
    return total
  }

  calculateCostDesignChunk() {
    if(!this.state.widthLeafDesign || !this.state.largeLeafDesign) return null
    const designPerChunk = parseFloat(store.getState("designPerChunk"))    
    const costPerChunk = parseFloat($("#costoPedazo").val())
    if(!designPerChunk || !costPerChunk) return null
    const costPerDesign =  costPerChunk / designPerChunk
    if(!costPerDesign) return null
    return costPerDesign.toFixed(2)
  }
}

const store = new Store({
  selectedMachine: null,
  machines: null,
  selectedConsumption: null,
  consumptions: null,
  selectedRate: null,
  homeRates: null,
  DACRates: null,
  selectedCharge: null,
  charges: null,
  rateFlag: 0, // 0 -> home, 1 -> DAC
  timeElapsed: 0
});
