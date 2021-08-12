// $.ajaxSetup({
//     error: function(x, status, error) {
//         if (!x.status) {
//             NofiticationManager.error('Server', 'No se pudo establecer conexión con el servidor', 3000)
//         }
//     }
// })

async function andrea(id) {
    return await $.ajax({
        url: 'https://tests-faas.azurewebsites.net/api/prueba?code=dtRLzM6kb5xasJ6k9rHls202wlHgqLFZBCFv1P6zFz5XtncsSBmSEA==',
        method: 'GET',
        data: JSON.stringify({ name: andrea }),
        contentType: 'application/json',
    })
    .then(res => {
        console.log(res)
    })
    .catch(error => {
        return { error: { message: error.responseJSON?.message } }
    })
}
andrea()

async function getRates(type) {
    return await $.ajax({
        url: `https://jsfn-stech.azurewebsites.net/api/cfe/rates/${type}?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
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
        url: `https://jsfn-stech.azurewebsites.net/api/cfe/regions/${region}/charges?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==`
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
        url: 'https://jsfn-stech.azurewebsites.net/api/products/byConsumption?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA=='
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
        url: 'https://jsfn-stech.azurewebsites.net/api/products/consumptions?code=pppBiG10avvQGWropiQjBOagsQ0rokLIqsBhCdpgWsMwPZRadSlXUA==',
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

