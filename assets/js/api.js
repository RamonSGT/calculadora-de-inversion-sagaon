// $.ajaxSetup({
//     error: function(x, status, error) {
//         if (!x.status) {
//             NofiticationManager.error('Server', 'No se pudo establecer conexión con el servidor', 3000)
//         }
//     }
// })

const BASE_URL = "jsfn-stech.azurewebsites.net"
// const BASE_URL = "localhost:7071"

async function getRates(type) {
    return await $.ajax({
        url: `http://${BASE_URL}/api/cfe/rates/${type}?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
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
        url: `http://${BASE_URL}/api/cfe/regions/${region}/charges?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
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
        url: `http://${BASE_URL}/api/products/byConsumption?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
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
        url: `http://${BASE_URL}/api/products/consumptions?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
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
        url: `http://${BASE_URL}/api/save/calculator-history?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
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
        url: `http://${BASE_URL}/api/generate-pdf`,
        method: 'POST',
        data: JSON.stringify({
            maxCurrent: document.querySelector("#corrienteMax").innerText,
            volts: document.querySelector("#voltaje").innerText,
            power: document.querySelector("#potencia").innerText,
            costPerPiece: document.querySelector("#listaConsumos > tr:nth-child(2) > td").innerText,
            costElectricity: document.querySelector("#listaConsumos > tr:nth-child(3) > td").innerText,
            costOperator: document.querySelector("#listaConsumos > tr:nth-child(4) > td").innerText,
            costTotalPerPiece: document.querySelector("#listaConsumos > tr:nth-child(5) > th:nth-child(2) > strong").innerText,
            utilityPerPiece: document.querySelector("#listaConsumos > tr:nth-child(7) > td").innerText,
            piecesToSell: document.querySelector("#listaConsumos > tr:nth-child(8) > th:nth-child(2) > strong").innerText,
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
        url: `http://${BASE_URL}/api/count/calculator-view?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`,
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