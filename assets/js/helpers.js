function displaySelects({ tagId, options, value = "", text, decorator = "" }) {
  $(`#${tagId}`).append(
    `<option 
            value="" 
            selected 
            class="select-init"
            disabled>
                Seleccionar opción
        </option>`
  );
  options.map((o) => {
    $(`#${tagId}`).append(
      `<option 
                value="${o[value]}"
            >
            ${o[text]}${decorator}
            </option>`
    );
  });
}

const options = { style: "currency", currency: "MXN" };
const numberFormat = new Intl.NumberFormat("es-MX", options);

function calculateExpenses({
  machine,
  consumption,
  rate,
  charge,
  rateFlag,
  workHours,
}) {
  let cargosHogarList = [
    "basico",
    "intermedio",
    "intermedio_alto",
    "excedente",
  ];
  let cargosDACList = ["fijo", "basico"];

  store.setState("DACFixedPrice", charge["fijo"])

  const consumptionClientKWh = parseFloat(document.querySelector("#currentUserConsumption").value)

  let totalKWh = ((consumption.potencia_kwh * workHours) + (consumptionClientKWh || 0)).toFixed(2);

  store.setState("totalConsumptionKWh", 0)
  if (!rateFlag) {
    const consumos = cargosHogarList.map((c) => {
      if (charge[c]) {
        let kwh_temp = totalKWh;
        totalKWh -= charge["kwh_" + c]
        totalKWh = totalKWh
        const totalPeriod = (totalKWh >= 0
          ? charge["kwh_" + c].toFixed(2)
          : kwh_temp > 0
            ? kwh_temp
            : 0)
        const subtotal = (totalKWh >= 0
          ? (charge["kwh_" + c] * charge[c]).toFixed(2)
          : kwh_temp > 0
            ? (kwh_temp * charge[c]).toFixed(2)
            : 0 * charge[c])

        store.setState("totalConsumptionKWh", (store.getState("totalConsumptionKWh") + parseFloat(subtotal)))
        return `<tr>
                    <th scope="col" colspan="2">Consumo ${c}</th>
                    <td>${charge[c].toFixed(2)}</td>
                    <td>${totalPeriod ? parseFloat(totalPeriod).toFixed(2) : totalPeriod}</td>
                    <td>${subtotal ? parseFloat(subtotal).toFixed(2) : subtotal}</td>
                </tr>
                <p>Total: ${store.getState("totalConsumptionKWh")}</p>`;
      }
      return null;
    });
    return consumos.join("");
  }

  store.setState("totalConsumptionKWh", 0)
  const totalHours = parseInt(document.querySelector("#horasTrabajoMaquina").value) / 60 // Convert minutes to hours
  const consumos = cargosDACList.map((c) => {
    const totalPeriod = ((c === "fijo") ? "" : totalKWh)
    const subtotal = ((c === "fijo") ? charge[c].toFixed(2) : (totalKWh * charge[c]).toFixed(2))
    store.setState("totalConsumptionKWh", parseFloat(subtotal))
    return `<tr>
            <th scope="col" colspan="2">Consumo ${c}</th>
            <td>${charge[c].toFixed(2)}</td>
            <td>${totalPeriod ? parseFloat(totalPeriod).toFixed(2) : totalPeriod}</td>
            <td>${subtotal ? parseFloat(subtotal).toFixed(2) : subtotal}</td>
        </tr>
        <p>Total: ${store.getState("totalConsumptionKWh")}</p>`;
  });

  return consumos.join("");
}

function sortByMonth(arr) {
  if (arr && arr.length === 0) return arr
  if (!arr) return []
  var months = [
    "enero",
    "febrero",
    "marzo",
    "abril",
    "mayo",
    "junio",
    "julio",
    "agosto",
    "septiembre",
    "octubre",
    "noviembre",
    "diciembre"
  ]
  return arr.sort((a, b) => {
    return (
      months.indexOf(a.mes.toLowerCase()) - months.indexOf(b.mes.toLowerCase())
    );
  });
}

async function getDataCalculator() {
  return {
    machine: document.querySelector("#listaMaquinasSelect").value.toString(),
    power_rate: document.querySelector("#listaConsumosSelect").value.toString().split("-").shift().trim(),
    material: document.querySelector("#type-material").value.toString(),
    cost_material: document.querySelector("#costoInput").value.toString(),
    width_material: document.querySelector("#widthLeaf").value.toString(),
    height_material: document.querySelector("#largeLeaf").value.toString(),
    number_pieces_material: document.querySelector("#numeroPedazos").value.toString(),
    cost_per_piece_material: document.querySelector("#costoPedazo").value.toString(),
    width_design: document.querySelector("#widthLeafDesign").value.toString(),
    height_design: document.querySelector("#largeLeafDesign").value.toString(),
    time_per_design: document.querySelector("#horasTrabajoMaquina").value.toString(),
    number_pieces_design: document.querySelector("#numeroPedazosDesign").value.toString(),
    cost_per_piece_design: document.querySelector("#costoPedazoDesign").value.toString(),
    electricity_rate: document.querySelector("#listaTarifaHogarSelect").value.toString(),
    electricity_rate_month: document.querySelector("#listaCargoSelect").value.toString(),
    electricity_rate_region: document.querySelector("#listaTarifaDACSelect").value.toString(),
    worker_salary: document.querySelector("#pagoMensuOperador").value.toString(),
    worker_hours_monthly: document.querySelector("#horasTrabajoOperador").value.toString(),
    cost_per_hour_worker: document.querySelector("#costoHoraOperador").value.toString(),
    value_per_piece: document.querySelector("#valuePerPiece").value.toString(),
    utilty_per_piece: document.querySelector("#utilityPerPiece").value.toString(),
    total_utility: document.querySelector("#totalUtility").value.toString(),
    return_of_investment: document.querySelector("#roiPieces").value.toString(),
    api_key: sessionStorage.getItem("uuidv4"),
    img: await getImgDesignData()
  }
}

async function getImgDesignData() {
  const files = document.querySelector("#customFile").files
  if(!files || !files.length) return
  const file = files[0]
  const bs64 = await getBase64(file)
  let filename = file.name.split(".")
  const extension = filename.pop()
  filename.push(Math.floor(new Date() / 1000))
  filename.push(extension)
  filename = filename.join(".")
  const mimetype = file.type
  return {
    bs64,
    filename,
    mimetype
  }
}

function recordTimeTool() {
  setInterval(() => {
    store.setState("timeElapsed", store.getState("timeElapsed") + 60)
    sendElapsedTimeToParent({
      api_key: sessionStorage.getItem("uuidv4"),
      time_elapsed: store.getState("timeElapsed").toString()
    })
  }, 60000)
}

function getSizeIframe(e, firstTime = false) {
  const size = document.querySelector(".row.form-container").offsetHeight
  sendSizeToParent(size, firstTime)
}

function sendSizeToParent(size, firstTime) {
  const message = JSON.stringify({
    size,
    firstTime
  });
  window.parent.postMessage(message, "*")
}

function sendMessageToastToParent(statusMessage, messageToast) {
  const message = JSON.stringify({
    status: statusMessage,
    message: messageToast
  })
  window.parent.postMessage(message, "*")
}

function sendDataCalculatorToParent(data) {
  const message = JSON.stringify({
    saveData: true,
    data
  })
  window.parent.postMessage(message, "*")
}

function sendImgMachineToParent(imgMachine) {
  const message = JSON.stringify({
    imgMachine
  })
  window.parent.postMessage(message, "*")
}

function sendElapsedTimeToParent(data) {
  const message = JSON.stringify({
    saveDataView: true,
    data
  })
  window.parent.postMessage(message, "*")
}

async function getBufferFromImage() {
  const customFileNode = document.querySelector("#customFile")
  if (!customFileNode || !customFileNode.files[0]) return null
  const file = customFileNode.files[0]
  const bs64 = await getBase64(file)
  return bs64
}

function getBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
      resolve(reader.result)
    }
    reader.onerror = function (error) {
      reject(error)
    }
  })
}

new ResizeObserver(getSizeIframe).observe(document.querySelector(".row.form-container"))
document.addEventListener("DOMContentLoaded", e => getSizeIframe(e, true))