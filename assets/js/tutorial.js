document.addEventListener("DOMContentLoaded", main)

function main() {
  // console.log("-->", changedSelectedMachine)
  const popoverElements = getPopoverElements()
  hidePopoverElements(popoverElements)
  loadTutorial()
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
  introJs().setOptions({
    exitOnOverlayClick: false,
    exitOnEsc: false,
    scrollToElement: false,
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
        intro: "¡Hola emprendedor! 👋 Vamos a dar un pequeño viaje a esta herramienta que esperamos te sea de mucha utilidad. Veremos cada uno de los módulos con un ejemplo guiado con la finalidad de que te familiarices con la herramienta y puedas usarla en cualquier momento."
      },
      {
        element: ".introjs-container",
        intro: "La calculadora de costos se divide en varias secciones que te pedirán una serie de datos para poder realizar el cálculo correspondiente."
      },
      {
        element: ".introjs-section-machine",
        intro: "Las secciones se dividen por categoría que hace referencia a los titulos que se muestran en cada uno de los módulos."
      },
      {
        element: ".introjs-section-machine-popover-1",
        intro: "Este icono de ayuda te mostrará información detallada del campo en particular cuando pases el mouse por encima al finalizar el tutorial."
      },
      {
        element: ".introjs-section-machine-body",
        intro: "En esta sección se encuentran los datos relacionados con la máquina a utilizar."
      },
      {
        element: ".introjs-section-machine-body-required",
        intro: "Los campos que cuentan con el asterisco (<strong>*</strong>) significa que son campos requeridos."
      },
      {
        element: "#listaMaquinasSelect",
        intro: "Aquí se muestra un listado de máquinas. Seleccionaremos una y a continuación se mostrará el nombre de nuestra máquina, así como su medida del área de trabajo y el modelo interno."
      },
      {
        element: ".introjs-section-raw",
        intro: "En esta sección se te pedirán datos relacionados con el material que utilizas. Esto con la finalidad de poder realizar el cálculo del retorno de inversion sobre tú máquina."
      },
      {
        element: ".introjs-section-raw-body",
        intro: "A continuación se ingresarán los datos relacionados con la materia prima que usarás para crear tu diseño. Para un cálculo más preciso del retorno de la inversión, es importante poner los datos correctamente."
      },
      {
        element: ".introjs-section-raw-body-material",
        intro: "Aquí se muestra un listado de materia prima. Seleccionaremos una y a continuación se mostrará el nombre de nuestra materia prima que vamos a utilizar. Conocer este dato nos permitirá ofrecerte un mejor servicio en el futuro."
      },
      {
        element: ".introjs-section-raw-body-cost",
        intro: "Aquí se ingresa el costo del material al que te la vendio tu proveedor. En este ejemplo vamos a poner el aproximado de una tabla MDF de (30cm x 20cm) lo cual es igual al área de trabajo de nuestra máquina seleccionada anteriormente."
      },
      {
        element: ".introjs-section-raw-body-width",
        intro: "Es el ancho de la tabla que adquiriste con tu proveedor y que se relaciona con el costo ingresado anteriormente. Nos servirá para calcular los costos de producción para tú diseño."
      },
      {
        element: ".introjs-section-raw-body-large",
        intro: "Es el largo de la tabla que adquiriste con tu proveedor y que se relaciona con el costo ingresado anteriormente. Nos servirá para cálcular los costos de producción para tú diseño."
      },
      {
        element: ".introjs-section-raw-body-thickness",
        intro: "Es el grosor de la tabla que adquiriste con tu proveedor."
      },
      {
        element: ".introjs-section-raw-body-pedazos",
        intro: "Es la cantidad de de pedazos que obtienes según el área de trabajo de tu máquina. Esto es especialmente útil si compras una lamina de material más grande que el área de trabajo de tu máquina, pues te cálcula la cantidad de piezas aproximadas que puedes obtener según el área de corte de tu máquina. En nuestro ejemplo es de 30cm x 20cm"
      },
      {
        element: ".introjs-section-raw-body-cost-pedazos",
        intro: "Es el costo por lámina área de trabajo de la máquina seleccionada anteriormente. En nuestro caso hemos ingresado una máquina con un tamaño de 30cm x 20cm y hemos puesto la lámina del mismo tamaño, por lo tanto el resultado es el mismo. Esto cambia según si ingresas medidas diferentes en el tamaño del material."
      },
      {
        element: ".introjs-section-design",
        intro: "En esta sección ingresarás los datos relacionados con tú diseño que grabaras o cortaras."
      },
      {
        element: ".introjs-section-design-body",
        intro: "A continuación se ingresarán los datos relacionados con el diseño a grabar o cortar. En base a este diseño, se hará una proyección del retorno de tu inversión."
      },
      {
        element: ".introjs-section-design-body-width",
        intro: "Es la medida del ancho de tú diseño. En este ejemplo, pondremos una medida de 12cm que podría ser el ancho de una caratula de celular."
      },
      {
        element: ".introjs-section-design-body-large",
        intro: "Es la medida de largo de tú diseño. En este ejmplo, pondremos una medida de 20cm de largo de nuestra caratula para celular."
      },
      {
        element: ".introjs-section-design-body-minutes",
        intro: "Aquí ingresaremos la cantidad de tiempo que tardará nuestra máquina en hacer nuestro diseño. La cantidad de tiempo puede ser calculada con el software sagaon laser. En este ejemplo vamos a ingresar que la cantidad de minutos para hacer el diseño de nuestra caratula es de 25 minutos."
      },
      {
        element: ".introjs-section-design-body-pieces",
        intro: "En este campo se muestra el resultado de las piezas totales que puedes hacer según el tamaño del material y el área de trabajo de la máquina seleccionada anteriormente."
      },
      {
        element: ".introjs-section-design-body-pieces-leaf",
        intro: "En este campo se muestra el resultado de las piezas totales que puedes obtener en una lamina igual al área de trabajo de tu máquina. En nuestro ejemplo es de 30cm x 20cm."
      },
      {
        element: ".introjs-section-design-body-pieces-cost",
        intro: "En este campo se muestra el costo por pieza de tú diseño. Esto se cálcula en base al costo y el tamaño de la materia prima, además se toma en cuenta el tamaño del diseño ingresado."
      },
      {
        element: ".introjs-section-design-body-options",
        intro: "A continuación se muestran dos botones. Esto nos servirán para indicar si vamos a grabar o cortar únicamente o la otra opción que es grabar y cortar para el mismo diseño."
      },
      {
        element: ".introjs-section-design-body-option",
        intro: "En este ejemplo guiado, vamos a elegir la opción de cortar y grabar para nuestra caratula de celular."
      },
      {
        element: ".introjs-section-design-body-engrave",
        intro: "Aquí seleccionaremos el porcentaje de trabajado para el grabado del diseño."
      },
      {
        element: ".introjs-section-design-body-cut",
        intro: "Aquí seleccionaremos el porcentaje de trabajo para el corte del diseño."
      },
      {
        element: ".introjs-section-design-body-design",
        intro: "Aquí podrás subir tú diseño. Esto será de utilidad para poder darle un mejor formato a la hoja de resultados y también para poder ofrecerte un mejor servicio en el futuro."
      },
      {
        element: ".introjs-section-electricity",
        intro: `En esta sección se establecerán los datos del consumo eléctrico como por ejemplo: La categoría, la tarifa, mes o región en la categoría DAC.
      <div style="width: 100%; height: 250px; display: flex; justify-content: center;">
        <img src="./assets/images/tarifa_CFE.jpg" alt="" width="160px" height="100%">
      </div>
      `
      },
      {
        element: ".introjs-section-electricity-body",
        intro: "A continuación se ingresarán los datos según el tipo de tarifa que se muestre en nuestro recibo de pago de la CFE."
      },
      {
        element: ".introjs-section-electricity-body-options",
        intro: `En estas opciones se elige el tipo de tarifa que marca el recibo de pago de la CFE. Dicha opción la puedes encontrar en la parte señalada anteriormente en la imágen vista. En este ejemplo vamos a dejar la opción "Hogar" como seleccionada.`
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
        element: ".introjs-section-operator",
        intro: "En esta sección se establecerán los costos asociados con el operador de la máquina. Si bien los campos no son obligatorios es muy importante asignar un salario aunque el operador seas tu mismo, pues tú tiempo también vale. 😉"
      },
      {
        element: ".introjs-section-operator-body",
        intro: "Aquí se ingresarán los datos del operador de la máquina. Ingresaremos datos como las horas trabajas por mes asi como el salario."
      },
      {
        element: ".introjs-section-operator-body-salary",
        intro: "Aquí ingresaremos el salario del operador que percibe mensualmente. En nuestro ejemplo vamos a poner un salario de $ 6000 pesos mensuales."
      },
      {
        element: ".introjs-section-operator-body-hours",
        intro: "Aquí ingresaremos la cantidad de horas que trabaja el operador por mes. En este caso vamos a poner la cantidad de 80 horas mensuales."
      },
      {
        element: ".introjs-section-operator-body-result",
        intro: "A continuación se muestra el resultado del costo por hora de nuestro ejemplo según el salario y las horas de trabajo mensuales."
      },
      {
        element: ".introjs-section-product",
        intro: "En esta sección se establecerá el precio de venta de tu producto a tus clientes"
      },
      {
        element: ".introjs-section-product-body-price",
        intro: "Aquí se ingresará el precio al cual venderas el producto a tus clientes. En este ejemplo en particular vamos a poner un precio de venta de $ 100 pesos mexicanos."
      },
      {
        element: ".introjs-section-advanced",
        intro: "Esta sección esta dedicada a aquellos usuarios que desean obtener un costo más preciso en cuanto al gasto del consumo eléctrico."
      },
      {
        element: ".introjs-section-advanced-body",
        intro: "Aquí ingresaremos los datos de nuestro consumo actual que aparece en el medidor, así como de el consumo anterior que podemos obtenerlo en nuestro recibo de pago de la CFE. Esto nos será de utilidad pues la CFE cuenta con una serie de tarifas que varian según la cantidad de consumo eléctrico que usemos por periodo. En este caso lo dejaremos vacio."
      },
      {
        element: ".introjs-btn-calculate",
        intro: "Una vez llenado todos los datos vamos a proceder a calcular el resultado, para eso nos sirve el botón de calcular."
      },
      {
        element: ".introjs-section-result",
        intro: "A continuación se desglosa una tabla con los cálculos de los costos así como el retorno de la inversión para recuperar el dinero de la máquina."
      },
      {
        element: ".introjs-btn-pdf",
        intro: "Por último puedes generar un pdf con el resumen de los gastos, esto te puede ser de utilidad para mantener un registro interno de tus cálculos."
      },
      {
        intro: "Hemos terminado el tutorial. ¡Felicidades! Ahora te toca a ti realizar tus propios cálculos según tus propios parámetros."
      }
    ]
  }).oncomplete(function () {
    console.log("Completed")
    // window.location.href = "https://www.w3schools.com/bootstrap/bootstrap_tutorial.asp"
  }).onexit(function () {
    console.log("Ha salido")
    // window.location.href = "https://www.w3schools.com/bootstrap/bootstrap_tutorial.asp"
  }).onchange(function (targetElement) {
    if (targetElement.classList.contains("introjs-section-machine-body") ||
      targetElement.classList.contains("introjs-section-raw-body") ||
      targetElement.classList.contains("introjs-section-design-body") ||
      targetElement.classList.contains("introjs-section-electricity-body") ||
      targetElement.classList.contains("introjs-section-operator-body") ||
      targetElement.classList.contains("introjs-section-advanced-body")
    ) {
      console.log(targetElement.parentElement.parentElement.querySelector("h2 > button").click())
    }
    if (targetElement.classList.contains("introjs-section-product")) {
      console.log(document.querySelector(".introjs-section-product-body"))
      document.querySelector(".introjs-section-product-body").parentElement.parentElement.querySelector("h2 > button").click()
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
      if (targetElement.id === "calcular") {
        clickedCalculate()
      }
      if (targetElement.id === "cut-and-engrave") {
        changedOptionsMachineContainer(targetElement)
      }
      targetElement.click()
    }
    console.log("El elemento actual es: ", targetElement)
  }).start()
}