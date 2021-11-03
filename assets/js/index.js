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
  if (!productos.error) {
    store.setState("machines", productos);
    productos.forEach(val => val.size = val.corte_ancho * val.corte_largo)
    displaySelects({
      tagId: "listaMaquinasSelect",
      options: productos.sort((a, b) => a.size - b.size),
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
    const widthLeaf = $(this).val();
    store.setState("widthLeaf", widthLeaf);
    const totalChunks = store.calculateChunks();
    $("#numeroPedazos").val(totalChunks).trigger("change");
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
  });

  $("#largeLeaf").on("input", function () {
    const largeLeaf = $(this).val();
    store.setState("largeLeaf", largeLeaf);
    const totalChunks = store.calculateChunks();
    $("#numeroPedazos").val(totalChunks).trigger("change");
    const costPerChunk = store.calculateCostPerChunkLeaf();
    $("#costoPedazo").val(costPerChunk?.toString()).trigger("change");
  });

  $("#widthLeafDesign").on("input", function () {
    store.setState("widthLeafDesign", parseFloat($(this).val()))
    $("#numeroPedazosDesign").val(store.calculateDesignChunks())
    $("#costoPedazoDesign").val(store.calculateCostDesignChunk())
  })

  $("#largeLeafDesign").on("input", function () {
    store.setState("largeLeafDesign", parseFloat($(this).val()))
    $("#numeroPedazosDesign").val(store.calculateDesignChunks())
    $("#costoPedazoDesign").val(store.calculateCostDesignChunk())
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

  $("#currentUserConsumption").on('focusout', function() {
    const currentValueKWh = parseFloat(document.querySelector("#currentValueKWh").value)
    const lastValueKWh = parseFloat(document.querySelector("#lastValueKWh").value)
    if (!Number.isInteger(parseInt(currentValueKWh)) || !Number.isInteger(parseInt(lastValueKWh))) return
    document.querySelector("#currentUserConsumption").value = currentValueKWh - lastValueKWh
  })

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
    // const imgContainer = document.querySelector("#img-container")
    if (selectedMach) {
      sendImgMachineToParent(selectedMach.imgurls)
      // document.querySelector("#img-machine").setAttribute("src", selectedMach.imgurls)
      // imgContainer.style.display = "block"
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
    if (invalidFields) return sendMessageToastToParent("error", "Ha ingresado datos erroneos!")
    handleCalculator()
  });

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
      Number.isInteger(inputValueNumber)
    ) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
    if (inputId === "largeLeafDesign" && Number.isInteger(inputValueNumber)) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
    if (inputId === "valuePerPiece" && Number.isInteger(inputValueNumber)) {
      $(this).removeClass("is-invalid")
      $(this).addClass("is-valid")
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
    if (selectId === "type-material" && selectValue) {
      $(this).removeClass("is-invalid");
      $(this).addClass("is-valid");
    }
  });

  // Prevent -, + and e fields and allowed only positive numbers included decimals
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
    const materialCost = parseFloat($("#costoInput").val())
    const costPerHourWorker = parseFloat($("#costoHoraOperador").val())
    const totalConsumptionKWh = store.getState("totalConsumptionKWh")
    const valuePerPiece = parseFloat(store.getState("valuePerPiece"))
    const costPerPiece = parseFloat($("#costoPedazoDesign").val())
    const numeroPedazosDesign = parseFloat($("#numeroPedazosDesign").val())
    const priceMachine = store.getState("selectedMachine").precio_shopify
    const costPerWorkerPiece = ((costPerHourWorker || 0) * (totalHoursMachinePerDesign || 0)) || 0
    store.setState("costPerWorkerPerPiece", costPerWorkerPiece)
    const totalCostPerDesign = costPerPiece + totalConsumptionKWh + costPerWorkerPiece
    const utilityPerDesign = valuePerPiece - totalCostPerDesign
    const totalUtility = utilityPerDesign * numeroPedazosDesign
    const roiPieces = priceMachine / utilityPerDesign

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
      machine: selectedMachine,
      consumption: selectedConsumption,
      rate: selectedRate,
      charge: selectedCharge,
      workHours,
      rateFlag,
    });

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
      // toastr["warning"]("La cuota de electricidad excede la categoría hogar, seleccione una región");
      document.querySelector("#collapseThree").classList.add("show")
      $("#dac").css("background-color", "#757575");
      $("#hogar").css("background-color", "#DBDBDB");
      $("#cargosContainer").css("display", "block");
      $("#cargoCustomContainer").css("display", "none");
      store.setState("rateFlag", 1);
      return;
    }
    const totalCost = (parseFloat($("#costoPedazoDesign").val()) + store.getState("totalConsumptionKWh") + store.getState("costPerWorkerPerPiece") + parseFloat(store.getState("DACFixedPrice"))).toFixed(2)
    let energy = `
        <tr>
          <th colspan="50%">Costo por pieza</th>
          <td colspan="50%">$ ${parseFloat($("#costoPedazoDesign").val())}</td>
        </tr>
        ${(store.getState("DACFixedPrice") === 0) ? "" : `
        <tr>
          <th colspan="50%">Tarifa fija de electricidad DAC <img id="popover-16"
          src="./assets/icons/question-mark.svg" style="width: 15px; height: 15px;"></th>
          <td>$ ${store.getState("DACFixedPrice")}</td>
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
});



document.querySelector("#generate-pdf").addEventListener("click", generatePdf)