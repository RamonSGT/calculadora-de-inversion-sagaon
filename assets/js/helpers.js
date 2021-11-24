let receivedResponse = false

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
  consumption,
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
    thickness_material: document.querySelector("#thicknessLeaf").value.toString(),
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

function sendScrollIntoViewParent(customScrollY) {
  const message = JSON.stringify({
    scrollIntoView: true,
    customScrollY
  })
  window.parent.postMessage(message, "*")
}

function sendScrollToMiddle() {
  const message = JSON.stringify({
    scrollToMiddle: true
  })
  window.parent.postMessage(message, "*")
}

function sendTutotrialStatus(status = false) {
  const message = JSON.stringify({
    isActiveTutorial: status,
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

// Convert local image in assets/images/demon.svg to base64 this is used for tutorial
function getBase64FromSVG() {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open("GET", "assets/images/demon.svg", true);
    xhr.responseType = "blob";
    xhr.onload = function (e) {
      if (this.status == 200) {
        const blob = this.response;
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = function () {
          resolve(reader.result)
        }
      }
    };
    xhr.send();
  })
}

// Upload base64 to input type file with id #customFile
function uploadBase64ToInputFile(base64) {
  const inputFile = document.querySelector("#customFile")
  const file = base64ToFile(base64, "customFile")
  inputFile.files = [file]
}

 function base64ToFile(base64, filename) {
  let arr = base64.split(','), mime = arr[0].match(/:(.*?);/)[1],
    bstr = atob(arr[1]), n = bstr.length, u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], filename, { type: mime });
}

function FileListItems (files) {
  var b = new ClipboardEvent("").clipboardData || new DataTransfer()
  for (var i = 0, len = files.length; i<len; i++) b.items.add(files[i])
  return b.files
}

function setBase64ToInputFile() {
  getBase64FromSVG().then(svg => {
    const file = base64ToFile(svg, "caratulas.svg")
    const inputFile = document.querySelector("#customFile")
    inputFile.files = new FileListItems([file])
  })
}

// Calculate the size of total scroll
function getScrollSize() {
  const scrollSize = document.querySelector(".row.form-container").offsetHeight
  return scrollSize
}

// Pop over files
function createPopOver() {
  let contents = [
    "Es la potencia promedio a lo que trabajará tú máquina para realizar el diseño ingresado.",
    "Es la cantidad de pedazos que se obtienen según el tamaño de corte de tu máquina y la medida de la hoja.",
    "En esta sección se elegirá el tipo de tarifa y la categoría que aparece en nuestro recibo de pago de la CFE.<img src='./assets/images/tarifa_CFE.jpg' height=400px width=100%>",
    "Es el mes en el que deseas realizar el cálculo, es importante recordar que cada mes tiene un costo de tarifa diferente.",
    "Es la región a la cual corresponde tu localidad. Por cada región existe un costo fijo que se aplica a los hogares o pequeños negocios con un elevado consumo eléctrico. Aplica solo si en tu recibo te marca el tipo de tarifa <strong>DAC</strong> <img src='./assets/images/tarifa_dac.webp' height=200px width=100%>",
    "Esta sección va dirigida a tí como vendedor, es decir, se asignara el precio de tu producto.",
    "Es el precio que le asignas a tu diseño para tus clientes.",
    "Es la cantidad de dinero que obtendrías por una sola pieza después de contemplar los costos del material, uso de electricidad y salario del operador.",
    "Es el monto de dinero que obtendrías después de vender todas las piezas según el tamaño del material ingresado anteriormente.",
    "Es la cantidad de piezas que necesitas vender para poder empezar a obtener beneficios, es decir, además de los costos asociados se contempla el precio de la máquina.",
    "En esta sección ingresarás los datos de tu diseños que plasmarás en el material. Para poder realizar el cálculo, es necesario ingresar los datos en la sección de <i>Materia prima</i>.<br>Tenga en cuenta que solo se esta calculando el costo del material, sin contemplar gastos de electricidad y operador.",
    "En esta sección vienen campos complementarios que te ayudarán a realizar un cálculo más preciso de los costos de electricidad.",
    "Es la lectura actual que se muestra en tu medidor.",
    "Es el consumo anterior que tuviste en tu recibo de pago de la CFE. <img src='./assets/images/tarifas_CFE.jpg' height=400px width=100%>",
    "Es la diferencia entre la lectura actual y el consumo anterior.",
    `Por defecto la CFE aplica un costo fijo a la tarifa DAC. Según la selcción de tú región el costo que se te aplica es de: <strong>$ ${store.getState("DACFixedPrice")}</strong>. Esto se divide por la cantidad de piezas totales calculadas anteriormente, que nos dará el costo para cada pieza.`,
    "Es la cantidad de dinero que obtendrías por una sola pieza después de contemplar los costos del material, uso de electricidad y salario del operador.",
    "Es el monto de dinero que obtendrías después de vender todas las piezas según el tamaño del material ingresado anteriormente.",
    "En esta sección se ingresan los datos relacionados con tu máquina, es decir, el módelo que usarás para hacer el cálculo.",
    "Es el modelo de la máquina que usarás para el cálculo.",
    "En esta sección se ingresarán los datos relacionados con tu materia prima.",
    "Es el tipo de material a utilizar en la máquina. En caso de que el material no se muestre en la lista, seleccionar la opción <strong>otro</strong>",
    "Es el precio al cual adquiriste la hoja de material.",
    "Es la medida (ancho) de la hoja.",
    "Es la medida (largo) de la hoja.",
    "Es el costo calculado según la cantidad de pedazos resultantes y el costo total de la hoja. <strong>(Esto no contempla ningún otro valor como el costo del consumo eléctrico o del operador.)</strong>",
    "Es la medida (ancho) del diseño.",
    "Es la medida (largo) del diseño.",
    "Es la cantidad de minutos que tardará tu máquina de forma aproximada para plasmar el diseño.",
    "Es la cantidad de diseños que se pueden obtener. Esto se calcula en base a las medidas ingresadas en la sección de <i>Materia prima</i> y el tamaño del diseño.",
    "Es el precio calculado de tu diseño según la medida y el costo de material.",
    "Es el diseño que se plasmará en la máquina CNC, el mismo aparecerá en el resumen de los gastos que usted podrá imprimir posteriormente.",
    "En esta sección se detallarán los costos asociados con el salario del operador. Es importante resaltar que a pesar de que el dueño de la máquina sea el operador tome en cuenta asignarse un salario, esto con la finalidad de que el resultado sea más exacto.",
    "Es el salario mensual que recibe el que se encarga de utilizar la máquina.",
    "Es la cantidad de horas trabajadas por el operador de la máquina.",
    "Es el resultado del pago mensual del operador entre la cantidad de horas que trabaja.",
    "Es el tipo de tarifa que aparece en tu recibo de la CFE.",
  ]
  for (let i = 1; i <= contents.length; i++) {
    tippy(`#popover-${i}`, {
      content: contents[(i - 1)],
      allowHTML: true,
      animation: "scale",
      trigger: "mouseenter focus",
      placement: (i === 3 || i === 14 || i === 5) ? "right" : "top", // Si es la imágen entonces se pone a la derecha.
    })
  }

  tippy("#icon-tutorial", {
    content: "Ver tutorial",
    allowHTML: true,
    animation: "scale",
    trigger: "mouseenter focus",
    placement: "right",
  })
}

createPopOver()

// Create a toast
toastr.options = {
  closeButton: false,
  debug: false,
  newestOnTop: false,
  rogressBar: false,
  positionClass: "toast-top-full-width",
  preventDuplicates: false,
  onclick: true,
  showDuration: "300",
  hideDuration: "3000",
  timeOut: "3000",
  extendedTimeOut: "1000",
  showEasing: "swing",
  hideEasing: "linear",
  showMethod: "fadeIn",
  hideMethod: "fadeOut",
}

new ResizeObserver(getSizeIframe).observe(document.querySelector(".row.form-container"))
document.addEventListener("DOMContentLoaded", e => getSizeIframe(e, true))