class Store {
  constructor(initialState) {
    this.state = initialState;
  }

  setState(key, value) {
    this.state = {
      ...this.state,
      [key]: value,
    };
  }

  getState(key) {
    if (key) {
      return this.state[key];
    }
    return this.state;
  }

  selectMachine(id_producto) {
    console.log("ID DEL PRODUCTO: ", id_producto)
    console.log("PRODUCTOS: ", this.state.machines)
    this.state.selectedMachine = this.state.machines.find(
      (m) => m.id_producto === id_producto
    );
    console.log("SELECTED MACHINE ------", this.state.selectedMachine)
    /**
     * Eliminar lo que se encuentra debajo - Es solo para hacer test de campos que serán requeridos en el futuro, sin embargo
     * tendrán que venir desde el servidor
     */
    this.state.selectedMachine.corte_ancho = 40
    this.state.selectedMachine.corte_largo = 40
    /**
     * Eliminar lo que se encuentra por encima
     */
  }

  selectConsumption(id_consumo) {
    this.state.selectedConsumption = this.state.consumptions.find(
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

  calculateCostPerChunkLeaf() {
    if(!this.state.selectedMachine || !this.state.totalCost || !this.state.widthLeaf || !this.state.largeLeaf) return null
    const totalChunks = this.calculateChunks()
    if(!this.state.totalCost && !totalChunks) return null
    const costPerChunk = (parseFloat(this.state.totalCost) / totalChunks).toFixed(2)
    return costPerChunk
  }

  calculateChunks() {
    console.log("CALCULATE CHUNK: --->", store.state.widthLeaf, store.state.largeLeaf, store.state.selectedMachine)
    if(!store.getState("widthLeaf") || !store.getState("largeLeaf") || !store.getState("selectedMachine")) return null
    const width = parseFloat(store.getState("widthLeaf"))
    const large = parseFloat(store.getState("largeLeaf"))
    const { corte_ancho, corte_largo } = store.getState("selectedMachine")
    if(!width || !large || !corte_ancho || !corte_largo) return null
    return parseFloat((width * large) / ((corte_ancho + 0.5) * (corte_largo + 0.5))).toFixed(2)
  }

  calculateDesignChunks() {
    console.log("Design", store.getState("widthLeafDesign"))
    if(!store.getState("widthLeafDesign") || !store.getState("largeLeafDesign") || !store.getState("selectedMachine")) return null
    const widthLeafDesign = store.getState("widthLeafDesign")
    const largeLeafDesign = store.getState("largeLeafDesign")
    const { corte_ancho, corte_largo } = store.getState("selectedMachine")
    if(!widthLeafDesign || !largeLeafDesign || !corte_ancho || !corte_largo) return null
    const designPerChunk = (corte_ancho * corte_largo ) / ((widthLeafDesign + 0.5) * (largeLeafDesign + 0.5))
    store.setState("designPerChunk", designPerChunk)
    const total = parseFloat(designPerChunk * parseFloat($("#numeroPedazos").val())).toFixed(2)
    store.setState("totalDesignChunks", total)
    return total
  }

  calculateCostDesignChunk() {
    if(!this.state.widthLeafDesign || !this.state.largeLeafDesign) return null
    const designPerChunk = parseFloat(store.getState("designPerChunk"))    
    const costPerChunk = parseFloat($("#costoPedazo").val())
    console.log("Total design chunks: ", designPerChunk, "Cost per chunk: ", costPerChunk)
    if(!designPerChunk || !costPerChunk) return null
    const costPerDesign =  costPerChunk / designPerChunk
    if(!costPerDesign) return null
    return costPerDesign.toFixed(2)
    // return costPerDesign
  }
}



// 120 * 198 = 12

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
});
