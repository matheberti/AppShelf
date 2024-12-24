(async () => {
  "use strict"

  const coveredBlocks = new Set,
  i = document.querySelector("main"),
  handlePointerEvent = e => {
    if (e.target?.parentElement?.id !== "g" + t.dataset.n || t.dataset.n === "0" || window.visualViewport.scale > 1) return

    let target = e.target
    while (target.tagName !== "path") target = target.previousElementSibling

    let label = target.nextElementSibling.textContent
    if (target.nextElementSibling?.nextElementSibling?.tagName === "text") label += "/" + target.nextElementSibling.nextElementSibling.textContent
    
    if (e.type == "pointerup" && coveredBlocks.size === 0) {
      const [latitude, longitude] = parameters[target.parentElement.id.replace("g", "i")][label]
      window.location.href = `https://www.google.com/maps/dir/?api=1&travelmode=driving&destination=${latitude},${longitude}`
    }
    
    const hasAtt = target.hasAttribute("fill")

    if (e.type == "pointerup" && hasAtt) {
      remAtt(target, "fill")
      coveredBlocks.delete(label)
    }

    if (e.type == "pointercancel" && !hasAtt) {
      setAtt(target, "fill", "#333")
      coveredBlocks.add(label)
    }
  },
  forAll = (s, f) => document.querySelectorAll(s).forEach(f),
  listen = (l, t, f) => l.addEventListener(t, f),
  setAtt = (l, a, v) => a !== "t" ? l.setAttribute(a, v) : l.setAttribute("transform", `rotate(${v})`),
  remAtt = (l, a) => l.removeAttribute(a),
  modal = t => { m.textContent = t, a.showModal() },
  toggleU = () => u.classList.toggle("s"),
  clearBlocks = () => coveredBlocks.clear()

  let parameters
  try {
    parameters = await (await fetch("param.json")).json()
  } catch {
    modal("Não foi possível ativar a interação do mapa, verifique sua internet.")
  }

  listen(i, "pointerup", handlePointerEvent)
  listen(i, "pointercancel", handlePointerEvent)
  listen(a, "click", () => a.close())
  forAll("li", l => listen(l, "click", e => {
    const { degrees, viewBox } = parameters[e.target.id],
    hideAndShow = (h, s) => { h.classList.add("h"), s.classList.remove("h") }

    t.textContent = e.target.textContent
    t.dataset.n = e.target.id.slice(1)

    if (e.target.id === "i0") {
      hideAndShow(i0, b)
    } else {
      hideAndShow(b, i0)
      forAll(`#g${t.dataset.n} path`, p => setAtt(p, "style", "fill-opacity:1"))
    }
    setAtt(p, "viewBox", viewBox)
    setAtt(g, "t", degrees)
    setAtt(c, "t", degrees)
    toggleU()
  }))
  listen(f, "click", () => {
    toggleU()
    clearBlocks()

    if (t.dataset.n !== "0") {
      forAll(`#g${t.dataset.n} path`, p => { remAtt(p, "fill"), remAtt(p, "style") })
    }
  })
  listen(n, "click", async () => {
    if (coveredBlocks.size === 0) {
      modal("Nenhum território selecionado para informar.")
      return
    }

    const filled = [...coveredBlocks].sort().join(", ").replaceAll(",", (match, index, string) => index === string.lastIndexOf(match) ? " e" : match)
    const data = { text: `Ministério ${new Date().toLocaleDateString("pt-BR")}\nTerritório: ${t.dataset.n}\nQuadras: ${filled}\nObservações: ` }

    clearBlocks()
    forAll(`#g${t.dataset.n} path`, p => remAtt(p, "fill"))

    try {
      await navigator.share(data)
    } catch {
      try {
        await navigator.clipboard.writeText(data.text)
        modal("Copiado para a área de transferência.")
      } catch {
        modal("Este dispositivo não permite compartilhar informações com outros aplicativos.")
      }
    }
  })
})();
