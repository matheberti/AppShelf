var app = function () {
  "use strict"

  const titleElement = document.querySelector("h1")
  const compassIcon = document.getElementById("compass")
  const mapElement = document.getElementById("map")
  const menuFindButton = document.getElementById("find")
  const menuNotifyButton = document.getElementById("notify")
  const menuList = document.querySelector("ol")
  const listItems = document.querySelectorAll("li")

  const parameters = {
    t0: { degrees: "0", viewBox: "0 0 13312 15360" },
    t1: { degrees: "0", viewBox: "441 4664 2257 1813" },
    t2: { degrees: "0", viewBox: "898 6299 1706 514" },
    t3: { degrees: "0", viewBox: "952 6869 1536 1183" },
    t4: { degrees: "-21.825", viewBox: "4912 5266 738 1391" },
    t5: { degrees: "0", viewBox: "165 6610 1195 2422" },
    t6: { degrees: "0", viewBox: "1018 7668 1719 1476" },
    t7: { degrees: "0", viewBox: "298 8688 1570 1545" },
    t8: { degrees: "0", viewBox: "765 9909 1518 1375" },
    t9: { degrees: "0", viewBox: "1563 8903 1195 1323" },
    t10: { degrees: "0", viewBox: "2109 8377 1543 1397" },
    t11: { degrees: "0", viewBox: "2803 7798 882 835" },
    t12: { degrees: "0", viewBox: "3033 7005 675 1004" },
    t13: { degrees: "0", viewBox: "1318 10142 1574 1146" },
    t14: { degrees: "0", viewBox: "883 11327 848 1091" },
    t15: { degrees: "0", viewBox: "1767 10921 1724 964" },
    t16: { degrees: "0", viewBox: "993 12339 820 1624" },
    t17: { degrees: "0", viewBox: "1805 11628 1400 1412" },
    t18: { degrees: "0", viewBox: "1136 13400 722 1874" },
    t19: { degrees: "0", viewBox: "1649 12745 850 1374" },
    t20: { degrees: "0", viewBox: "2626 9604 1388 1310" },
    t21: { degrees: "0", viewBox: "3192 8449 1571 1561" },
    t22: { degrees: "0", viewBox: "3719 6536 1409 2055" },
    t23: { degrees: "0", viewBox: "3973 7263 1522 1544" },
    t24: { degrees: "0", viewBox: "4757 6405 1581 1331" },
    t25: { degrees: "0", viewBox: "2508 3589 5212 3309" },
    t26: { degrees: "0", viewBox: "5959 6562 2266 1917" },
    t27: { degrees: "0", viewBox: "4976 7436 1693 1838" },
    t28: { degrees: "0", viewBox: "5833 7934 1517 1564" },
    t29: { degrees: "0", viewBox: "4048 8378 3601 2266" },
    t30: { degrees: "0", viewBox: "9802 1216 1724 2370" },
    t31: { degrees: "0", viewBox: "8746 3136 1995 2333" },
    t32: { degrees: "0", viewBox: "5332 4926 5118 2009" }
  }

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
    })
  })

  return { view, parameters }
}()
