main()

function main() {
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
    disableInteraction: true,
    showBullets: false,
    // Show progress bar
    showProgress: true,
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
      intro: "Este es un recuadro de ayuda que te mostrará información detallada del campo en particular cuando pases el mouse por encima al finalizar el tutorial."
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
      intro: "Aquí se muestra un listado de máquinas. Seleccionaremos una y a continuación se mostrará el nombre de nuestra máquina."
    },
    {
      element: ".introjs-section-raw",
      intro: "En esta sección se te pedirán datos relacionados con el material que utilizas. Esto con la finalidad de poder realizar el cálculo del retorno de inversion sobre tú máquina."
    }
  ]
  }).oncomplete(function() {
    console.log("Completed")
    // window.location.href = "https://www.w3schools.com/bootstrap/bootstrap_tutorial.asp"
  }).onexit(function() {
    console.log("Ha salido")
    // window.location.href = "https://www.w3schools.com/bootstrap/bootstrap_tutorial.asp"
  }).onchange(function(targetElement) {
    if(targetElement.classList.contains("introjs-section-machine-body")) {
      console.log(targetElement.parentElement.parentElement.querySelector("h2 > button").click())
    }
    if(targetElement.classList.contains("introjs-section-machine-popover-1")) {
      showPopoverElements(getPopoverElements())
    }
    console.log(targetElement)
    if(targetElement.id === "listaMaquinasSelect") {
      targetElement.selectedIndex = 1
    }
  }).start()
}