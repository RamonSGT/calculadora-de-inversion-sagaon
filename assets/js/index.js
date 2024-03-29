/**
 * En este archivo se encuentran las funciones que se encargan de manejar los eventos de algunos elementos del DOM, asi como la obtención de datos de los mismos.
 */

/**
 * Estas son las constantes de los selectores de los campos del DOM (Algunos selectores no estan puestas en constantes por lo que estan directamente en las funciones.)
 */
const SELECT_ID_LIST_MACHINES = "listaMaquinasSelect";
const SELECT_ID_CONSUMPTION_RATE = "listaConsumosSelect";
const SELECT_ID_RATE_CFE = "listaTarifaHogarSelect";
const SELECT_ID_RATE_MONTHLY = "listaCargoSelect";
const SELECT_ID_RATE_DAC_LIST = "listaTarifaDACSelect";
const INPUT_ID_HOURS_PER_DAY_MACHINE = "horasTrabajoMaquina";
const INPUT_ID_DAY_WORK_MACHINE = "diasTrabajoMaquina";
const INPUT_ID_COST_TOTAL_LEAF = "costoInput";
const INPUT_ID_WIDTH_LEAF = "widthLeaf";
const INPUT_ID_LARGE_LEAF = "largeLeaf";
const INPUT_ID_MONTHLY_PAYMENT = "pagoMensuOperador";
const INPUT_ID_MONTHLY_HOURS = "horasTrabajoOperador";

/**
 * Estas son variables globales que se utilizan como variables bandera dentro del código.
 */
let selectedOption = "cut-or-engrave";
let calculatedROI = false

$(async function () {
  $("#hogar").css("background-color", "#757575");
  $("#hogar").css("color", "#fdfdfd");
  $("#cargosContainer").css("display", "none");

  // ========================== Calling APIs ========================== //
  /**
   * Obtiene las tarifas del tipo de servicio HOGAR que es el que se pone por defecto en el select.
   */
  const tarifasHogar = await getRates("HOGAR");

  /**
   * Se valida si no hay un error en la llamada a la api, si todo sale bien, entonces se guardan las tarifas en el store y se ponen los valores en el select.
   * 
   */
  if (!tarifasHogar.error) {
    store.setState("homeRates", sortByRate(tarifasHogar))
    displaySelects({
      tagId: "listaTarifaHogarSelect",
      options: tarifasHogar,
      value: "id_tarifa",
      text: "id_tarifa",
    });
  }

  /**
   * Se obtiene todas las tarifas DAC de la api y se almacenan en el store, por si son requeridas por el usuario.
   */
  const tarifasDAC = await getRates("DAC");

  /**
   * Lo mismo que arriba, pero con las tarifas DAC.
   */
  if (!tarifasDAC.error) {
    store.setState("DACRates", tarifasDAC);
    displaySelects({
      tagId: "listaTarifaDACSelect",
      options: tarifasDAC,
      value: "id_tarifa",
      text: "id_tarifa",
    });
  }

  /**
   * Se obtienen todos los productos de la api y se almacenan en el store. Cuando se habla de productos se hace referencia a las máquinas que se encuentran en la base de datos IoT.
   */
  const productos = await getProducts();

  /**
   * Se valida si no hay un error en la llamada a la api, si todo sale bien, entonces se guardan los productos en el store y se ponen los valores en el select.
   */
  if (!productos.error) {
    store.setState("machines", productos);
    /**
     * Se agrega un nuevo atributo de área total para cada máquina que se encuentra en el store con la finalidad de poder ordenarlos según el área de trabajo de la máquina.
     */
    productos.forEach(val => val.size = val.corte_ancho * val.corte_largo)
    displaySelects({
      tagId: "listaMaquinasSelect",
      options: productos.sort((a, b) => a.size - b.size),
      value: "id_producto",
      text: "id_producto",
    });
  }
  // ========================== End Calling APIs ========================== //
});

// ========================== Handlers ========================== //
/**
 * En esta función se centralizan las llamadas a otras funciones que realizan las operaciones de calculo de los costos de la máquina.
 */
function calculatorCalls() {
  calculateCostInput(document.getElementById(INPUT_ID_COST_TOTAL_LEAF))
  calculateRawMaterialData(document.getElementById(INPUT_ID_WIDTH_LEAF), "widthLeaf")
  calculateRawMaterialData(document.getElementById(INPUT_ID_LARGE_LEAF), "largeLeaf")
  calculatePieces(document.getElementById(INPUT_ID_MONTHLY_PAYMENT), "monthlyPayment")
  calculatePieces(document.getElementById(INPUT_ID_MONTHLY_HOURS), "monthlyHours")
}

$("#costoInput").on("input", function (e) {
  calculateCostInput(e.target)
});



/**
  En esta función se cálcula el costo de de un pedoazo de material, es el input que se encuentra en la sección de "Materia Prima"
 */
function calculateCostInput(target) {
  store.setState("totalCost", parseFloat(target.value));
  if (!store.getState("selectedMachine") || !store.getState("widthLeaf") || !store.getState("largeLeaf"))
    return;
  const costPerChunk = store.calculateCostPerChunkLeaf();
  $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
}

$("#widthLeaf").on("input", function (e) {
  calculateRawMaterialData(e.target, "widthLeaf")
});

function calculateRawMaterialData(target, type = "") {
  if (type) store.setState(type, target.value);
  const totalChunks = store.calculateChunks();
  $("#numeroPedazos").val(totalChunks).trigger("change");
  const costPerChunk = store.calculateCostPerChunkLeaf();
  $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
}

$("#largeLeaf").on("input", function (e) {
  calculateRawMaterialData(e.target, "largeLeaf")
});

$("#widthLeafDesign").on("input", function (e) {
  calculatePieces(e.target, "widthLeafDesign")
})

/**
 * si el checkbox de redondear es seleccionado efectua una funcion para volver a calcular el costo por pedazo de material
 */
 $('#redondear-numero-piezas').on("click", function(){
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
    const costPerDesign = store.calculateCostDesignChunk();
    $("#costoPedazoDesign").val(store.calculateCostDesignChunk())
});

/**
 * Es una función que centraliza la llamada a otras funciones, que calculan el número de pedazos que se necesitan para la máquina. 
 */
function calculatePieces(target, type = "") {
  if (type) store.setState(type, parseFloat(target.value));
  $("#numeroPedazosDesign").val(store.calculateDesignChunks())
  $("#costoPedazoDesign").val(store.calculateCostDesignChunk())
  $("#numeroPedazosPorHoja").val(store.calculateDesignsChunksPerLeaf())
}

$("#largeLeafDesign").on("input", function (e) {
  calculatePieces(e.target, "largeLeafDesign")
})

$("#hogar").on("click", function () {
  $(this).css("background-color", "#757575");
  $(this).css("color", "#fdfdfd");
  $("#dac").css("background-color", "#DBDBDB");
  $("#dac").css("color", "#000d");
  $("#cargosContainer").css("display", "none");
  $("#cargoCustomContainer").css("display", "block");
  store.setState("rateFlag", 0);
  if (calculatedROI) listRatesHomeSelect()
});

$("#dac").on("click", function () {
  $(this).css("background-color", "#757575");
  $(this).css("color", "#fdfdfd");
  $("#hogar").css("background-color", "#DBDBDB");
  $("#hogar").css("color", "#000d");
  $("#cargosContainer").css("display", "block");
  $("#cargoCustomContainer").css("display", "none");
  store.setState("rateFlag", 1);
  if (calculatedROI) listDacSelect()
});

$("#cut-or-engrave").on("click", function () {
  $(this).css("background-color", "#757575");
  $(this).css("color", "#fdfdfd");
  $("#cut-and-engrave").css("background-color", "#DBDBDB");
  $("#cut-and-engrave").css("color", "#000d");
});

$("#cut-and-engrave").on("click", function () {
  $(this).css("background-color", "#757575");
  $(this).css("color", "#fdfdfd");
  $("#cut-or-engrave").css("background-color", "#DBDBDB");
  $("#cut-or-engrave").css("color", "#000d");
});

$("#currentValueKWh").on('focusout', function () {
  const currentValueKWh = parseFloat(document.querySelector("#currentValueKWh").value)
  const lastValueKWh = parseFloat(document.querySelector("#lastValueKWh").value)
  if (!Number.isInteger(parseInt(currentValueKWh)) || !Number.isInteger(parseInt(lastValueKWh))) return
  document.querySelector("#currentUserConsumption").value = currentValueKWh - lastValueKWh
})

$("#lastValueKWh").on('focusout', function () {
  const currentValueKWh = parseFloat(document.querySelector("#currentValueKWh").value)
  const lastValueKWh = parseFloat(document.querySelector("#lastValueKWh").value)
  if (!Number.isInteger(parseInt(currentValueKWh)) || !Number.isInteger(parseInt(lastValueKWh))) return
  document.querySelector("#currentUserConsumption").value = currentValueKWh - lastValueKWh
})

$("#currentUserConsumption").on('focusout', function () {
  const currentValueKWh = parseFloat(document.querySelector("#currentValueKWh").value)
  const lastValueKWh = parseFloat(document.querySelector("#lastValueKWh").value)
  if (!Number.isInteger(parseInt(currentValueKWh)) || !Number.isInteger(parseInt(lastValueKWh))) return
  document.querySelector("#currentUserConsumption").value = currentValueKWh - lastValueKWh
})

$("#listaTarifaHogarSelect").on("change", async e => await listRatesHomeSelect(e.target));

async function listRatesHomeSelect(target) {
  $("#listaCargoSelect").empty();

  let cargos = await getChargesByRegion(target.value);
  store.setState("charges", sortByMonth(cargos));
  store.selectHomeRate(target.value);
  if (!cargos.error) {
    displaySelects({
      tagId: "listaCargoSelect",
      options: store.getState("charges"),
      value: "id_cargo",
      text: "mes",
    });
  }
}

$("#listaCargoSelect").on("change", function () {
  store.selectCharge(this.value);
});

$("#listaTarifaDACSelect").on("change", listDacSelect);

async function listDacSelect() {
  store.selectDACRate(this.value);
  const cargos = await getChargesByRegion(this.value);
  if (!cargos.error) {
    store.setState("selectedCharge", cargos[0]);
  }
}

$("#listaMaquinasSelect").on("change", (e) => {
  changedSelectedMachine(e.target);
});

async function changedSelectedMachine(target) {
  $("#listaConsumosSelect").empty();
  $("#listaConsumosSelect-2").empty();
  $("#listaConsumosSelect-3").empty();
  const consumos = await getConsumptionsByProduct(target.value);
  store.setState("consumptions", consumos);
  store.selectMachine(target.value);
  
  if (!consumos.error) {
    displaySelects({
      tagId: "listaConsumosSelect",
      options: consumos,
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    });
    displaySelects({
      tagId: "listaConsumosSelect-2",
      options: consumos,
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    });
    displaySelects({
      tagId: "listaConsumosSelect-3",
      options: consumos,
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    });
    const machineWidth = store.state.selectedMachine.corte_ancho;
    const machineLength = store.state.selectedMachine.corte_largo;

    $('#machine-width-length').text(`Considere las siguientes medidas de la maquina para su diseño: ${machineWidth} cm de ancho y ${machineLength} cm de largo`)
  }

  const totalChunks = store.calculateChunks();
  $("#numeroPedazos").val(totalChunks).trigger("change");
  const costPerChunk = store.calculateCostPerChunkLeaf();
  $("#costoPorHojaInput").val(costPerChunk).trigger("change");
  $("#costoPedazo").val(costPerChunk).trigger("change");
  const selectedMach = store.getState("selectedMachine")
  if (selectedMach) {
    document.querySelectorAll(".container-img").forEach(e => {
      e.src = selectedMach.imgurls
    })
    // sendImgMachineToParent(selectedMach.imgurls)
  }
}

$("#listaConsumosSelect").on("change", function () {
  const valueConsumption = store.selectConsumption(this.value);
  store.setState("selectedConsumption", valueConsumption);
});

$("#listaConsumosSelect-2").on("change", () => {
  const valueConsumption = store.selectConsumption(document.querySelector("#listaConsumosSelect-2").value)
  store.setState("selectedConsumption-2", valueConsumption)
})

$("#listaConsumosSelect-3").on("change", () => {
  const valueConsumption = store.selectConsumption(document.querySelector("#listaConsumosSelect-3").value)
  store.setState("selectedConsumption-3", valueConsumption)
})

function saveConsumption(stateKey, valueConsumption) {
  store.setState(stateKey, valueConsumption)
}

$("#valuePerPiece").on("input", function () {
  const valueNumber = this.value;
  if (Number.isNaN(valueNumber)) return;
  store.setState("valuePerPiece", parseFloat(this.value).toFixed(2));
});

$("#percentPerPiece").on("input", function () {
  const valueNumber = this.value;
  if (Number.isNaN(valueNumber)) return;
  store.setState("valuePerPieceByPercente", parseFloat(this.value).toFixed(2));
});

$("#pagoMensuOperador").on("input", function (e) {
  calculateCostOperator(e.target)
});
$("#horasTrabajoOperador").on("input", function (e) {
  calculateCostOperator(e.target);
});

function calculateCostOperator(target) {
  const pagoMensuOperador = parseFloat(document.querySelector("#pagoMensuOperador").value);
  const horasTrabajoOperador = parseFloat(document.querySelector("#horasTrabajoOperador").value);
  const costPerHourOperator = pagoMensuOperador / horasTrabajoOperador;
  if (!Number.isNaN(costPerHourOperator)) {
    $("#costoHoraOperador").val(costPerHourOperator.toFixed(2)).trigger("change");
  } else {
    $("#costoHoraOperador").val(null).trigger("change");
  }
}

$("#calcular").on("click", function () {
  clickedCalculate()
});


function clickedCalculate() {
  const invalidFields = areInvalidFields();

  const unfilledFieldsMessage = $('[required]:visible').filter(function() { return this.value === ""; })[0]?.getAttribute('data-unfilled-message');
  // trae todos los inputs o select que son required y no estan llenados
    if ($('[required]:visible').filter(function() { return this.value === ""; }).length > 0) return window.alert(`Han faltado campos por llenar, ${unfilledFieldsMessage ? unfilledFieldsMessage : 'termine de llenar todos los datos'}`)
  handleCalculator()
}

$(".form-input").on("keyup", function () {
  const inputValue = $(this).val();
  const inputId = $(this).attr("id");
  const inputValueNumber = parseInt(inputValue);
  $(this).addClass("is-invalid");
  if (
    inputId === INPUT_ID_HOURS_PER_DAY_MACHINE &&
    Number.isInteger(inputValueNumber) &&
    inputValueNumber >= 0) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (inputId === INPUT_ID_DAY_WORK_MACHINE) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (
    inputId === INPUT_ID_COST_TOTAL_LEAF &&
    Number.isInteger(inputValueNumber) &&
    inputValueNumber >= 1
  ) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (
    inputId === INPUT_ID_WIDTH_LEAF &&
    Number.isInteger(inputValueNumber) &&
    inputValueNumber >= 1
  ) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (
    inputId === INPUT_ID_LARGE_LEAF &&
    Number.isInteger(inputValueNumber) &&
    inputValueNumber >= 1
  ) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (inputId === INPUT_ID_MONTHLY_PAYMENT || inputId === INPUT_ID_MONTHLY_HOURS) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (
    inputId === "widthLeafDesign" &&
    Number.isInteger(inputValueNumber) && inputValueNumber <= store.getState("selectedMachine").corte_ancho
  ) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (inputId === "largeLeafDesign" &&
    Number.isInteger(inputValueNumber) && inputValueNumber <= store.getState("selectedMachine").corte_largo) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (inputId === "thicknessLeaf" && Number.isInteger(inputValueNumber)) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (inputId === "valuePerPiece" && Number.isInteger(inputValueNumber)) {
    $(this).removeClass("is-invalid")
    $(this).addClass("is-valid")
  }
  if(inputId === "horasTrabajoMaquina-2" && Number.isInteger(inputValueNumber)) {
    $(this).removeClass("is-invalid")
    $(this).addClass("is-valid")
  }
  if(inputId === "horasTrabajoMaquina-3" && Number.isInteger(inputValueNumber)) {
    $(this).removeClass("is-invalid")
    $(this).addClass("is-valid")
  }

  calculatorCalls()
});

$(".form-select").on("change", function () {
  const selectValue = $(this).val();
  const selectId = $(this).attr("id");
  $(this).addClass("is-invalid");
  if (selectId === SELECT_ID_LIST_MACHINES && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === SELECT_ID_CONSUMPTION_RATE && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === "listaConsumosSelect-2" && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === "listaConsumosSelect-3" && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === SELECT_ID_RATE_CFE && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === SELECT_ID_RATE_MONTHLY && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === SELECT_ID_RATE_DAC_LIST && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }
  if (selectId === "type-material" && selectValue) {
    $(this).removeClass("is-invalid");
    $(this).addClass("is-valid");
  }

  calculatorCalls()
});

$("input[type=number]").keypress(function (e) {
  var txt = String.fromCharCode(e.which);
  if (!txt.match(/[0-9.]/)) {
    return false;
  }
});

function areInvalidFields(onlyCheck = false) {
  const rateFlag = store.getState("rateFlag");
  const formFields = document.querySelectorAll(".form-input");
  let invalidValues = false;
  let showedAccordion = false;
  for (const form of formFields) {
    if (form.classList.contains("no-validate")) continue
    if (rateFlag === 0 && form.id === SELECT_ID_RATE_DAC_LIST) continue;
    if (rateFlag === 1 && (form.id === SELECT_ID_RATE_CFE || form.id === SELECT_ID_RATE_MONTHLY)) continue;
    if (form.value !== "") {
      form.classList.remove("is-invalid");
      continue;
    }
    if (!showedAccordion && !onlyCheck) {
      const collapseParent = getParentAccordion(form);
      showedAccordion = true;
      collapseParent.classList.add("show");
    }
    if (!onlyCheck) {
      form.classList.add("is-invalid");
    }
    invalidValues = true;
  }
  return invalidValues;
}

function getParentAccordion(element) {
  while (element) {
    element = element.parentElement;
    if (element.className.indexOf("accordion-collapse collapse") >= 0)
      return element;
  }
  return null;
}

// Cada vez que un input se actualiza o select, se correra esta funcion
$('input, select, #listaTarifaDACSelect').change(function () {   
    
    // datos para llevar a cabo las operaciones  
    const costPerHourWorker = parseFloat($("#costoHoraOperador").val())
    const horasTrabajoMaquina = parseFloat($("#horasTrabajoMaquina").val())
    const horasTrabajoMaquina2 = parseFloat($("#horasTrabajoMaquina-2").val())
    const horasTrabajoMaquina3 = parseFloat($("#horasTrabajoMaquina-3").val())
    let totalHours = 0
    let totalConsumptionKWh = null

    if(selectedOption === "cut-or-engrave" && store.state.selectedCharge) {
      const horasTrabajoMaquina = parseFloat($("#horasTrabajoMaquina").val())
      totalHours = horasTrabajoMaquina
      // console.log("El consumo seleccionado es: ", store.getState("selectedConsumption"))
      calculateExpenses({
        consumption: store.getState("selectedConsumption"),
        charge: store.state.selectedCharge,
        workHours: horasTrabajoMaquina / 60,
        rateFlag: store.state.rateFlag,
        stateKey: "totalConsumptionKWh"
      });
    }
    if(selectedOption === "cut-and-engrave" && store.state.selectedCharge) {
      const horasTrabajoMaquina2 = parseFloat($("#horasTrabajoMaquina-2").val())
      const horasTrabajoMaquina3 = parseFloat($("#horasTrabajoMaquina-3").val())
      totalHours = horasTrabajoMaquina2 + horasTrabajoMaquina3
      calculateExpenses({
        consumption: store.getState("selectedConsumption-2"),
        charge: store.state.selectedCharge,
        workHours: horasTrabajoMaquina2 / 60,
        rateFlag: store.state.rateFlag,
        stateKey: "totalConsumptionKWh-2"
      })
      calculateExpenses({
        consumption: store.getState("selectedConsumption-3"),
        charge: store.state.selectedCharge,
        workHours: horasTrabajoMaquina3 / 60,
        rateFlag: store.state.rateFlag,
        stateKey: "totalConsumptionKWh-3"
      })
    }
    const dacPricePerHour = store.state.selectedCharge ? store.state.selectedCharge.fijo / 730 : 0
    const totalDacPricePerDesign = dacPricePerHour * (totalHours)

    const costPerWorkerPiece = ((costPerHourWorker || 0) * (( totalHours / 60 ) || 0)) || 0
    const costPerPiece = parseFloat($("#costoPedazoDesign").val())

    const dacCost = totalDacPricePerDesign ? totalDacPricePerDesign : 0
    const totalCostPerDesign = 
      (costPerPiece 
      + (selectedOption === "cut-or-engrave" ? store.getState("totalConsumptionKWh") : store.getState("totalConsumptionKWh-2") + store.getState("totalConsumptionKWh-3"))
      + costPerWorkerPiece
      + (dacCost)).toFixed(2);

    if (totalCostPerDesign) {
      $('#costo-total').text(`${totalCostPerDesign}`);
    }
});


function calculateUtility(totalHoursMachinePerDesign) {
  // Primero obtenemos todos los datos necesarios para realizar el cálculo
  const costPerHourWorker = parseFloat($("#costoHoraOperador").val())
  let totalConsumptionKWh = null
  if(selectedOption === "cut-and-engrave") {
    totalConsumptionKWh = store.getState("totalConsumptionKWh-2") + store.getState("totalConsumptionKWh-3")
    // Se divide entre 2 por que es es el tiempo que se utilizará para calcular el costo del operador por pieza. horas totales core y grabar en DISEñO
    totalHoursMachinePerDesign = totalHoursMachinePerDesign
  } else if(selectedOption === "cut-or-engrave") {
    totalConsumptionKWh = store.getState("totalConsumptionKWh")
  }
  const valuePerPiece = parseFloat(store.getState("valuePerPiece"))
  const costPerPiece = parseFloat($("#costoPedazoDesign").val())
  const numeroPedazosDesign = Math.floor(parseFloat($("#numeroPedazosDesign").val()))
  const priceMachine = store.getState("selectedMachine").precio_shopify

  // Si no valor en el campo del trabajador, entonces ponemos por default el 0. Hay redundancia en el valor por si el resultabo obtenido es NaN.
  const costElectricity = store.getState("selectedRate").tipo === "DAC" ? document.querySelector("#listaConsumos > tr:nth-child(4) > td") : document.querySelector("#listaConsumos > tr:nth-child(3) > td")
  const costPerWorkerPiece = ((costPerHourWorker || 0) * (( totalHoursMachinePerDesign / 60 ) || 0)) || 0
  store.setState("costPerWorkerPerPiece", costPerWorkerPiece)
  const totalCostPerDesign = costPerPiece + totalConsumptionKWh + costPerWorkerPiece 
  const utilityPerDesign = (valuePerPiece - totalCostPerDesign) < 0 || !(valuePerPiece - totalCostPerDesign) ? 'No hay utilidad' : (valuePerPiece - totalCostPerDesign).toFixed(2);
  const totalUtility = (utilityPerDesign * numeroPedazosDesign) < 0 || !(utilityPerDesign * numeroPedazosDesign) ? 'Revise sus datos' : (utilityPerDesign * numeroPedazosDesign).toFixed(2);
  // console.log(totalUtility)
  const roiPieces = Math.ceil(priceMachine / utilityPerDesign) < 1 || !(priceMachine / utilityPerDesign) ? '- - -' : Math.ceil(priceMachine / utilityPerDesign);
  const fixedDacPricePerDesign = store.getState("DACFixedPrice")
  if (fixedDacPricePerDesign > 0) {
    // We divide the dac price by the total hours per month that are 730 to get the price per hour
    const dacPricePerHour = fixedDacPricePerDesign / 730
    // We multiply the dac price per hour by the total hours per design to get the total dac price per design
    const totalDacPricePerDesign = dacPricePerHour * totalHoursMachinePerDesign
    store.setState("costDACPerDesign", totalDacPricePerDesign.toFixed(2))
  } else {
    store.setState("costDACPerDesign", 0)
  }
  // console.log(totalConsumptionKWh)
  // console.log(costElectricity)
  store.setState("utilityPerPiece", (utilityPerDesign));
  store.setState("totalUtility", (totalUtility));
  store.setState("roiPieces", (roiPieces));
}

// ========================== End Handlers ========================== //
function handleCalculator() {
  const {
    selectedMachine,
    selectedRate,
    selectedCharge,
    rateFlag,
  } = store.getState();

  // console.log(store.getState("selectedConsumption"), store.getState("selectedConsumption-2"), store.getState("selectedConsumption-3"))
  if (selectedMachine && store.getState("selectedConsumption") || (store.getState("selectedConsumption-2") && store.getState("selectedConsumption-3"))) {
    if(selectedOption === "cut-or-engrave") {
      $("#corrienteMax").text(Number(store.getState("selectedConsumption").corriente_maxima).toFixed(2) + "A")
      $("#potencia").text(Number(store.getState("selectedConsumption").potencia_kwh).toFixed(2) + "KWh")
    }
    if(selectedOption === "cut-and-engrave") {
      $("#corrienteMax").text(Number(store.getState("selectedConsumption-2").corriente_maxima).toFixed(2) + "A")
      $("#corrienteMax-engrave").text(Number(store.getState("selectedConsumption-3").corriente_maxima).toFixed(2) + "A")
      $("#potencia").text(Number(store.getState("selectedConsumption-2").potencia_kwh).toFixed(2) + "KWh")
      $("#potencia-engrave").text(Number(store.getState("selectedConsumption-3").potencia_kwh).toFixed(2) + "KWh")
    }
  }

  let totalHours = 0
  if(selectedOption === "cut-or-engrave") {
    const horasTrabajoMaquina = parseFloat($("#horasTrabajoMaquina").val())
    totalHours = horasTrabajoMaquina
    // console.log("El consumo seleccionado es: ", store.getState("selectedConsumption"))
    calculateExpenses({
      consumption: store.getState("selectedConsumption"),
      charge: selectedCharge,
      workHours: horasTrabajoMaquina / 60,
      rateFlag,
      stateKey: "totalConsumptionKWh"
    });
    document.querySelector("#row-corriente-engrave").style.display = "none"
    document.querySelector("#row-potencia-engrave").style.display = "none"
    document.querySelector("#corrienteMax").parentElement.firstElementChild.innerText = "Corriente máxima"
    document.querySelector("#potencia").parentElement.firstElementChild.innerText = "Potencia"
  }
  if(selectedOption === "cut-and-engrave") {
    const horasTrabajoMaquina2 = parseFloat($("#horasTrabajoMaquina-2").val())
    const horasTrabajoMaquina3 = parseFloat($("#horasTrabajoMaquina-3").val())
    totalHours = horasTrabajoMaquina2 + horasTrabajoMaquina3
    calculateExpenses({
      consumption: store.getState("selectedConsumption-2"),
      charge: selectedCharge,
      workHours: horasTrabajoMaquina2 / 60,
      rateFlag,
      stateKey: "totalConsumptionKWh-2"
    })
    calculateExpenses({
      consumption: store.getState("selectedConsumption-3"),
      charge: selectedCharge,
      workHours: horasTrabajoMaquina3 / 60,
      rateFlag,
      stateKey: "totalConsumptionKWh-3"
    })
    document.querySelector("#row-corriente-engrave").removeAttribute("style")
    document.querySelector("#row-potencia-engrave").removeAttribute("style")
    document.querySelector("#corrienteMax").parentElement.firstElementChild.innerText = "Corriente eléctrica para el corte"
    document.querySelector("#potencia").parentElement.firstElementChild.innerText = "Potencia para el corte"
  }

  calculateUtility(totalHours);

  const totalPowerKWh = (selectedOption === "cut-or-engrave") 
    ? (store.getState("selectedConsumption").potencia / 1000) 
    : (parseFloat(store.getState("selectedConsumption-2").potencia / 1000) + parseFloat(store.getState("selectedConsumption-2").potencia / 1000) ) 

  // console.log("La potencia total es de: ", totalPowerKWh)

  let header = `
        <tr>
          <th scope="col" colspan="50%"><strong>Concepto</strong></th>
          <th scope="col" colspan="50%"><strong>Costo (MXN)</strong></th>
        </tr>`;
        
  let totalKWh = (
    totalPowerKWh *
    totalHours
  ).toFixed(2);
  if (parseFloat(totalKWh) > parseFloat(selectedRate.uso_dac) && rateFlag === 0) {
    sendMessageToastToParent("warning", "La cuota de electricidad excede la categoría hogar, seleccione una región")
    document.querySelector("#collapseThree").classList.add("show")
    $("#dac").css("background-color", "#757575");
    $("#hogar").css("background-color", "#DBDBDB");
    $("#cargosContainer").css("display", "block");
    $("#cargoCustomContainer").css("display", "none");
    store.setState("rateFlag", 1);
    return;
  }
  // If selectedOption is cut-and-engrave, we need to add the cost of engrave
  let totalConsumptionKWh = null
  // console.log("El consumo total es: ", totalConsumptionKWh)
  if(selectedOption === "cut-and-engrave") {
    // console.log("El consumo total de electricidad es 1: ", store.getState("totalConsumptionKWh"))
    totalConsumptionKWh = (parseFloat(store.getState("totalConsumptionKWh-2")) + parseFloat(store.getState("totalConsumptionKWh-3"))).toFixed(2)
  } else if(selectedOption === "cut-or-engrave") {
    // console.log("El consumo total de electricidad es 2: ", store.getState("totalConsumptionKWh"))
    totalConsumptionKWh = parseFloat(store.getState("totalConsumptionKWh"))
  }
  // console.log("El total consumption is: totalConsumptionKWh", totalConsumptionKWh)
  const totalCost = (parseFloat($("#costoPedazoDesign").val()) + parseFloat(totalConsumptionKWh) + store.getState("costPerWorkerPerPiece") + parseFloat(store.getState("costDACPerDesign"))).toFixed(2);
  // console.log("El costo total es de: ", totalCost)

  //obtener precio del producto a publico con la utilidad
  if($('#porcentaje-utilidad').hasClass("active") === true) {

    // define el precio del valor de la pieza a venta a publico y lo guarda en la store
    const valuePerPiece = (((parseFloat($("#valuePerPieceByPercente").val()) / 100) + 1) * totalCost).toFixed(2);
    store.setState("valuePerPieceByPercente", (valuePerPiece));

    // valores se traen de la store para poder realizar las operaciones
    const numeroPedazosDesign = Math.floor(parseFloat($("#numeroPedazosDesign").val()))
    const priceMachine = store.getState("selectedMachine").precio_shopify
    const utilityPerDesign = (valuePerPiece - totalCost) < 0 || !(valuePerPiece - totalCost) ? 'No hay utilidad' : (valuePerPiece - totalCost).toFixed(2);
    const totalUtility = (utilityPerDesign * numeroPedazosDesign) < 0 || !(utilityPerDesign * numeroPedazosDesign) ? 'Revise sus datos' : (utilityPerDesign * numeroPedazosDesign).toFixed(2);
    const roiPieces = Math.ceil(priceMachine / utilityPerDesign) < 1 || !(priceMachine / utilityPerDesign) ? '- - -' : Math.ceil(priceMachine / utilityPerDesign);

    store.setState("utilityPerPiece", (utilityPerDesign));
    store.setState("totalUtility", (totalUtility));
    store.setState("roiPieces", (roiPieces));
  }

  let energy = `
        <tr>
          <th colspan="50%">Costo por pieza</th>
          <td colspan="50%">$ ${parseFloat($("#costoPedazoDesign").val()).toFixed(2)}</td>
        </tr>
        ${(store.getState("DACFixedPrice") === 0) ? "" : `
          <tr>
            <th colspan="50%">Costo de tarifa DAC por pieza <img data-bottom id="popover-39"
            src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
            <td>$ ${store.getState("costDACPerDesign")}</td>
          </tr>
        `}
        <tr>
          <th colspan="50%">Costo de electricidad</th>
          <td colspan="50%">$ ${totalConsumptionKWh}</td>
          </tr>
        <tr>
          <th colspan="50%">Costo del operador</th>
          <td colspan="50%">$ ${store.getState("costPerWorkerPerPiece").toFixed(2)}</td>
        </tr>
        <tr>
          <th colspan="50%"><strong>Costo total por pieza</storng></th>
          <th colspan="50%"><strong>$ ${totalCost}</strong></th>
        </tr>
        ${(store.getState("DACFixedPrice") === 0) ? "" : `
        <tr>
          <th colspan="100%" class="txt-red" style="text-align: center;">Otros gastos asociados</td>
        </tr>
        <tr>
          <th colspan="50%">Costo de energía <img data-bottom id="popover-16"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td colspan="50%">$ ${store.getState("DACFixedPrice")}</td>
        </tr>
        `}
        <tr>
          <th colspan="100%" style="text-align: center; color: green;">Retorno de la inversión</td>
        </tr>
        <tr>
          <th colspan="50%">Precio del producto</th>
          <th colspan="50%">$ ${($('#porcentaje-utilidad').hasClass("active") === false) ? store.getState("valuePerPiece") : store.getState("valuePerPieceByPercente")}</th>
        </tr>
        <tr>
          <th colspan="50%">Utilidad por pieza <img data-bottom id="popover-17"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td colspan="50%">$ ${store.getState("utilityPerPiece")}</td>
        </tr>
        <tr>
          <th colspan="50%">Utilidad total <img data-bottom data-bottom id="popover-18"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td colspan="50%">$ ${store.getState("totalUtility")}</td>
        </tr>
        <tr>
          <th colspan="50%"><strong>Piezas a vender para recuperar la inversión de la máquina</storng></th>
          <th colspan="50%"><strong>${store.getState("roiPieces")}</strong></th>
        </tr>
        `;

  $("#listaConsumos").html(header + energy);

  $("#gastosContainer").css("display", "block");
  $("#results-table").css("display", "block");
  document.querySelector("#results-table").classList.add("show")
  sendMessageToastToParent("success", "Se ha calculado el retorno de inversión exitosamente!")
  // toastr["success"]("Se ha calculado el retorno de inversión exitosamente!");
  $("html").animate(
    {
      scrollTop: $("#results-table").offset().top,
    },
    100
  );
  calculatedROI = true
  storeHistoryCalculator()
  createPopOver()
}

// Detect if #btn-options-machine-container is clicked and then get id of clicked element and validate if element clicked is cut or engrave or cut-and-engrave
function changedOptionsMachineContainer(target) {
  selectedOption = target.id;
  if (selectedOption === "cut-or-engrave") {
    document.querySelector("#cut-and-engrave").classList.remove("active");
    document.querySelector("#cut-and-engrave").removeAttribute("style");
    target.classList.add("active")
    document.querySelector("#row-cut-and-engrave").setAttribute("style", "display: none;")
    document.querySelector("#row-cut-or-engrave").removeAttribute("style")
    $("#listaConsumosSelect").empty()
    $("#listaConsumosSelect-2").empty()
    $("#listaConsumosSelect-3").empty()
    $("#listaConsumosSelect").removeClass("no-validate")
    $("#listaConsumosSelect-2").addClass("no-validate")
    $("#listaConsumosSelect-3").addClass("no-validate")
    $("#horasTrabajoMaquina-2").addClass("no-validate")
    $("#horasTrabajoMaquina-3").addClass("no-validate")
    displaySelects({
      tagId: "listaConsumosSelect",
      options: store.getState("consumptions"),
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    })
  } else if (selectedOption === "cut-and-engrave") {
    document.querySelector("#cut-or-engrave").classList.remove("active")
    document.querySelector("#cut-or-engrave").removeAttribute("style")
    target.classList.add("active")
    document.querySelector("#row-cut-or-engrave").setAttribute("style", "display: none;")
    document.querySelector("#row-cut-and-engrave").removeAttribute("style")
    $("#listaConsumosSelect").empty()
    $("#listaConsumosSelect-2").empty()
    $("#listaConsumosSelect-3").empty()
    $("#listaConsumosSelect").addClass("no-validate")
    $("#horasTrabajoMaquina").addClass("no-validate")
    $("#listaConsumosSelect-2").removeClass("no-validate")
    $("#listaConsumosSelect-3").removeClass("no-validate")
    displaySelects({
      tagId: "listaConsumosSelect-2",
      options: store.getState("consumptions"),
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    })
    displaySelects({
      tagId: "listaConsumosSelect-3",
      options: store.getState("consumptions"),
      value: "id_consumo",
      text: "porcentaje_trabajo",
      decorator: "%",
    })
    // Remove "no-validate" class to listaConsumosSelect-2 and listaConsumosSelect-3
  }
}

// hace correr la funcion cuando el dom inicia para que se seleccione la primera opcion
let selectedPriceOption = 'precio-producto-publico'
$( document ).ready(function() {
  changedOptionsProductPrice();
});
// Detect if #btn-options-precio-producto is clicked and then get id of clicked element and validate if element clicked is cut or precio-producto-publico or porcentaje-utilidad
function changedOptionsProductPrice(target) {
  let selectedPriceOption = (target) ? target.id : 'precio-producto-publico'
  if (selectedPriceOption === "precio-producto-publico") {
    $('#precio-producto-publico').addClass("active")
    $('#porcentaje-utilidad').removeClass("active")
    // agregar estilo cuando es seleccionado
    document.querySelector("#precio-producto-publico").setAttribute("style", "color: #fdfdfd; background-color: rgb(117, 117, 117);")
    document.querySelector("#porcentaje-utilidad").setAttribute("style", "color: #000d; background-color: #dbdbdb;")
    // desaparecer los inputs que no se requieren cuando se selecciona la otra opcion por utilidad
    document.querySelector("#producto-por-utilidad").setAttribute("style", "display: none;")
    document.querySelector("#producto-por-precio").removeAttribute("style");
    document.querySelector("#producto-por-precio").setAttribute("style", "display: block")

  } else if (selectedPriceOption === "porcentaje-utilidad") {  
    $('#porcentaje-utilidad').addClass("active")
    $('#precio-producto-publico').removeClass("active") 
    // agregar estilo cuando es seleccionado
    document.querySelector("#porcentaje-utilidad").setAttribute("style", "color: #fdfdfd; background-color: rgb(117, 117, 117);")
    document.querySelector("#precio-producto-publico").setAttribute("style", "color: #000d; background-color: #dbdbdb;")
    // desaparecer los inputs que no se requieren cuando se selecciona la otra opcion por precio
    document.querySelector("#producto-por-precio").setAttribute("style", "display: none;")
    document.querySelector("#producto-por-utilidad").removeAttribute("style");
    document.querySelector("#producto-por-utilidad").setAttribute("style", "display: block;")
  }
}

document.querySelector("#btn-options-machine-container").addEventListener("click", e => {
  changedOptionsMachineContainer(e.target);
})

document.querySelector("#btn-options-precio-producto").addEventListener("click", e => {
  console.log('hola')
  changedOptionsProductPrice(e.target);
})