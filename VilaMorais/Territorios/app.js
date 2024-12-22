var app = async function () {
  "use strict"

  let holdDetected, holdTimeout, parameters, pointerMoved
  const coveredBlocks = new Set(),
  mainElement = document.querySelector("main"),
  getBlockInfo = target => {
    if (target.parentElement.id.slice(1) !== title.dataset.number) {
      return { path: null, label: null }
    }
    while (target.tagName !== "path") target = target.previousElementSibling
    let label = target.nextElementSibling.textContent
    if (target.nextElementSibling?.nextElementSibling?.tagName === "text")
      label += `/${target.nextElementSibling.nextElementSibling.textContent}`
    return { path: target, label }
  },
  handlePointerDown = event => {
    holdDetected = false
    pointerMoved = false
    holdTimeout = setTimeout(() => {
      holdDetected = true
      const { path, label } = getBlockInfo(event.target)
      if (path && label && !path.hasAttribute("fill")) {
        navigator.vibrate(200)
        path.setAttribute("fill", "#333")
        coveredBlocks.add(label)
      }
    }, 500)
  },
  handlePointerMove = () => {
    clearTimeout(holdTimeout)
    pointerMoved = true
  },
  handlePointerUp = event => {
    clearTimeout(holdTimeout)
    if (holdDetected || pointerMoved) return
    const { path, label } = getBlockInfo(event.target)
    if (path && label && coveredBlocks.size === 0) {
      const territoryId = path.parentElement.id.replace("g", "t")
      const [lat, lon] = parameters[territoryId][label]
      window.location.href = `geo:${lat},${lon}`
    }
    if (path && label && path.hasAttribute("fill")) {
      path.removeAttribute("fill")
      coveredBlocks.delete(label)
    }
  },
  prepareData = territoryNumber => {
    const filled = [...coveredBlocks].sort().join(", ").replaceAll(",", (match, index, string) =>
      index === string.lastIndexOf(match) ? " e" : match
    )
    return {
      title: `Ministério ${new Date().toLocaleDateString("pt-BR")}`,
      text: `Território ${territoryNumber}\nQuadras trabalhadas: ${filled}\nObservações: `
    }
  },
  shareReport = async data => {
    try {
      await navigator.share(data)
    } catch {
      await navigator.clipboard.writeText(data.text)
      view.alert("Copiado para a área de transferência.")
    }
  },
  view = {
    alert: text => {
      message.innerText = text
      alerts.showModal()
    },
    setTitleText: text => title.innerText = text,
    setTitleData: number => title.dataset.number = number,
    rotateCompass: degrees => compass.setAttribute("transform", `rotate(${degrees})`),
    rotateMap: degrees => map.firstElementChild.setAttribute("transform", `rotate(${degrees})`),
    zoomMap: viewBox => map.setAttribute("viewBox", viewBox),
    toggleMenu: () => menu.classList.toggle("show"),
    home: () => {
      t0.classList.add("hide")
      numbers.classList.remove("hide")
    },
    territory: () => {
      t0.classList.remove("hide")
      numbers.classList.add("hide")
    },
    setPaths: number => {
      document.querySelectorAll(`#g${number} path`).forEach(path => {
        path.setAttribute("style", "fill-opacity:1")
      })
      mainElement.addEventListener("pointerdown", handlePointerDown)
      mainElement.addEventListener("pointermove", handlePointerMove)
      mainElement.addEventListener("pointerup", handlePointerUp)
    },
    unsetPaths: (number, removeListener = true) => {
      document.querySelectorAll(`#g${number} path`).forEach(path => {
        if (removeListener) path.removeAttribute("style")
        path.removeAttribute("fill")
      })
      if (removeListener) {
        mainElement.removeEventListener("pointerdown", handlePointerDown)
        mainElement.removeEventListener("pointermove", handlePointerMove)
        mainElement.removeEventListener("pointerup", handlePointerUp)
      }
    }
  }
    
  try {
    parameters = await (await fetch("param.json")).json()
  } catch (error) {
    view.alert("Não foi possível ativar a interação do mapa, verifique sua internet.")
  }

  document.getElementById("find").addEventListener("click", () => {
    const territoryNumber = title.dataset.number

    if (territoryNumber !== "0") view.unsetPaths(territoryNumber)
    view.toggleMenu()
    coveredBlocks.clear()
  })

  document.querySelectorAll("li").forEach(item => item.addEventListener("click", () => {
    const { id, innerText } = item, { degrees, viewBox } = parameters[id], cutId = id.slice(1)

    if (id === "t0") view.home()
    else {
      view.territory()
      view.setPaths(cutId)
    }
    view.setTitleText(innerText)
    view.setTitleData(cutId)
    view.rotateCompass(degrees)
    view.rotateMap(degrees)
    view.zoomMap(viewBox)
    view.toggleMenu()
  }))

  document.getElementById("notify").addEventListener("click", async () => {
    if (coveredBlocks.size === 0) {
      view.alert("Nenhum território selecionado para informar.")
      return
    }

    const territoryNumber = title.dataset.number,
    shareData = prepareData(territoryNumber)

    try {
      await shareReport(shareData)
    } catch {
      view.alert("Este dispositivo não permite compartilhar informações com outros aplicativos.")
    }

    view.unsetPaths(territoryNumber, false)
    coveredBlocks.clear()
  })

  document.getElementById("alerts").addEventListener("click", () => alerts.close())

  return view
}()
