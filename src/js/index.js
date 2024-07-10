import "regenerator-runtime/runtime";
import EasySeeSo from "seeso/easy-seeso";
import { showGaze } from "./showGaze";
import * as XLSX from "xlsx";

const licenseKey = "type key here";
const options = {
  timeZone: "Asia/Seoul",
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
};

let eyetrackingLogs = [];

function onClickCalibrationBtn() {
  const userId = "USERID";
  const redirectUrl = "http://localhost:8082";
  const calibrationPoint = 5;
  EasySeeSo.openCalibrationPage(
    licenseKey,
    userId,
    redirectUrl,
    calibrationPoint
  );
  calibrationButton.disabled = true;
}

function onClickInitBtn() {
  eyetrackingLogs = [];
  alert(eyetrackingLogs + "로그 초기화 성공");
}

function onClickExtractLogBtn() {
  const worksheet = XLSX.utils.json_to_sheet(eyetrackingLogs);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Eyetracking Logs");
  XLSX.writeFile(workbook, "eyetracking_logs.xlsx");
}

function onDebug() {}

function parseCalibrationDataInQueryString() {
  const href = window.location.href;
  const decodedURI = decodeURI(href);
  const queryString = decodedURI.split("?")[1];
  if (!queryString) return undefined;
  const jsonString = queryString.slice(
    "calibrationData=".length,
    queryString.length
  );
  return jsonString;
}

function onGaze(gazeInfo) {
  const log = {
    timestamp: new Date().toLocaleString("ko-KR", options),
    x: gazeInfo.x,
    y: gazeInfo.y,
    eyemovementState: gazeInfo.eyemovementState,
  };
  eyetrackingLogs.push(log);
  showGaze(gazeInfo);
}

async function main() {
  const calibrationData = parseCalibrationDataInQueryString();
  const InitializeButton = document.getElementById("initButton");
  const ExtractLogButton = document.getElementById("extractLogButton");

  InitializeButton.addEventListener("click", onClickInitBtn);
  ExtractLogButton.addEventListener("click", onClickExtractLogBtn);

  if (calibrationData) {
    const seeSo = new EasySeeSo();
    await seeSo.init(
      licenseKey,
      async () => {
        await seeSo.startTracking(onGaze, onDebug);
        await seeSo.setCalibrationData(calibrationData);
      },
      () => console.log("callback when init failed.")
    );
  } else {
    console.log("No calibration data given.");
    const calibrationButton = document.getElementById("calibrationButton");
    calibrationButton.disabled = false;
    calibrationButton.addEventListener("click", onClickCalibrationBtn);
  }
}

(async () => {
  await main();
})();
