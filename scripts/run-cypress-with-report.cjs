"use strict";

const { spawn } = require("node:child_process");
const fs = require("node:fs/promises");
const path = require("node:path");
const { merge } = require("mochawesome-merge");
const marge = require("mochawesome-report-generator");

const projectRoot = path.resolve(__dirname, "..");

async function main() {
  const args = process.argv.slice(2);
  const shouldGenerateReport = args.includes("--report");
  const cypressArgs = args.filter((arg) => arg !== "--report");
  if (!shouldGenerateReport) {
    const cypressCli = getCypressCli();
    const cypressResult = await runCypress(cypressCli, cypressArgs);
    process.exitCode = cypressResult.code === 0 ? 0 : cypressResult.code || 1;
    return;
  }

  if (cypressArgs.includes("--headed")) {
    throw new Error(
      "Mochawesome reports are supported only for headless runs.",
    );
  }

  const runId = `${new Date().toISOString().replace(/[:.]/g, "-")}-${process.pid}`;
  const reportDir = path.join("e2e", "reports", runId);
  const absoluteReportDir = path.join(projectRoot, reportDir);
  const cypressCli = getCypressCli();
  const cypressResult = await runCypress(cypressCli, cypressArgs, reportDir);

  if (cypressResult.signal) {
    console.error(`Cypress was terminated by signal ${cypressResult.signal}.`);
  }

  let reportGenerated = false;
  try {
    const reportFiles = (await fs.readdir(absoluteReportDir))
      .filter((file) => file.endsWith(".json"))
      .map((file) => path.join(absoluteReportDir, file));

    if (reportFiles.length === 0) {
      throw new Error(`No Mochawesome JSON reports found in ${reportDir}.`);
    }

    const report = await merge({ files: reportFiles });
    await marge.create(report, {
      reportDir,
      reportFilename: "report",
      html: true,
      json: false,
    });
    reportGenerated = true;
    console.log(
      `Mochawesome HTML report generated: ${path.join(reportDir, "report.html")}`,
    );
  } catch (error) {
    console.error("Failed to generate the merged Mochawesome report:", error);
  }

  process.exitCode =
    cypressResult.code === 0 && reportGenerated ? 0 : cypressResult.code || 1;
}

function getCypressCli() {
  return path.resolve(
    path.dirname(require.resolve("cypress")),
    "..",
    "bin",
    "cypress",
  );
}

function runCypress(cypressCli, cypressArgs, reportDir) {
  return new Promise((resolve, reject) => {
    const env = { ...process.env };
    if (reportDir) {
      env["MOCHAWESOME_REPORT_DIR"] = reportDir;
    } else {
      delete env["MOCHAWESOME_REPORT_DIR"];
    }

    const child = spawn(process.execPath, [cypressCli, "run", ...cypressArgs], {
      cwd: projectRoot,
      env,
      stdio: "inherit",
    });

    child.once("error", reject);
    child.once("close", (code, signal) => resolve({ code, signal }));
  });
}

main().catch((error) => {
  console.error("Failed to run Cypress:", error);
  process.exitCode = 1;
});
