// $.ajaxSetup({
//     error: function(x, status, error) {
//         if (!x.status) {
//             NofiticationManager.error('Server', 'No se pudo establecer conexión con el servidor', 3000)
//         }
//     }
// })

const BASE_URL = "https://jsfn-stech.azurewebsites.net/api" Produccion - Funciones de Azure
// const BASE_URL = "http://127.0.0.1:7071/api" // Entorno local - Funciones de Azure
const BASE_PDF_URL = "https://sagaon-tech-server.herokuapp.com/api" Producción - Servidor de amplify
// const BASE_PDF_URL = "http://127.0.0.1:3030/api" // Entorno local - Servidor de amplify

async function getRates(type) {
  return await $.ajax({
    url: `${BASE_URL}/cfe/rates/${type}?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
  })
    .then(res => {
      const { tarifas } = JSON.parse(res)
      return tarifas
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

async function getChargesByRegion(region) {
  return await $.ajax({
    url: `${BASE_URL}/cfe/regions/${region}/charges?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
  })
    .then(res => {
      const { cargos } = JSON.parse(res)
      return cargos
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

async function getProducts() {
  return await $.ajax({
    url: `${BASE_URL}/products/byConsumption?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
  })
    .then(res => {
      const { productos } = JSON.parse(res)
      return productos
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

async function getConsumptionsByProduct(id) {
  return await $.ajax({
    url: `${BASE_URL}/products/consumptions?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
    method: 'POST',
    data: JSON.stringify({ product: id }),
    contentType: 'application/json',
  })
    .then(res => {
      const { consumos } = JSON.parse(res)
      let compare = (a, b) => {
        if (a.porcentaje_trabajo < b.porcentaje_trabajo) return -1
        if (a.porcentaje_trabajo > b.porcentaje_trabajo) return 1
        return 0
      }
      consumos.sort(compare)
      store.setState("consumptions", consumos)
      return consumos
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

async function storeHistoryCalculator() {
  // Data is sended to shopify store as a json because we need the user email.
  console.log("La data de la calculadora es: ", await getDataCalculator())
  // sendDataCalculatorToParent(await getDataCalculator())
}

/**
 * 
 * 
 */
async function generatePdf() {
  const rateElectricity = (document.querySelector("#listaConsumos > tr:nth-child(6) > th:nth-child(2) > strong")) ? document.querySelector("#listaConsumos > tr:nth-child(6) > th:nth-child(2) > strong") : document.querySelector("#listaConsumos > tr:nth-child(5) > th:nth-child(2) > strong")

  const utilityPerPiece = document.querySelector("#listaConsumos > tr:nth-child(8) > td") ? document.querySelector("#listaConsumos > tr:nth-child(8) > td") : (store.getState("selectedRate").tipo !== "DAC") ? document.querySelector(`#listaConsumos > tr:nth-child(10) > td`) : document.querySelector(`#listaConsumos > tr:nth-child(9) > td`)

  const piecesToSell = document.querySelector("#listaConsumos > tr:nth-child(10) > th:nth-child(2) > strong") ? document.querySelector("#listaConsumos > tr:nth-child(10) > th:nth-child(2) > strong") : document.querySelector("#listaConsumos > tr:nth-child(11) > th:nth-child(2) > strong")

  const fixedCostElectricity = document.querySelector("#listaConsumos > tr:nth-child(3) > td") ? document.querySelector("#listaConsumos > tr:nth-child(3) > td") : ""

  const costElectricity = store.getState("selectedRate").tipo === "DAC" ? document.querySelector("#listaConsumos > tr:nth-child(4) > td") : document.querySelector("#listaConsumos > tr:nth-child(3) > td")

  const costOperator = store.getState("selectedRate").tipo === "DAC" ? document.querySelector("#listaConsumos > tr:nth-child(5) > td") : document.querySelector("#listaConsumos > tr:nth-child(4) > td")

  return await $.ajax({
    url: `${BASE_PDF_URL}/calculator/generate-pdf`,
    method: 'POST',
    data: JSON.stringify({
      maxCurrent: document.querySelector("#corrienteMax").innerText,
      power: document.querySelector("#potencia").innerText,
      costPerPiece: document.querySelector("#listaConsumos > tr:nth-child(2) > td").innerText,
      costElectricity: costElectricity.innerText,
      costOperator: costOperator.innerText,
      costTotalPerPiece: rateElectricity.innerText,
      utilityPerPiece: utilityPerPiece.innerText,
      piecesToSell: piecesToSell.innerText,
      imgDesign: await getBufferFromImage(),
      machine: document.querySelector("#listaMaquinasSelect").value,
      powerMachine: document.querySelector("#listaConsumosSelect").value.split(" - ").shift(),
      typeMaterial: document.querySelector("#type-material").value,
      widthMaterial: document.querySelector("#widthLeaf").value,
      largeMaterial: document.querySelector("#largeLeaf").value,
      designWidth: document.querySelector("#widthLeafDesign").value,
      designLarge: document.querySelector("#largeLeafDesign").value,
      timePerDesign: document.querySelector("#horasTrabajoMaquina").value,
      pricePerDesign: document.querySelector("#valuePerPiece").value,
      rateElectricity: store.getState("selectedRate").id_tarifa,
      typeRateElectricity: store.getState("selectedRate").tipo,
      fixedCostElectricity: fixedCostElectricity.innerText
    }),
    contentType: 'application/json',
  })
    .then(pdf => {
      const pdfurl = `data:application/pdf;base64,${pdf}`
      const downloadLink = document.createElement("a");
      const fileName = "detalles-gastos.pdf";
      downloadLink.href = pdfurl;
      downloadLink.download = fileName;
      downloadLink.click()
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

async function countCalculatorView(method = "GET", body = null) {
  if (method !== "GET") return
  return await $.ajax({
    url: `${BASE_URL}/count/calculator-view?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
    method,
    data: body,
    contentType: 'application/json',
  })
    .then(response => {
      if (method === "GET" && response) {
        sessionStorage.setItem("uuidv4", response)
        sendElapsedTimeToParent({
          api_key: sessionStorage.getItem("uuidv4"),
          time_elapsed: store.getState("timeElapsed").toString()
        })
        recordTimeTool()
      }
    })
    .catch(error => {
      return { error: { message: error.responseJSON?.message } }
    })
}

countCalculatorView()