const puppeteer = require("puppeteer");
const fs = require("fs/promises");
async function scrapCedula(numero_cedula) {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(
    "https://www.cedulaprofesional.sep.gob.mx/cedula/presidencia/indexAvanzada.action",
    { timeout: 90000 }
  );

  await page.evaluate(() =>
    document
      .querySelector(
        "#subenlaces > ul > li:nth-child(2) > ul > li:nth-child(2) > a"
      )
      .click()
  );
  await page.type("#idCedula", `${numero_cedula}`);
  //3339300
  //3339201
  await page.evaluate(() =>
    document.querySelector("#dijit_form_Button_1_label").click()
  );
  try {
    await page.waitForSelector("#custom_MyDialog_0", { timeout: 8000 });
    console.log("No se encontro nada");
    let response = {
      mensaje: "No se encontro la cedula",
    };
    page.close();
    browser.close();
    return response;
  } catch (err) {
    console.log("Se encontro algo");

    let data = await page.evaluate(() => {
      let dataCols = document.querySelector(
        "#dojox_grid__View_1 > div > div > div > div.dojoxGridRow.dojoxGridRow > table > tbody > tr"
      );
      let childNodes = Array.from(dataCols.childNodes);
      let array = childNodes.map((col) => col.innerText);
      return array;
    });

    console.log("SCRAPPED DATA: ", data);
    let response = {
      numero_cedula: data[0],
      nombre: data[1],
      apellido_paterno: data[2],
      apellido_materno: data[3],
      tipo: data[4],
    };
    console.log("RESPONSE: ", response);
    page.close();
    browser.close();
    return response;
  }
}

module.exports = {
  scrapCedula,
};
