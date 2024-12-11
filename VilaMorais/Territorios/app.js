var app = async function () {
  "use strict"

  let parameters
  let holdTimeOut = 0
  let holdDetection = false
  const shareData = { title: `Ministério ${new Date(Date.now()).toLocaleDateString("pt-BR")}`, text: "" }

  try {
    parameters = await (await fetch("param.json")).json()
  } catch (error) {
    console.error("Erro ao carregar parâmetros:", error.message)
  }

  const titleElement = document.querySelector("h1"),
    compassIcon = document.getElementById("compass"),
    mapElement = document.getElementById("map"),
    menuFindButton = document.getElementById("find"),
    menuNotifyButton = document.getElementById("notify"),
    menuList = document.querySelector("ol"),
    listItems = document.querySelectorAll("li"),
    labels = document.getElementById("numbers"),
    view = {
      setTitleText(text) {
        titleElement.innerText = text
      },
      setTitleData(number) {
        titleElement.dataset.number = number
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
      },
      hide(element) {
        element.classList.add("hide")
      },
      show(element) {
        element.classList.remove("hide")
      },
      handlePointerDown(event) {
        holdTimeOut = setTimeout(() => {
          holdDetection = true

          let eventTarget = event.target
          
          while (eventTarget.tagName !== "path") {
            eventTarget = eventTarget.previousElementSibling
          }

          let targetLabel = eventTarget.nextElementSibling.textContent

          if (eventTarget.nextElementSibling.nextElementSibling && eventTarget.nextElementSibling.nextElementSibling.tagName === "text")
            targetLabel += `/${eventTarget.nextElementSibling.nextElementSibling.textContent}`

          if (eventTarget.attributes.getNamedItem("fill") == null) {
            navigator.vibrate(200)
            eventTarget.setAttribute("fill", "#333")
            shareData.text += targetLabel + "\n"
          }
        }, 500)
      },
      handlePointerUp(event) {
        clearTimeout(holdTimeOut)
        
        if (!holdDetection) {
          let eventTarget = event.target
          
          while (eventTarget.tagName !== "path") {
            eventTarget = eventTarget.previousElementSibling
          }
          
          let anySelected = false
          const territoryNumber = titleElement.dataset.number

          if (territoryNumber !== "0") {
            document.querySelectorAll(`#g${territoryNumber} path`).forEach(block => {
              if (block.attributes.getNamedItem("fill") !== null) {
                anySelected = true
              }
            })
          }

          if (!anySelected) {
            const [lat, lon] = parameters["t1"]["bA"]
            window.location.href = `geo:${lat},${lon}`
          }

          if (eventTarget.attributes.getNamedItem("fill") !== null)
            eventTarget.removeAttribute("fill")
        }

        holdDetection = false
      }
    }

  let lastItem

  menuFindButton.addEventListener("click", () => {
    view.toggleMenu()

    shareData.text = ""

    const territoryNumber = titleElement.dataset.number

    if (territoryNumber !== "0") {
      document.querySelectorAll(`#g${territoryNumber} path`).forEach(block => {
        block.removeAttribute("fill")
        block.removeAttribute("style")

        block.removeEventListener("pointerdown", view.handlePointerDown)
        block.nextElementSibling.removeEventListener("pointerdown", view.handlePointerDown)
        if (block.nextElementSibling.nextElementSibling && block.nextElementSibling.nextElementSibling.tagName === "text")
          block.nextElementSibling.nextElementSibling.removeEventListener("pointerdown", view.handlePointerDown)

        block.removeEventListener("pointerup", view.handlePointerUp)
        block.nextElementSibling.removeEventListener("pointerup", view.handlePointerUp)
        if (block.nextElementSibling.nextElementSibling && block.nextElementSibling.nextElementSibling.tagName === "text")
          block.nextElementSibling.nextElementSibling.removeEventListener("pointerup", view.handlePointerUp)
      })
    }
  })

  listItems.forEach(item => {
    if (item.innerText === titleElement.innerText) {
      lastItem = item
    }

    item.addEventListener("click", () => {
      const { id, innerText } = item,
        { degrees, viewBox } = parameters[id],
        territoryNumber = id.slice(1)

      shareData.text = `Território ${territoryNumber}, quadras:\n`

      document.querySelectorAll(`#g${territoryNumber} path`).forEach(block => {
        block.addEventListener("pointerdown", view.handlePointerDown)
        block.nextElementSibling.addEventListener("pointerdown", view.handlePointerDown)
        if (block.nextElementSibling.nextElementSibling && block.nextElementSibling.nextElementSibling.tagName === "text")
          block.nextElementSibling.nextElementSibling.addEventListener("pointerdown", view.handlePointerDown)

        block.addEventListener("pointerup", view.handlePointerUp)
        block.nextElementSibling.addEventListener("pointerup", view.handlePointerUp)
        if (block.nextElementSibling.nextElementSibling && block.nextElementSibling.nextElementSibling.tagName === "text")
          block.nextElementSibling.nextElementSibling.addEventListener("pointerup", view.handlePointerUp)

        block.setAttribute("style", "fill-opacity:1")
      })

      if (id === "t0") view.show(labels)
      else view.hide(labels)

      view.setTitleText(innerText)
      view.setTitleData(territoryNumber)
      view.rotateCompass(degrees)
      view.rotateMap(degrees)
      view.zoomMap(viewBox)
      view.toggleMenu()
      view.hide(item)
      view.show(lastItem)
      lastItem = item
    })
  })
  
  menuNotifyButton.addEventListener("click", async () => {
    shareData.text += "Observações: "

    try {
      await navigator.share(shareData)
    } catch {
      try {
        await navigator.clipboard.writeText(shareData.text)
        // TODO: create a <dialog> element to replace alert
        alert("Copiado para a área de transferência.")
      } catch {
        // TODO: create a <dialog> element to replace alert
        alert("Este dispositivo não me permite compartilhar informações com outros aplicativos.")
      }
    }

    const territoryNumber = titleElement.dataset.number,
      blocks = document.querySelectorAll(`#g${territoryNumber} path`)
    blocks.forEach(block => {
      block.removeAttribute("fill")
    })
    shareData.text = `Território ${territoryNumber}, quadras:\n`
  })

  return { view, parameters }
}()
