$(async function () {
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
  console.log("Productos: ", productos);
  if (!productos.error) {
    store.setState("machines", productos);
    displaySelects({
      tagId: "listaMaquinasSelect",
      options: productos,
      value: "id_producto",
      text: "nombre_producto",
    });
  }
  // ========================== End Calling APIs ========================== //

  // ========================== Handlers ========================== //
  $("#costoInput").on("input", function () {
    store.setState("totalCost", parseFloat($(this).val()));
    if (!store.getState("selectedMachine") || !store.getState("widthLeaf") || !store.getState("largeLeaf"))
      return;
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
  });

  $("#widthLeaf").on("input", function () {
    console.log(
      "----------------------------------> Este es el ancho de la hoja"
    );
    const widthLeaf = $(this).val();
    store.setState("widthLeaf", widthLeaf);
    const totalChunks = store.calculateChunks();
    $("#numeroPedazos").val(totalChunks).trigger("change");
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
  });

  $("#largeLeaf").on("input", function () {
    console.log(
      "----------------------------------> Este es el largo de la hoja"
    );
    const largeLeaf = $(this).val();
    store.setState("largeLeaf", largeLeaf);
    const totalChunks = store.calculateChunks();
    $("#numeroPedazos").val(totalChunks).trigger("change");
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
  });

  $("#hogar").on("click", function () {
    $(this).css("background-color", "#757575");
    $("#dac").css("background-color", "#DBDBDB");
    $("#cargosContainer").css("display", "none");
    $("#cargoCustomContainer").css("display", "block");
    store.setState("rateFlag", 0);
    if(calculatedROI) listRatesHomeSelect()
  });

  $("#dac").on("click", function () {
    $(this).css("background-color", "#757575");
    $("#hogar").css("background-color", "#DBDBDB");
    $("#cargosContainer").css("display", "block");
    $("#cargoCustomContainer").css("display", "none");
    store.setState("rateFlag", 1);
    if(calculatedROI) listDacSelect()
  });

  $("#listaTarifaHogarSelect").on("change", listRatesHomeSelect);

  async function listRatesHomeSelect() {
    $("#listaCargoSelect").empty();
    
    let cargos = await getChargesByRegion(this.value);
    store.setState("charges", sortByMonth(cargos));
    store.selectHomeRate(this.value);
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

  $("#listaMaquinasSelect").on("change", async function () {
    $("#listaConsumosSelect").empty();
    const consumos = await getConsumptionsByProduct(this.value);
    store.setState("consumptions", consumos);
    store.selectMachine(this.value);

    if (!consumos.error) {
      displaySelects({
        tagId: "listaConsumosSelect",
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
    if(selectedMach) {
      document.querySelector("#form-parent-container").style.width = "70%"
      document.querySelector("#img-container").style.display = "block"
      document.querySelector("#img-machine").setAttribute("src", selectedMach.imgurls)
    } else {
      document.querySelector("#img-container").style.display = "none"
      document.querySelector("#form-parent-container").style.width = "100%"
    }
  });

  $("#listaConsumosSelect").on("change", function () {
    store.selectConsumption(this.value);
  });

  $("#valuePerPiece").on("input", function () {
    // store.setState(this.value);
    const valueNumber = this.value;
    if (Number.isNaN(valueNumber)) return;
    store.setState("valuePerPiece", parseFloat(this.value).toFixed(2));
  });

  $("#pagoMensuOperador").on("input", function () {
    $("#costoHoraOperador")
      .val(
        $("#horasTrabajoOperador").val() && $(this).val()
          ? ($(this).val() / $("#horasTrabajoOperador").val()).toFixed(2)
          : null
      )
      .trigger("change");
  });
  $("#horasTrabajoOperador").on("input", function () {
    $("#costoHoraOperador")
      .val(
        $("#pagoMensuOperador").val() && $(this).val()
          ? ($("#pagoMensuOperador").val() / $(this).val()).toFixed(2)
          : null
      )
      .trigger("change");
  });

  $("#calcular").on("click", function () {
    const invalidFields = areInvalidFields();
    if (invalidFields) return toastr["error"]("Ha ingresado datos erroneos!");
    const {
      selectedMachine,
      selectedConsumption,
      selectedRate,
      selectedCharge,
      rateFlag,
    } = store.getState();

    if (selectedMachine && selectedConsumption) {
      $("#corrienteMax").text(selectedConsumption.corriente_maxima + "A");
      $("#voltaje").text(selectedConsumption.voltaje + "V");
      $("#potencia").text(selectedConsumption.potencia_kwh + "KWh");
      $("#precio").text(
        numberFormat.format(selectedMachine.precio_shopify) + " MXN"
      );
    }
    let workHours = $("#horasTrabajoMaquina").val();
    let workDays = $("#diasTrabajoMaquina").val();

    const cargosData = calculateExpenses({
      machine: selectedMachine,
      consumption: selectedConsumption,
      rate: selectedRate,
      charge: selectedCharge,
      workHours,
      workDays,
      rateFlag,
    });
    calculateUtility(workHours, workDays);

    let header = `<tr>
            <th scope="col">Concepto</th>
            <th scope="col">Lectura Actual</th>
            <th scope="col">Precio(MXN)</th>
            <th scope="col">Total Periodo(KWh)</th>
            <th scope="col">Subtotal(MXN)</th>
        </tr>`;
    let totalKWh = (
      selectedConsumption.potencia_kwh *
      workHours *
      workDays
    ).toFixed(2);
    console.log("TOTAL KWH: ", parseFloat(totalKWh))
    console.log("SELECTED RATE: ", parseFloat(selectedRate.uso_dac))
    console.log("RATE FLAG: ", rateFlag)
    if (parseFloat(totalKWh) > parseFloat(selectedRate.uso_dac) && rateFlag === 0) {
      toastr["warning"]("La cuota de electricidad excede la categoría hogar, seleccione una región");
      document.querySelector("#collapseThree").classList.add("show")
      $("#dac").css("background-color", "#757575");
      $("#hogar").css("background-color", "#DBDBDB");
      $("#cargosContainer").css("display", "block");
      $("#cargoCustomContainer").css("display", "none");
      store.setState("rateFlag", 1);
      return;
    }
    let energy = `<tr>
            <th scope="col">Energía (KWh)</th>
            <td colspan="4">${totalKWh}</td>
        </tr>`;

    $("#listaConsumos").html(header + energy + cargosData);

    $("#gastosContainer").css("display", "block");
    $("#results-table").css("display", "block");
    document.querySelector("#results-table").classList.add("show")
    toastr["success"]("Se ha calculado el retorno de inversión exitosamente!");
    $("html").animate(
      {
        scrollTop: $("#results-table").offset().top,
      },
      100
    );
    calculatedROI = true
  });

  $(".form-input").on("keyup", function () {
    const inputValue = $(this).val();
    const inputId = $(this).attr("id");
    const inputValueNumber = parseInt(inputValue);
    $(this).addClass("is-invalid");
    if (
      inputId === INPUT_ID_HOURS_PER_DAY_MACHINE &&
      Number.isInteger(inputValueNumber) &&
      inputValueNumber >= 1 &&
      inputValueNumber <= 24
    ) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
    if (
      inputId === INPUT_ID_DAY_WORK_MACHINE &&
      Number.isInteger(inputValueNumber) &&
      inputValueNumber >= 1
    ) {
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
    if (
      inputId === INPUT_ID_MONTHLY_PAYMENT &&
      Number.isInteger(inputValueNumber) &&
      inputValueNumber >= 1
    ) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
    if (
      inputId === INPUT_ID_MONTHLY_HOURS &&
      Number.isInteger(inputValueNumber) &&
      inputValueNumber >= 1 &&
      inputValueNumber <= 720
    ) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
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
  });

  // Prevent -, + and e fields and allowed only positive numbers included decimals
  $("input[type=number]").keypress(function (e) {
    var txt = String.fromCharCode(e.which);
    if (!txt.match(/[0-9]/)) {
      return false;
    }
  });

  function areInvalidFields() {
    const rateFlag = store.getState("rateFlag");
    const formFields = document.querySelectorAll(".form-input");
    let invalidValues = false;
    let showedAccordion = false;
    for (const form of formFields) {
      if (rateFlag === 0 && form.id === SELECT_ID_RATE_DAC_LIST) continue;
      if (
        rateFlag === 1 &&
        (form.id === SELECT_ID_RATE_CFE || form.id === SELECT_ID_RATE_MONTHLY)
      )
        continue;
      if (form.value !== "") {
        form.classList.remove("is-invalid");
        continue;
      }
      if (!showedAccordion) {
        const collapseParent = getParentAccordion(form);
        showedAccordion = true;
        collapseParent.classList.add("show");
      }
      form.classList.add("is-invalid");
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

  function calculateUtility(workHouws, workDays) {
    const totalHours = workHouws * workDays;
    const materialCost = parseFloat($("#costoInput").val());
    const costPerHourWorker = parseFloat($("#costoHoraOperador").val());
    const numChunks = parseInt($("#numeroPedazos").val());
    const totalConsumptionKWh = store.getState("totalConsumptionKWh");
    const valuePerPiece = parseFloat(store.getState("valuePerPiece"));
    // This is the TOTAL cost in hours
    console.log("totalHours: ", totalHours)
    const totalCost = materialCost + totalConsumptionKWh + (costPerHourWorker * totalHours);
    console.log("totalCost: ", totalCost)
    // This is the cost per one hour of work including; material cost, total electricity consumption and all operator hours worked
    const totalCostPerHour = totalCost / totalHours; // Cost one hour
    console.log("totalCostPerHour: ", totalCostPerHour)
    // We divide the totalHours of machine work (totalHours) / num of pieces (numChunks)
    const hoursPerChunk = totalHours / numChunks
    console.log("hoursPerChunk: ", hoursPerChunk)
    const utilityPerPiece = valuePerPiece - (hoursPerChunk * totalCostPerHour);
    console.log("utilityPerPiece: ", utilityPerPiece)
    // const totalUtility = (valuePerPiece * numChunks) - totalCost;
    const totalUtility = utilityPerPiece * numChunks
    console.log("totalUtility: ", totalUtility)
    const priceMachine = store.getState("selectedMachine").precio_shopify
    console.log("Precio de la máquina", priceMachine)
    const roiPieces = priceMachine / utilityPerPiece
    // console.log(
    //   "================================================================================="
    // );
    // console.log("Horas totales: ", totalHours);
    // console.log("Costo por hora del trabajador: ", costPerHourWorker);
    // console.log("Consumo total: ", totalConsumptionKWh);
    // console.log("Utilidad total: ", totalUtility.toFixed(2));
    // console.log("Utilidad por pieza: ", utilityPerPiece.toFixed(2));
    // console.log("Costo por hora: ", totalCostPerHour.toFixed(2));
    // console.log("Costo por mes: ", totalCostPerMonth.toFixed(2));
    // console.log(
    //   "================================================================================="
    // );
    $("#totalUtility").val(totalUtility.toFixed(2)).trigger("change");
    $("#utilityPerPiece").val(utilityPerPiece.toFixed(2)).trigger("change");
    $("#roiPieces").val(roiPieces >= 0 ? roiPieces.toFixed(2) : 0).trigger("change");
  }
  // ========================== End Handlers ========================== //
});
