// $.ajaxSetup({
//     error: function(x, status, error) {
//         if (!x.status) {
//             NofiticationManager.error('Server', 'No se pudo establecer conexión con el servidor', 3000)
//         }
//     }
// })

/***
 * Hacer testing de DAC y más test generales
 * PDF con imagen del diseño del usuario
 * Descripción del contexto del cotizador pdf
 * Eliminar el voltaje del pdf
 */

const BASE_URL = "https://jsfn-stech.azurewebsites.net/api"
// const BASE_URL = "http://localhost:7071/api"

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
            return consumos
        })
        .catch(error => {
            return { error: { message: error.responseJSON?.message } }
        })
}

async function storeHistoryCalculator() {
    return await $.ajax({
        url: `${BASE_URL}/save/calculator-history?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
        method: 'POST',
        data: JSON.stringify(saveDataCalculator()),
        contentType: 'application/json',
    })
        .then(_ => _)
        .catch(error => {
            return { error: { message: error.responseJSON?.message } }
        })
}

async function generatePdf() {
    return await $.ajax({
        url: `${BASE_URL}/generate-pdf?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
        method: 'POST',
        data: JSON.stringify({
            maxCurrent: document.querySelector("#corrienteMax").innerText,
            power: document.querySelector("#potencia").innerText,
            costPerPiece: document.querySelector("#listaConsumos > tr:nth-child(2) > td").innerText,
            costElectricity: document.querySelector("#listaConsumos > tr:nth-child(3) > td").innerText,
            costOperator: document.querySelector("#listaConsumos > tr:nth-child(4) > td").innerText,
            costTotalPerPiece: document.querySelector("#listaConsumos > tr:nth-child(5) > th:nth-child(2) > strong").innerText,
            utilityPerPiece: document.querySelector("#listaConsumos > tr:nth-child(7) > td").innerText,
            piecesToSell: document.querySelector("#listaConsumos > tr:nth-child(8) > th:nth-child(2) > strong").innerText,
            imgDesign: await getBufferFromImage(),
            machine: document.querySelector("#listaMaquinasSelect").value,
            powerMachine: document.querySelector("#listaConsumosSelect").value.split(" - ").shift(),
            typeMaterial: document.querySelector("#type-material").value,
            widthMaterial: document.querySelector("#widthLeaf").value,
            largeMaterial: document.querySelector("#largeLeaf").value,
            designWidth: document.querySelector("#widthLeafDesign").value,
            designLarge: document.querySelector("#largeLeafDesign").value,
            timePerDesign: document.querySelector("#horasTrabajoMaquina").value
        }),
        contentType: 'application/json',
    })
        .then(pdf => {
            const pdfurl = `data:application/pdf;base64,${pdf}`
            const downloadLink = document.createElement("a");
            const fileName = "cotizacion.pdf";
            downloadLink.href = pdfurl;
            downloadLink.download = fileName;
            downloadLink.click()
        })
        .catch(error => {
            return { error: { message: error.responseJSON?.message } }
        })
}

async function countCalculatorView(method = "GET", body = null) {
    return await $.ajax({
        url: `${BASE_URL}/count/calculator-view?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
        method,
        data: body,
        contentType: 'application/json',
    })
        .then(response => {
            console.log(response)
            if (method === "GET" && response) {
                sessionStorage.setItem("uuidv4", response)
                recordTimeTool()
            }
        })
        .catch(error => {
            return { error: { message: error.responseJSON?.message } }
        })
}

countCalculatorView()