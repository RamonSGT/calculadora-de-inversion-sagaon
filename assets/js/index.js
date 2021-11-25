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

let calculatedROI = false
$(async function () {

  $("#hogar").css("background-color", "#757575");
  $("#cargosContainer").css("display", "none");

  // ========================== Calling APIs ========================== //
  const tarifasHogar = await getRates("HOGAR");

  if (!tarifasHogar.error) {
    store.setState("homeRates", tarifasHogar);
    displaySelects({
      tagId: "listaTarifaHogarSelect",
      options: tarifasHogar,
      value: "id_tarifa",
      text: "id_tarifa",
    });
  }

  const tarifasDAC = await getRates("DAC");

  if (!tarifasDAC.error) {
    store.setState("DACRates", tarifasDAC);
    displaySelects({
      tagId: "listaTarifaDACSelect",
      options: tarifasDAC,
      value: "id_tarifa",
      text: "id_tarifa",
    });
  }

  const productos = await getProducts();
  if (!productos.error) {
    store.setState("machines", productos);
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
function calculatorCalls() {
  calculateCostInput(document.getElementById(INPUT_ID_COST_TOTAL_LEAF))
  calculateRawMaterialData(document.getElementById(INPUT_ID_WIDTH_LEAF), "widthLeaf")
  calculateRawMaterialData(document.getElementById(INPUT_ID_LARGE_LEAF), "largeLeaf")
  calculatePieces(document.getElementById(INPUT_ID_MONTHLY_PAYMENT), "monthlyPayment")
  calculatePieces(document.getElementById(INPUT_ID_MONTHLY_HOURS), "monthlyHours")
  averageConsumption()
}

$("#costoInput").on("input", function (e) {
  calculateCostInput(e.target)
});

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
  $("#dac").css("background-color", "#DBDBDB");
  $("#cargosContainer").css("display", "none");
  $("#cargoCustomContainer").css("display", "block");
  store.setState("rateFlag", 0);
  if (calculatedROI) listRatesHomeSelect()
});

$("#dac").on("click", function () {
  $(this).css("background-color", "#757575");
  $("#hogar").css("background-color", "#DBDBDB");
  $("#cargosContainer").css("display", "block");
  $("#cargoCustomContainer").css("display", "none");
  store.setState("rateFlag", 1);
  if (calculatedROI) listDacSelect()
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

$("#listaMaquinasSelect").on("change", e => changedSelectedMachine(e.target));

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
  }

  const totalChunks = store.calculateChunks();
  $("#numeroPedazos").val(totalChunks).trigger("change");
  const costPerChunk = store.calculateCostPerChunkLeaf();
  $("#costoPorHojaInput").val(costPerChunk).trigger("change");
  $("#costoPedazo").val(costPerChunk).trigger("change");
  const selectedMach = store.getState("selectedMachine")
  if (selectedMach) {
    sendImgMachineToParent(selectedMach.imgurls)
  }
}

$("#listaConsumosSelect").on("change", function () {
  store.selectConsumption(this.value);
});

$("#listaConsumosSelect-2").on("change", averageConsumption)
$("#listaConsumosSelect-3").on("change", averageConsumption)

function averageConsumption() {
  const currentConsumption2 = $("#listaConsumosSelect-2").val()
  const currentConsumption3 = $("#listaConsumosSelect-3").val()
  if(!currentConsumption2 || !currentConsumption3) return
  const lista2 = store.selectConsumption(currentConsumption2)
  const lista3 = store.selectConsumption(currentConsumption3)
  if(!lista2 || !lista3) return
  store.setState("selectedConsumption", {
    id_consumo: lista2.id_consumo + " - " + lista3.id_consumo,
    corriente_maxima: (lista2.corriente_maxima + lista3.corriente_maxima) / 2,
    porcentaje_trabajo: (lista2.porcentaje_trabajo + lista3.porcentaje_trabajo) / 2,
    potencia: (lista2.potencia + lista3.potencia) / 2,
    potencia_kwh: (lista2.potencia_kwh + lista3.potencia_kwh) / 2,
    voltaje: (lista2.voltaje + lista3.voltaje) / 2,
  })
}

$("#valuePerPiece").on("input", function () {
  const valueNumber = this.value;
  if (Number.isNaN(valueNumber)) return;
  store.setState("valuePerPiece", parseFloat(this.value).toFixed(2));
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
  if (invalidFields) return sendMessageToastToParent("error", "Ha ingresado datos erroneos!")
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

function calculateUtility(totalHoursMachinePerDesign) {
  // Primero obtenemos todos los datos necesarios para realizar el cálculo
  const costPerHourWorker = parseFloat($("#costoHoraOperador").val())
  const totalConsumptionKWh = store.getState("totalConsumptionKWh")
  const valuePerPiece = parseFloat(store.getState("valuePerPiece"))
  const costPerPiece = parseFloat($("#costoPedazoDesign").val())
  const numeroPedazosDesign = parseFloat($("#numeroPedazosDesign").val())
  const priceMachine = store.getState("selectedMachine").precio_shopify

  // Si no valor en el campo del trabajador, entonces ponemos por default el 0. Hay redundancia en el valor por si el resultabo obtenido es NaN.
  const costPerWorkerPiece = ((costPerHourWorker || 0) * (totalHoursMachinePerDesign || 0)) || 0
  store.setState("costPerWorkerPerPiece", costPerWorkerPiece)
  // Se suma el costo del pedazo, además del consumo electrico y el costo del trabajador
  console.log("El costo de una pieza por el salario es", costPerWorkerPiece)
  const totalCostPerDesign = costPerPiece + totalConsumptionKWh + costPerWorkerPiece
  // Se resta el valor de una
  const utilityPerDesign = valuePerPiece - totalCostPerDesign
  const totalUtility = utilityPerDesign * numeroPedazosDesign
  const roiPieces = priceMachine / utilityPerDesign
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

  $("#totalUtility").val(totalUtility.toFixed(2)).trigger("change");
  $("#utilityPerPiece").val(utilityPerDesign.toFixed(2)).trigger("change");
  $("#roiPieces").val(roiPieces >= 0 ? roiPieces.toFixed(2) : 0).trigger("change");
}

// ========================== End Handlers ========================== //
function handleCalculator() {
  const {
    selectedMachine,
    selectedConsumption,
    selectedRate,
    selectedCharge,
    rateFlag,
  } = store.getState();

  if (selectedMachine && selectedConsumption) {
    $("#corrienteMax").text(Number(selectedConsumption.corriente_maxima).toFixed(2) + "A");
    $("#voltaje").text(selectedConsumption.voltaje + "V");
    $("#potencia").text(Number(selectedConsumption.potencia_kwh).toFixed(2) + "KWh");
    $("#precio").text(numberFormat.format(selectedMachine.precio_shopify) + " MXN");
  }
  let workHours = $("#horasTrabajoMaquina").val();
  workHours = parseFloat(workHours) / 60 // De minutos a horas

  const cargosData = calculateExpenses({
    consumption: selectedConsumption,
    charge: selectedCharge,
    workHours,
    rateFlag,
  });
  calculateExpenses({
    consumption: selectedConsumption,
    charge: selectedCharge,
    workHours,
    rateFlag,
  })

  calculateUtility(workHours);

  let header = `
        <tr>
          <th scope="col" colspan="50%"><strong>Concepto</strong></th>
          <th scope="col" colspan="50%"><strong>Costo (MXN)</strong></th>
        </tr>`;
  let totalKWh = (
    selectedConsumption.potencia_kwh *
    workHours
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
  const totalCost = (parseFloat($("#costoPedazoDesign").val()) + store.getState("totalConsumptionKWh") + store.getState("costPerWorkerPerPiece") + parseFloat(store.getState("costDACPerDesign"))).toFixed(2);
  let energy = `
        <tr>
          <th colspan="50%">Costo por pieza</th>
          <td colspan="50%">$ ${parseFloat($("#costoPedazoDesign").val()).toFixed(2)}</td>
        </tr>
        ${(store.getState("DACFixedPrice") === 0) ? "" : `
          <tr>
            <th colspan="50%">Costo de tarifa DAC por pieza <img id="popover-16"
            src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
            <td>$ ${store.getState("costDACPerDesign")}</td>
          </tr>
        `}
        <tr>
          <th colspan="50%">Costo de electricidad</th>
          <td colspan="50%">$ ${store.getState("totalConsumptionKWh")}</td>
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
          <th colspan="50%">Costo de energía</th>
          <td colspan="50%">$ ${store.getState("DACFixedPrice")}</td>
        </tr>
        `}
        <tr>
          <th colspan="100%" style="text-align: center; color: green;">Retorno de la inversión</td>
        </tr>
        <tr>
          <th colspan="50%">Precio del producto</th>
          <th colspan="50%">$ ${$("#valuePerPiece").val()}</th>
        </tr>
        <tr>
          <th colspan="50%">Utilidad por pieza <img id="popover-17"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td colspan="50%">$ ${$("#utilityPerPiece").val()}</td>
        </tr>
        <tr>
          <th colspan="50%">Utilidad total <img id="popover-18"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td colspan="50%">$ ${$("#totalUtility").val()}</td>
        </tr>
        <tr>
          <th colspan="50%"><strong>Piezas a vender para recuperar la inversión de la máquina</storng></th>
          <th colspan="50%"><strong>${$("#roiPieces").val()}</strong></th>
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
let selectedOption = target.id;
function changedOptionsMachineContainer(target) {
  if (selectedOption === "cut-or-engrave") {
    document.querySelector("#cut-and-engrave").classList.remove("active");
    document.querySelector("#cut-and-engrave").removeAttribute("style");
    target.classList.add("active")
    target.setAttribute("style", "margin-bottom: 20px; background-color: rgb(117, 117, 117);")
    document.querySelector("#row-cut-and-engrave").setAttribute("style", "display: none;")
    document.querySelector("#row-cut-or-engrave").removeAttribute("style")
    $("#listaConsumosSelect").empty()
    $("#listaConsumosSelect-2").empty()
    $("#listaConsumosSelect-3").empty()
    $("#listaConsumosSelect").removeClass("no-validate")
    $("#listaConsumosSelect-2").addClass("no-validate")
    $("#listaConsumosSelect-3").addClass("no-validate")
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
    target.setAttribute("style", "background-color: rgb(117, 117, 117);")
    document.querySelector("#row-cut-or-engrave").setAttribute("style", "display: none;")
    document.querySelector("#row-cut-and-engrave").removeAttribute("style")
    $("#listaConsumosSelect").empty()
    $("#listaConsumosSelect-2").empty()
    $("#listaConsumosSelect-3").empty()
    $("#listaConsumosSelect").addClass("no-validate")
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


// function fieldsDesignDuration() {
//   if(selectedOption === "cut-or-engrave") {
//     const machineTime = parseInt(document.querySelector("#horasTrabajoMaquina").value)
//     const machineTimeInMinutes = ()
//   }
//   if(selectedOption === "cut-and-engrave") {
//     const machineTime2 = parseInt(document.querySelector("#horasTrabajoMaquina-2").value)
//     const machineTime3 = parseInt(document.querySelector("#horasTrabajoMaquina-3").value)
//   }
// }

document.querySelector("#btn-options-machine-container").addEventListener("click", e => {
  changedOptionsMachineContainer(e.target)
})