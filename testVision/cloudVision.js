const vision = require("@google-cloud/vision");
const fs = require("fs");
async function getTextFromImage(buffer) {
  const client = new vision.ImageAnnotatorClient({
    keyFilename: "kbocchi-1254b-firebase-adminsdk-9ltt9-16cf6fa56d.json",
  });
  try {
    const [result] = await client.textDetection(buffer);
    //   const detections1 = result.textAnnotations;
    const detections2 = result.fullTextAnnotation;
    console.log("TEXT: ");

    return detections2;
  } catch (err) {
    console.log(err);
    return err;
  }
  //   detections.forEach((d) => console.log(d));
  //   saveResults(detections1, "results");
  //   saveResults(detections2, "results");
}

// getTextFromImage("d");
function getIndex(url) {
  try {
    let { index } = JSON.parse(fs.readFileSync(url, "utf8"));
    console.log(index);
    let actualIndex = index;
    index++;
    let string = JSON.stringify({ index });
    fs.writeFileSync(url, string);
    return actualIndex;
  } catch (err) {
    console.log(err);
  }
}

function saveResults(result, folder) {
  try {
    let stringResults = JSON.stringify(result);
    let index = getIndex("index.json");
    let actualDate = Date.now();
    fs.writeFileSync(
      `${folder.toString()}/${actualDate}-test-${index}.json`,
      stringResults,
      { flag: "w" }
    );
  } catch (err) {
    console.log(err);
  }
}

async function validarCedulaOCR(nombre, cedula, buffer) {
    // let { text } = JSON.parse(
    //   fs.readFileSync("testVision/results/1685041364234-test-11.json", "utf8")
    // );
  try {
    let { text } = await getTextFromImage(buffer);
    let textEscapped = text.replace(/(\r\n|\n|\r)/gm, " ");
    console.log("ESCPAED: ", textEscapped);
    let nombreRegex = new RegExp(" " + nombre.toUpperCase().trim() + " ", "gm");
    let cedulaRegex = new RegExp(" " + cedula.trim() + " ", "gm");
    if (!nombreRegex.test(textEscapped))
      return {
        isValida: false,
        mensaje:
          "El nombre y apellidos ingresados no coinciden con los de la cedula",
      };
    if (!cedulaRegex.test(textEscapped))
      return {
        isValida: false,
        mensaje: "El número de cédula no concuerda con la cedula de la foto",
      };
    if (!/FISIOTERAPIA/.test(textEscapped)) {
      return {
        isValida: false,
        mensaje: "La cedula provista no es de fisioterapia",
      };
    }
    console.log("Nombre:", nombreRegex.test(textEscapped));
    console.log("Cedula:", cedulaRegex.test(textEscapped));
    console.log("Fisioterapia:", /FISIOTERAPIA/.test(textEscapped));
    return {
      isValida: true,
    };
  } catch (err) {
    console.log(err);
    return { isValida: false, mensaje: "ERROR" };
  }
}
// validateCedula("Veronica Berumen Avila", "6091402");
// const img = fs.readFileSync("prueba.jpeg");
// validateCedula("Veronica Berumen Avila","6091402",img);
module.exports = {
  validarCedulaOCR,
};
// getTextFromImage("./prueba.jpeg");
