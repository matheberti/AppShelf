var app = async function () {
  "use strict"

  let parameters = {}
  
  try {
    const paramRequest = await fetch("param.json")
    parameters = await paramRequest.json()
  } catch (error) {
    console.error("Erro ao carregar parâmetros:", error.message)
  }
  
  const titleElement = document.querySelector("h1")
  const compassIcon = document.getElementById("compass")
  const mapElement = document.getElementById("map")
  const menuFindButton = document.getElementById("find")
  const menuNotifyButton = document.getElementById("notify")
  const menuList = document.querySelector("ol")
  const listItems = document.querySelectorAll("li")

  const view = {
    setTitle(text) {
      titleElement.innerText = text
    },
    rotateCompass(degrees) {
      compassIcon.setAttribute("transform", `rotate(${degrees})`)
    },
    rotateMap(degrees) {
      mapElement.firstElementChild.setAttribute("transform", `rotate(${degrees})`)
    },
    zoomMap(viewBox) {
      mapElement.setAttribute("viewBox", viewBox)
    },
    toggleMenu() {
      menuList.classList.toggle("show")
    }
  }

  menuFindButton.addEventListener("click", view.toggleMenu)

  menuNotifyButton.addEventListener("click", async () => {
    const shareData = { title: "Territórios", text: JSON.stringify(parameters.t1) }

    try {
      await navigator.share(shareData)
    } catch {
      try {
        await navigator.clipboard.writeText(shareData.text)
        // Posso criar um elemento <dialog> e uma função setDialog que é mostrada pelo tempo que depende de string.length
        alert("Copiado para a área de transferência.")
      } catch {
        alert("Este dispositivo não me permite compartilhar informações com outros aplicativos.")
      }
    }
  })

  listItems.forEach(item => {
    item.addEventListener("click", () => {
      const { id, innerText } = item
      const { degrees, viewBox } = parameters[id]

      view.setTitle(innerText)
      view.rotateCompass(degrees)
      view.rotateMap(degrees)
      view.zoomMap(viewBox)
      view.toggleMenu()
      // Apagar números grandes
      // Mostrar detalhes do mapa escolhido
      // Vou precisar guardar estado para coordenar essas informações
    })
  })

  return { view, parameters }
}()


// Ao clicar, levar para um aplicativo de rotas (Google Maps, Waze etc.)
// Ao clicar e segurar, mudar para a cor escura e adicionar quadra à lista para informar