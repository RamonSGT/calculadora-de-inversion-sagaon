function startTutorial() {
  try {
    console.log("START TUTORIAL")
    const popoverElements = getPopoverElements()
    hidePopoverElements(popoverElements)
    loadTutorial()
  } catch(error) {
    console.log("EL ERRORORORORORORORORO --->>>>>><", error)
  }
}

// Get all img tags and then get only the ones with tag id popover-${i} and return them in array
function getPopoverElements() {
  const popoverElements = document.getElementsByTagName('img')
  const popoverElementsArray = []
  for (let i = 0; i < popoverElements.length; i++) {
    if (popoverElements[i].id.includes('popover-')) {
      popoverElementsArray.push(popoverElements[i])
    }
  }
  return popoverElementsArray
}

// Add style display none to all popover elements
function hidePopoverElements(popoverElements) {
  popoverElements.forEach(element => {
    element.style.display = 'none'
  })
}

// Remove style display none to all popover elements
function showPopoverElements(popoverElements) {
  popoverElements.forEach(element => {
    element.removeAttribute("style")
    element.setAttribute("style", "width: 15px; height: 15px;")
  })
}

function loadTutorial() {
  let customScrollY = 0
  introJs().setOptions({
    scrollToElement: false,
    exitOnOverlayClick: false,
    exitOnEsc: false,
    scrollTo: 'element',
    nextLabel: 'Siguiente',
    prevLabel: 'Anterior',
    doneLabel: 'Finalizar',
    disableInteraction: true,
    showBullets: false,
    showProgress: true,
    tooltipPosition: 'auto',
    steps: [
      {
        intro: "¡Hola emprendedor! 👋 Vamos a ver un pequeño ejemplo práctico que te ayudará a familiarizarte con la herramienta. <br><p><strong><small>&#9675; Te tomará aproximadamente 5 minutos</small></strong></p>"
      },
      {
        element: ".introjs-section-machine",
        intro: "Cada sección se divide por título, puedes abrir o cerrarlo dandole clic. Esto se habilitará al finalizar el tutorial."
      },
      {
        element: ".introjs-section-machine-popover-1",
        intro: "Este icono de ayuda te mostrará información detallada del campo en particular cuando pases el mouse por encima al finalizar el tutorial."
      },
      {
        element: ".introjs-section-machine-body",
        intro: "En esta sección ingresarás el módelo que coincida con el de tu máquina para realizar los cálculos en base a ella."
      },
      {
        element: ".introjs-section-machine-body-required",
        intro: "Los campos que cuentan con el asterisco (<strong>*</strong>) significa que son campos obligatorios."
      },
      {
        element: ".introjs-section-raw-body",
        intro: "A continuación se ingresarán los datos relacionados con la materia prima que usarás para crear tu diseño. Para un cálculo más preciso del retorno de la inversión, es importante poner los datos correctamente.",
      },
      {
        element: ".introjs-section-raw-body-result",
        intro: "Como podrás observar en los siguientes campos, tienen un fondo gris. Eso significa que no puedes editar dichos campos y el valor obtenido es en base a los datos ingresados en la sección."
      },
      {
        element: ".introjs-section-raw-body-pedazos",
        intro: "Es la cantidad de pedazos que obtienes según el área de trabajo de tu máquina. Esto es especialmente útil si compras una lamina de material más grande que el área de trabajo de tu máquina, esto te calculará la cantidad de laminas que obtienes por el material.",
      },
      {
        element: ".introjs-section-raw-body-cost-pedazos",
        intro: "Es el costo por lámina según el área de trabajo de la máquina seleccionada anteriormente. En nuestro caso hemos ingresado una máquina con un tamaño de 30 x 20 cm.",
      },
      {
        element: ".introjs-section-design-body",
        intro: "A continuación se ingresarán los datos relacionados con el diseño a grabar o cortar. En base a este diseño, se hará una proyección del retorno de tu inversión.",
        position: "middle-middle"
      },
      {
        element: ".introjs-section-design-body-options",
        intro: `En esta parte se encuentran dos opciones que nos permitirán elegir bajo que modalidad usaremos la máquina para el diseño que haremos.
        <p><strong>Cortar o grabar: </strong>Hace referencia a solo una acción en especifico.</p>
        <p><strong>Cortar y grabar: </strong>Hace referencia a ambas acciones y se tendrá que especificar el porcentaje de trabajo para cada una.</p>`,
      },
      {
        element: ".introjs-section-design-body-option",
        intro: "En este ejemplo guiado, vamos a elegir la opción de cortar y grabar."
      },
      {
        element: ".introjs-section-design-body-engrave",
        intro: "Aquí seleccionaremos el porcentaje de trabajo para el grabado del diseño."
      },
      {
        element: ".introjs-section-design-body-cut",
        intro: "Aquí seleccionaremos el porcentaje de trabajo para el corte del diseño."
      },
      {
        element: ".introjs-section-design-body-design",
        intro: "Aquí podrás subir tú diseño. Esto será de utilidad para poder darle un mejor formato a la hoja de resultados y también nos ayudará a ofrecerte un mejor servicio en el futuro."
      },
      {
        element: ".introjs-section-electricity-body",
        intro: "A continuación se ingresarán los datos según el tipo de tarifa que se muestre en nuestro recibo de pago de la CFE."
      },
      {
        element: ".introjs-section-electricity-body-options",
        intro: `En estas opciones se elige el tipo de tarifa que marca el recibo de pago de la CFE. No te preocupes para saber esto puedes encontrarlo en tu recibo. Más adelante al finalizar el tutorial podrás consultar el icono de ayuda para saber donde buscarlo.`
      },
      {
        element: ".introjs-section-electricity-body-rate",
        intro: "Aquí se ingresará la tarifa que se muestra en el recibo de pago de la CFE. En nuestro caso elegiremos la tarifa 1D."
      },
      {
        element: ".introjs-section-electricity-body-month",
        intro: "Aquí ingresaremos el mes en el que nos encontramos haciendo el cálculo. Cada mes tiene una pequeña variación en el precio de KWh."
      },
      {
        element: ".introjs-section-operator-body",
        intro: "Aquí se ingresarán los datos del operador de la máquina. Ingresaremos datos como las horas trabajas por mes asi como el salario."
      },
      {
        element: ".introjs-section-product-body",
        intro: "En esta sección se establecerá el precio de venta de tu producto a tus clientes"
      },
      {
        element: ".introjs-section-advanced-body",
        intro: "En esta sección podemos ingresar tanto la lectura actual como la anterior que viene en nuestro recibo de pago de la CFE. Esto nos ayudará a tener un cálculo más preciso de los costos de la luz."
      },
      {
        element: ".introjs-btn-calculate",
        intro: "Una vez introducido los datos de forma correcta, procedemos a calcular el resultado."
      },
      {
        element: ".introjs-section-result",
        intro: "A continuación se muestra una tabla detallando los costos, así como el cálculo correspondientes para recuperar la inversión de la máquina."
      },
      {
        element: ".introjs-btn-pdf",
        intro: "Por último puedes generar un pdf con el resumen de los gastos, esto te puede ser de utilidad para mantener un registro interno de tus cálculos."
      },
      {
        intro: "Hemos terminado el tutorial. ¡Felicidades! Ya eres capaz de realizar tus propios cálculos."
      }
    ]
  }).oncomplete(() => {
    console.log("Tutorial completado")
  }).onchange(function (targetElement) {
    if (targetElement.classList.contains("introjs-section-machine") ||
      targetElement.classList.contains("introjs-section-raw") ||
      targetElement.classList.contains("introjs-section-design") ||
      targetElement.classList.contains("introjs-section-electricity") ||
      targetElement.classList.contains("introjs-section-operator") ||
      targetElement.classList.contains("introjs-section-product") ||
      targetElement.classList.contains("introjs-section-advanced")) {
      customScrollY = targetElement.offsetTop
    }

    if (targetElement.classList.contains("introjs-section-machine-body")) {
      setTimeout(() => {
        const machinesList = document.querySelector("#listaMaquinasSelect")
        const selectedIndex = 1
        const selectedValue = machinesList.options[selectedIndex].value
        machinesList.value = selectedValue
        changedSelectedMachine(machinesList)
      }, 1000)
    }

    if (targetElement.classList.contains("introjs-section-raw-body")) {
      const materialsList = document.querySelector("#type-material")
      const selectedIndex = 1
      const selectedValue = materialsList.options[selectedIndex].value
      materialsList.value = selectedValue
      const costInputElement = document.querySelector("#costoInput")
      costInputElement.value = 35
      const widthLeafElement = document.querySelector("#widthLeaf")
      widthLeafElement.value = 30
      const largeLeafElement = document.querySelector("#largeLeaf")
      largeLeafElement.value = 20
      document.querySelector("#thicknessLeaf").value = 3
      calculateRawMaterialData(widthLeafElement, "widthLeaf")
      calculateRawMaterialData(largeLeafElement, "largeLeaf")
      calculateCostInput(costInputElement)
    }

    if (".introjs-section-design-body") {
      setTimeout(() => {
        const widthLeafElement = document.querySelector("#widthLeafDesign")
        widthLeafElement.value = 12
        const largeLeafElement = document.querySelector("#largeLeafDesign")
        largeLeafElement.value = 10
        document.querySelector("#horasTrabajoMaquina").value = 25
        document.querySelector("#thicknessLeaf").value = 3
        calculatePieces(widthLeafElement, "widthLeafDesign")
        calculatePieces(largeLeafElement, "largeLeafDesign")
      }, 1000)
    }

    if (".intro-section-operator-body") {
      setTimeout(() => {
        const salaryElement = document.querySelector("#pagoMensuOperador")
        salaryElement.value = 6000
        const hoursElement = document.querySelector("#horasTrabajoOperador")
        hoursElement.value = 80
        calculateCostOperator(salaryElement, hoursElement)
      }, 1000)
    }

    if (".intro-section-product-body") {
      document.querySelector("#valuePerPiece").value = 100
      store.setState("valuePerPiece", 100)
    }

    if (targetElement.classList.contains("introjs-section-machine-body") ||
      targetElement.classList.contains("introjs-section-raw-body") ||
      targetElement.classList.contains("introjs-section-design-body") ||
      targetElement.classList.contains("introjs-section-electricity-body") ||
      targetElement.classList.contains("introjs-section-operator-body") ||
      targetElement.classList.contains("introjs-section-product-body") ||
      targetElement.classList.contains("introjs-section-advanced-body")
    ) {
      targetElement.parentElement.parentElement.querySelector("h2 > button").click()
    }

    if (targetElement.classList.contains("introjs-section-machine") ||
      targetElement.classList.contains("introjs-section-raw") ||
      targetElement.classList.contains("introjs-section-design") ||
      targetElement.classList.contains("introjs-section-electricity") ||
      targetElement.classList.contains("introjs-section-operator") ||
      targetElement.classList.contains("introjs-section-product") ||
      targetElement.classList.contains("introjs-section-advanced")) {
      customScrollY = targetElement.offsetTop
    }

    if (targetElement.classList.contains("introjs-section-machine-popover-1")) {
      showPopoverElements(getPopoverElements())
    }
    if (targetElement.id === "listaMaquinasSelect" ||
      targetElement.id === "type-material" ||
      targetElement.id === "listaTarifaHogarSelect" ||
      targetElement.id === "listaCargoSelect"
    ) {
      targetElement.selectedIndex = 1
      const selectedValue = targetElement.options[targetElement.selectedIndex].value;
      targetElement.value = selectedValue
    }
    if (targetElement.id === "listaCargoSelect") {
      store.selectCharge(targetElement.value);
    }
    if (targetElement.id === "listaConsumosSelect-2"
    ) {
      targetElement.selectedIndex = 3
      const selectedValue = targetElement.options[targetElement.selectedIndex].value;
      targetElement.value = selectedValue
    }
    if (targetElement.id === "listaConsumosSelect-3"
    ) {
      targetElement.selectedIndex = 4
      const selectedValue = targetElement.options[targetElement.selectedIndex].value;
      targetElement.value = selectedValue
      averageConsumption()
    }
    if (targetElement.id === "customFile") {
      setBase64ToInputFile()
    }
    if (targetElement.id === "listaMaquinasSelect") {
      changedSelectedMachine(targetElement)
        .then(_ => console.log(store.getState("selectedMachine")))
        .catch(error => console.error(error))
    }
    if (targetElement.id === "listaTarifaHogarSelect") {
      listRatesHomeSelect(targetElement)
        .then(_ => console.log(store.getState("selectedTarifaHogar")))
        .catch(error => console.error(error))
    }
    // Raw material data
    if (targetElement.id === "costoInput") {
      targetElement.value = 35
      calculateCostInput(targetElement)
    }
    if (targetElement.id === "widthLeaf") {
      targetElement.value = 30
      calculateRawMaterialData(targetElement, "widthLeaf")
    }
    if (targetElement.id === "largeLeaf") {
      targetElement.value = 20
      calculateRawMaterialData(targetElement, "largeLeaf")
    }
    if (targetElement.id === "thicknessLeaf") {
      targetElement.value = 3
    }
    // Design data
    if (targetElement.id === "widthLeafDesign") {
      targetElement.value = 12
      calculatePieces(targetElement, "widthLeafDesign")
    }
    if (targetElement.id === "largeLeafDesign") {
      targetElement.value = 20
      calculatePieces(targetElement, "largeLeafDesign")
    }
    if (targetElement.id === "horasTrabajoMaquina") {
      targetElement.value = 25
    }
    if (targetElement.id === "horasTrabajoOperador") {
      targetElement.value = 80
      calculateCostOperator(targetElement)
    }
    if (targetElement.id === "pagoMensuOperador") {
      targetElement.value = 6000
      calculateCostOperator(targetElement)
    }
    if (targetElement.id === "valuePerPiece") {
      targetElement.value = 100
      store.setState("valuePerPiece", targetElement.value)
    }
    if (targetElement.id === "cut-and-engrave" ||
      targetElement.id === "calcular" ||
      targetElement.id === "generate-pdf"
    ) {
      if (targetElement.id === "cut-and-engrave") {
        changedOptionsMachineContainer(targetElement)
      }
      targetElement.click()
    }
    customScrollY = targetElement.getBoundingClientRect().top
    if (targetElement.className.indexOf("introjs") >= 0 && targetElement.className.indexOf("-body") === -1) {
      console.log("El custom scroll es: ", customScrollY)
      sendScrollIntoViewParent(customScrollY)
    }
    // On click on the close button
  }).onexit(() => {
    showPopoverElements(getPopoverElements())
  })
    .onafterchange(e => {
      if (customScrollY >= 2000 && e.classList.contains("introjsFloatingElement") && e.classList.contains("introjs-showElement")) {
        sendScrollToMiddle()
      }
      sendScrollIntoViewParent(customScrollY)
    })
    .start()
}

async function messageHandlerParent(e) {
  console.log("La data es: ", e.data)
  if (!receivedResponse && typeof e.data === "string") {
    receivedResponse = true
    const existUserInDb = await existUser(e.data)
    console.log("lA RESPONSE ES: ", existUserInDb)
    if(existUserInDb && typeof existUserInDb === "boolean") return
    startTutorial()
    // setTimeout(() => {
    // }, 3000)
  }
}

async function existUser(email) {
  const myHeaders = new Headers();
  myHeaders.append("Content-Type", "application/json");

  const requestOptions = {
    method: 'GET',
    headers: myHeaders,
    redirect: 'follow'
  };

  try {
    let response = await fetch(`https://jsfn-stech.azurewebsites.net/api/shopify/exist-user?email=${email}`, requestOptions)
    response = await response.json()
    console.log("Response is ------->", response)
    return JSON.parse(response.json).exist
  } catch (error) {
    return false
  }
}

// Add value to existing cookies
function addValueToExistingCookies(value) {
  const cookies = document.cookie.split(";")
  const cookiesArray = cookies.map(cookie => cookie.split("="))
  const cookiesArrayFiltered = cookiesArray.filter(cookie => cookie[0].trim() === "introjs-user")
  if (cookiesArrayFiltered.length > 0) {
    const cookieValue = cookiesArrayFiltered[0][1]
    const newCookieValue = cookieValue + "," + value
    document.cookie = `introjs-user=${newCookieValue}`
  } else {
    document.cookie = `introjs-user=${value}`
  }
}

window.addEventListener('message', messageHandlerParent, false);