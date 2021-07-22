var inpLoc = require("./config.js").inputLocation,
  outpLoc = require("./config.js").outputLocation,
  JSONStream = require("JSONStream"),
  fs = require("fs");

function calcVal(BMI) {
  if (BMI>0 && BMI <= 18.4) return ["UnderWeight", "Malnutrition Risk"];
  else if (BMI >= 18.5 && BMI <= 24.9) return ["Normal Weight", "Low Risk"];
  else if (BMI >= 25 && BMI <= 29.9) return ["OverWeight", "Enhanced Risk"];
  else if (BMI >= 30 && BMI <= 34.9) return ["Moderately Obese", "Medium Risk"];
  else if (BMI >= 35 && BMI <= 39.9) return ["Severely Obese", "High Risk"];
  else if (BMI >= 40) return ["Very Severely Obese", "Very High Risk"];
  return ["error", "error"];
}

var stream = fs
  .createReadStream(inpLoc, { encoding: "utf8" })
  .pipe(JSONStream.parse("*"));

var OverWeightCount = 0,
  rowCount = 0;

stream.on("data", function (row) {
  let BMI = (row.WeightKg * 10000) / (row.HeightCm * row.HeightCm);
  row.BMI = BMI.toFixed(2);
  let arr = calcVal(row.BMI);
  row.Category = arr[0];
  if (row.BMI >= 25) ++OverWeightCount;
  row.HealthRisk = arr[1];
  console.log(row);
  ++rowCount;
  fs.appendFile(outpLoc, JSON.stringify(row), (err) => {
    if (err) console.log(err);
    else {
      console.log("Modified row added successfully\n");
    }
  });
  return row;
});

stream.on("end", function () {
  let str = "";
  str += "Number of rows added to the output file = " + rowCount + " \n";
  str += "The number of obese people in the given data = " + OverWeightCount;
  fs.writeFile("documentation.txt", str, (err) => {
    if (err) console.log(err);
    else {
      console.log("Added details to documentation");
    }
  });
});
