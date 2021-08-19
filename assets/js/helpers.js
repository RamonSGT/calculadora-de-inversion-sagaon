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

  let totalKWh = (consumption.potencia_kwh * workHours).toFixed(2);

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
  const consumos = cargosDACList.map((c) => {
    const totalPeriod = ((c === "fijo") ? "" : totalKWh)
    const subtotal = ((c === "fijo") ? charge[c].toFixed(2) : (totalKWh * charge[c]).toFixed(2))
    store.setState("totalConsumptionKWh", (store.getState("totalConsumptionKWh") + parseFloat(subtotal)))
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

function getValuesFromInput() {
  const valueFromInput = store.getState("metadata")
  valueFromInput.designDimensions.large = 0
  valueFromInput.designDimensions.width = 
  console.log("Value from input", valueFromInput)
}

function trackUsingTime() {
  setInterval(() => {
  }, 30000)
}

trackUsingTime()