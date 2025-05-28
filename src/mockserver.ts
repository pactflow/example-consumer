import { spawn, ChildProcess } from "child_process";
import getPort from "get-port";
import waitPort from "wait-port";

let mockserverProcess: ChildProcess;
export const startMockServer = async (): Promise<string> => {
  console.log("starting mock server...");
  const port = await getPort();

  return new Promise((resolve, reject) => {
    mockserverProcess = spawn(
      "bin/quilt",
      [
        "mock",
        "--test-file",
        "/Users/matthew.fellows/development/public/api-testing-tool/quilt-cli/example/product.testcases.yaml",
        "--port",
        port.toString(),
        "--log-level",
        "error",
      ],
      {
        stdio: "inherit",
        shell: true,
        detached: true,
      }
    );
    mockserverProcess.on("error", (error: any) => {
      console.error(`error starting mock server: ${error.message}`);
      reject(error);
    });

    waitPort({ port: port, host: "localhost", output: "silent" })
      .then(() => {
        console.log(`mock server is ready on port ${port}`);
        resolve(`http://localhost:${port}`);
      })
      .catch((error) => {
        console.error(`Error waiting for port ${port}: ${error.message}`);
        reject(error);
      });
  });
};

export const stopMockServer = (): void => {
  if (mockserverProcess) {
    console.log("stopping mock server...");
    mockserverProcess.kill();
  } else {
    console.warn("No mock server process to stop.");
  }
};
