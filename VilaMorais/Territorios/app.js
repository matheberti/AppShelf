var app = async function () {
  "use strict"

  let parameters
  let holdTimeout = null
  let holdDetection = false

  try {
    parameters = await (await fetch("param.json")).json()
  } catch (error) {
    console.error("Error loading parameters:", error)
  }

  const coveredBlocks = [],
  getBlockInfo = target => {
    while (target.tagName !== "path") target = target.previousElementSibling
    let label = target.nextElementSibling.textContent
    if (target.nextElementSibling?.nextElementSibling?.tagName === "text")
      label += `/${target.nextElementSibling.nextElementSibling.textContent}`
    return { path: target, label }
  },
  handlePointerDown = event => {
    holdTimeout = setTimeout(() => {
      const { path, label } = getBlockInfo(event.target)
      holdDetection = true
      
      if (!path.hasAttribute("fill")) {
        navigator.vibrate(200)
        path.setAttribute("fill", "#333")
        coveredBlocks.push(label)
      }
    }, 500)
  },
  handlePointerUp = event => {
    clearTimeout(holdTimeout)
    const { path, label } = getBlockInfo(event.target)

    if (holdDetection) {
      holdDetection = false
      return
    }

    if (coveredBlocks.length === 0) {
      const [lat, lon] = parameters["t1"]["bA"]
      window.location.href = `geo:${lat},${lon}`
    }

    if (path.hasAttribute("fill")) {
      path.removeAttribute("fill")
      coveredBlocks.splice(coveredBlocks.indexOf(label), 1)
    }
  },
  view = {
    setTitleText: text => title.innerText = text,
    setTitleData: number => title.dataset.number = number,
    rotateCompass: degrees => compass.setAttribute("transform", `rotate(${degrees})`),
    rotateMap: degrees => map.firstElementChild.setAttribute("transform", `rotate(${degrees})`),
    zoomMap: viewBox => map.setAttribute("viewBox", viewBox),
    toggleMenu: () => menu.classList.toggle("show"),
    toggleMoreElements: isHome => {
      if (isHome) {
        t0.classList.add("hide")
        numbers.classList.remove("hide")
      } else {
        t0.classList.remove("hide")
        numbers.classList.add("hide")
      }
    },
    setPaths: number => document.querySelectorAll(`#g${number} path`).forEach(path => {
      path.setAttribute("style", "fill-opacity:1")
      path.addEventListener("pointerdown", handlePointerDown)
      path.addEventListener("pointerup", handlePointerUp)
      path.nextElementSibling.addEventListener("pointerdown", handlePointerDown)
      path.nextElementSibling.addEventListener("pointerup", handlePointerUp)
      if (path.nextElementSibling?.nextElementSibling?.tagName === "text") {
        path.nextElementSibling.nextElementSibling.addEventListener("pointerdown", handlePointerDown)
        path.nextElementSibling.nextElementSibling.addEventListener("pointerup", handlePointerUp)
      }
    }),
    unsetPaths: (number, removeListeners = true) => document.querySelectorAll(`#g${number} path`).forEach(path => {
      path.removeAttribute("fill")
      if (removeListeners) {
        path.removeAttribute("style")
        path.removeEventListener("pointerdown", handlePointerDown)
        path.removeEventListener("pointerup", handlePointerUp)
        path.nextElementSibling.removeEventListener("pointerdown", handlePointerDown)
        path.nextElementSibling.removeEventListener("pointerup", handlePointerUp)
        if (path.nextElementSibling?.nextElementSibling?.tagName === "text") {
          path.nextElementSibling.nextElementSibling.removeEventListener("pointerdown", handlePointerDown)
          path.nextElementSibling.nextElementSibling.removeEventListener("pointerup", handlePointerUp)
        }
      }
    })
  }

  document.getElementById("find").addEventListener("click", () => {
    const territoryNumber = title.dataset.number
    if (territoryNumber !== "0") view.unsetPaths(territoryNumber)
    view.toggleMenu()
    coveredBlocks.splice(0)
  })

  document.querySelectorAll("li").forEach(item => {
    item.addEventListener("click", () => {
      const { id, innerText } = item,
      { degrees, viewBox } = parameters[id],
      idNumber = id.slice(1)
      
      if (idNumber !== "0") view.setPaths(idNumber)
      view.setTitleText(innerText)
      view.setTitleData(idNumber)
      view.rotateCompass(degrees)
      view.rotateMap(degrees)
      view.zoomMap(viewBox)
      view.toggleMenu()
      view.toggleMoreElements(id === "t0")
    })
  })
  
  document.getElementById("notify").addEventListener("click", async () => {
    if (coveredBlocks.length === 0) {
      // TODO: create a <dialog> element to replace alert
      alert("Nenhum território selecionado para informar.")
      return
    }

    const territoryNumber = title.dataset.number,
      shareData = {
        title: `Ministério ${new Date().toLocaleDateString("pt-BR")}`,
        text: `Território ${territoryNumber}\n`
      },
      filled = coveredBlocks.sort().join(", ").replaceAll(",", (match, index, string) =>
        index === string.lastIndexOf(match) ? " e" : match
      )
    shareData.text += `Quadras trabalhadas: ${filled}\nObservações: `

    try {
      await navigator.share(shareData)
    } catch {
      try {
        await navigator.clipboard.writeText(shareData.text)
        // TODO: create a <dialog> element to replace alert
        alert("Copiado para a área de transferência.")
      } catch {
        // TODO: create a <dialog> element to replace alert
        alert("Este dispositivo não permite compartilhar informações com outros aplicativos.")
      }
    }

    view.unsetPaths(territoryNumber, false)
    coveredBlocks.splice(0)
  })

  return { view, parameters }
}()
