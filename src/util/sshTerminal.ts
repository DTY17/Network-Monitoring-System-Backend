import { Client } from "ssh2";
import type { WebSocket } from "ws";
import SyslogMessage from "../model/notification.js";
import System from "../model/deviceDetails.js";
import NatMapping from "../model/natMapping.js";

function sendJSON(
  ws: WebSocket,

  data: object,
) {
  if (ws.readyState === 1) {
    ws.send(JSON.stringify(data));
  }
}

export async function createSSHTerminal(
  ws: WebSocket,

  notificationId: string,
) {
  let sshClient: Client | null = null;

  let shellStream: any = null;

  try {
    // =====================================================

    // 1. FIND SYSLOG NOTIFICATION

    // =====================================================

    const notification = await SyslogMessage.findById(notificationId);

    if (!notification) {
      console.error(`❌ Syslog not found: ${notificationId}`);

      sendJSON(ws, {
        type: "error",

        message: "Syslog notification not found",
      });

      ws.close();

      return;
    }

    // =====================================================

    // 2. GET ORIGINAL DEVICE IP

    //

    // Example:

    //

    // 4.4.4.4

    //

    // This is the identity of the device that

    // generated the syslog message.

    // =====================================================

    let deviceIp = notification.ipAddress;

    if (typeof deviceIp !== "string" || deviceIp.trim() === "") {
      sendJSON(ws, {
        type: "error",

        message: "IP address is not available for this syslog",
      });

      ws.close();

      return;
    }

    deviceIp = deviceIp.trim();

    // =====================================================

    // 3. NORMALIZE DEVICE IP

    //

    // If database contains:

    //

    // 4.4.4.4:22

    //

    // convert to:

    //

    // 4.4.4.4

    // =====================================================

    const ipMatch = deviceIp.match(/^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/);

    if (ipMatch?.[1]) {
      deviceIp = ipMatch[1];
    }

    console.log("\n==========================================");

    console.log("🖥️ ORIGINAL DEVICE");

    console.log("==========================================");

    console.log(
      "Device IP:",
      deviceIp,
    );

    // =====================================================

    // 4. FIND NAT MAPPING

    //

    // Example:

    //

    // sourceIp: 4.4.4.4

    // natHost: 192.168.75.139

    // natPort: 2224

    // =====================================================

    const natMapping = await NatMapping.findOne({
      sourceIp: deviceIp,
    }).lean();

    if (!natMapping) {
      console.error(`❌ No NAT mapping found for ${deviceIp}`);

      sendJSON(ws, {
        type: "error",

        message: `No NAT mapping found for device ${deviceIp}`,
      });

      ws.close();

      return;
    }

    // =====================================================

    // 5. GET NAT HOST

    // =====================================================

    const natHostValue = natMapping.natHost;

    if (typeof natHostValue !== "string" || natHostValue.trim() === "") {
      console.error(`❌ NAT host missing for ${deviceIp}`);

      sendJSON(ws, {
        type: "error",

        message: `NAT host is missing for device ${deviceIp}`,
      });

      ws.close();

      return;
    }

    const sshHost = natHostValue.trim();

    // =====================================================

    // 6. GET NAT PORT

    // =====================================================

    const natPortValue = natMapping.natPort;

    if (
      typeof natPortValue !== "number" ||
      !Number.isInteger(natPortValue) ||
      natPortValue <= 0 ||
      natPortValue > 65535
    ) {
      console.error(
        `❌ Invalid NAT port for ${deviceIp}:`,

        natPortValue,
      );

      sendJSON(ws, {
        type: "error",

        message: `Invalid NAT port for device ${deviceIp}`,
      });

      ws.close();

      return;
    }

    const sshPort = natPortValue;

    // =====================================================

    // 7. NAT DEBUG

    // =====================================================

    console.log("\n==========================================");

    console.log("🌐 NAT MAPPING");

    console.log("==========================================");

    console.log(
      "Source IP:",

      deviceIp,
    );

    console.log(
      "NAT Host:",

      sshHost,
    );

    console.log(
      "NAT Port:",

      sshPort,
    );

    console.log(
      "SSH Target:",

      `${sshHost}:${sshPort}`,
    );

    // =====================================================

    // 8. FIND DEVICE CREDENTIALS

    //

    // IMPORTANT:

    //

    // Your System collection stores the actual

    // reachable SSH host.

    //

    // Therefore use:

    //

    // 192.168.75.139

    //

    // NOT:

    //

    // 4.4.4.4

    // =====================================================

    console.log(
      "\n🔐 Looking up SSH credentials for:",

      sshHost,
    );

    const device = await System.findOne({
      ipAddress: sshHost,
    }).select("+password");

    if (!device) {
      console.error(`❌ No device found for SSH host ${sshHost}`);

      sendJSON(ws, {
        type: "error",

        message: `No device found for SSH host ${sshHost}`,
      });

      ws.close();

      return;
    }

    console.log(
      "✅ Device found:",

      device.hostname,
    );

    // =====================================================

    // 9. VALIDATE USERNAME

    // =====================================================

    if (typeof device.username !== "string" || device.username.trim() === "") {
      sendJSON(ws, {
        type: "error",

        message: `SSH username is missing for ${sshHost}`,
      });

      ws.close();

      return;
    }

    const username = device.username.trim();

    // =====================================================

    // 10. VALIDATE PASSWORD

    // =====================================================

    if (typeof device.password !== "string" || device.password === "") {
      sendJSON(ws, {
        type: "error",

        message: `SSH password is missing for ${sshHost}`,
      });

      ws.close();

      return;
    }

    const password = device.password;

    // =====================================================

    // 11. HOSTNAME

    // =====================================================

    const hostname =
      typeof device.hostname === "string" && device.hostname.trim() !== ""
        ? device.hostname.trim()
        : deviceIp;

    console.log("\n==========================================");

    console.log("🔐 SSH INFORMATION");

    console.log("==========================================");

    console.log(
      "Device IP:",

      deviceIp,
    );

    console.log(
      "SSH Host:",

      sshHost,
    );

    console.log(
      "SSH Port:",

      sshPort,
    );

    console.log(
      "SSH Target:",

      `${sshHost}:${sshPort}`,
    );

    console.log(
      "Hostname:",

      hostname,
    );

    console.log(
      "Username:",

      username,
    );

    console.log("==========================================");

    // =====================================================

    // 12. CREATE SSH CLIENT

    // =====================================================

    sshClient = new Client();

    // =====================================================

    // 13. SSH ERROR

    // =====================================================

    sshClient.on(
      "error",

      (error) => {
        console.error("\n❌ INTERACTIVE SSH ERROR");

        console.error(
          "Device IP:",

          deviceIp,
        );

        console.error(
          "SSH Target:",

          `${sshHost}:${sshPort}`,
        );

        console.error(
          "Error:",

          error.message,
        );
        console.log(error.message)

        sendJSON(ws, {
          type: "error",
          message: error.message,
        });
      },
    );

    // =====================================================

    // 14. SSH CLOSE

    // =====================================================

    sshClient.on(
      "close",

      () => {
        console.log(`🔌 SSH session closed: ${sshHost}:${sshPort}`);

        sendJSON(ws, {
          type: "close",

          message: "SSH connection closed",
        });

        if (ws.readyState === 1) {
          ws.close();
        }
      },
    );

    // =====================================================

    // 15. SSH READY

    // =====================================================

    sshClient.on(
      "ready",

      () => {
        console.log("\n==========================================");

        console.log("✅ INTERACTIVE SSH CONNECTED");

        console.log("==========================================");

        console.log(
          "Device IP:",

          deviceIp,
        );

        console.log(
          "SSH Host:",

          sshHost,
        );

        console.log(
          "SSH Port:",

          sshPort,
        );

        console.log(
          "SSH Target:",

          `${sshHost}:${sshPort}`,
        );

        console.log("==========================================");

        // =================================================

        // SEND CONNECTION INFORMATION TO FRONTEND

        // =================================================

        sendJSON(ws, {
          type: "connected",

          data: {
            hostname: hostname,

            // Original device identity

            ipAddress: deviceIp,

            // Actual NAT SSH endpoint

            sshHost: sshHost,

            sshPort: sshPort,

            username: username,
          },
        });

        // =================================================

        // OPEN CISCO SHELL

        // =================================================

        sshClient!.shell(
          {
            term: "xterm",

            cols: 120,

            rows: 30,
          },

          (error, stream) => {
            if (error) {
              console.error(
                "❌ SSH shell error:",

                error,
              );

              sendJSON(ws, {
                type: "error",

                message: error.message,
              });

              sshClient?.end();

              return;
            }

            shellStream = stream;

            // =============================================

            // ROUTER OUTPUT

            // =============================================

            stream.on(
              "data",

              (data: Buffer) => {
                sendJSON(ws, {
                  type: "output",

                  data: data.toString(),
                });
              },
            );

            // =============================================

            // STDERR

            // =============================================

            stream.stderr.on(
              "data",

              (data: Buffer) => {
                sendJSON(ws, {
                  type: "output",

                  data: data.toString(),
                });
              },
            );

            // =============================================

            // SHELL CLOSE

            // =============================================

            stream.on(
              "close",

              () => {
                console.log("🔌 Cisco shell closed");

                shellStream = null;

                sshClient?.end();

                if (ws.readyState === 1) {
                  ws.close();
                }
              },
            );
          },
        );
      },
    );

    // // =====================================================
    // // 16. WEBSOCKET MESSAGE
    // // =====================================================

    // ws.on("message", (message) => {
    //   if (!shellStream) {
    //     return;
    //   }

    //   const rawMessage = message.toString().trim();

    //   // Ignore empty messages before attempting JSON parsing.
    //   if (!rawMessage) {
    //     console.warn("⚠️ Empty WebSocket message ignored");
    //     return;
    //   }

    //   let parsed: any;

    //   try {
    //     parsed = JSON.parse(rawMessage);
    //   } catch {
    //     console.error(
    //       "❌ Invalid WebSocket JSON received:",
    //       JSON.stringify(rawMessage),
    //     );
    //     return;
    //   }

    //   if (!parsed || typeof parsed !== "object") {
    //     console.warn("⚠️ Unsupported WebSocket message:", rawMessage);
    //     return;
    //   }

    //   // TERMINAL INPUT
    //   if (parsed.type === "input") {
    //     if (typeof parsed.data === "string") {
    //       shellStream.write(parsed.data);
    //     }
    //     return;
    //   }

    //   // TERMINAL RESIZE
    //   if (parsed.type === "resize") {
    //     const cols = Number(parsed.cols);
    //     const rows = Number(parsed.rows);

    //     if (
    //       Number.isInteger(cols) &&
    //       Number.isInteger(rows) &&
    //       cols > 0 &&
    //       rows > 0
    //     ) {
    //       shellStream.setWindow(rows, cols, 0, 0);
    //     }
    //     return;
    //   }

    //   console.warn("⚠️ Unknown WebSocket message type:", parsed.type);
    // });

    // =====================================================
    // 16. WEBSOCKET MESSAGE
    // =====================================================

    ws.on("message", (message) => {
      const rawMessage = message.toString();

      // Ignore genuinely empty messages.
      if (rawMessage.length === 0) {
        return;
      }

      // The shell must be ready before input can be forwarded.
      if (!shellStream) {
        console.warn(
          "⚠️ SSH shell is not ready; input ignored:",
          JSON.stringify(rawMessage),
        );
        return;
      }

      let parsed: any;

      try {
        parsed = JSON.parse(rawMessage);
      } catch {
        // Support raw xterm keyboard input, such as individual
        // characters and Enter, if the frontend sends raw data.
        console.log("⌨️ Raw terminal input:", JSON.stringify(rawMessage));

        shellStream.write(rawMessage);
        return;
      }

      if (!parsed || typeof parsed !== "object") {
        console.warn("⚠️ Unsupported WebSocket message:", parsed);
        return;
      }

      // TERMINAL INPUT
      if (parsed.type === "input") {
        if (typeof parsed.data === "string") {
          console.log("⌨️ Terminal input:", JSON.stringify(parsed.data));

          shellStream.write(parsed.data);
        } else {
          console.warn("⚠️ Invalid terminal input message:", parsed);
        }

        return;
      }

      // TERMINAL RESIZE
      if (parsed.type === "resize") {
        const cols = Number(parsed.cols);
        const rows = Number(parsed.rows);

        if (
          Number.isInteger(cols) &&
          Number.isInteger(rows) &&
          cols > 0 &&
          rows > 0
        ) {
          shellStream.setWindow(rows, cols, 0, 0);
        }

        return;
      }

      console.warn("⚠️ Unknown WebSocket message type:", parsed.type);
    });

    // =====================================================
    // 17. BROWSER WEBSOCKET CLOSED
    // =====================================================

    ws.on(
      "close",

      () => {
        console.log("🔌 Browser WebSocket closed");

        try {
          if (shellStream) {
            shellStream.end();

            shellStream = null;
          }
        } catch {}

        try {
          if (sshClient) {
            sshClient.end();

            sshClient = null;
          }
        } catch {}
      },
    );

    // =====================================================

    // 18. ACTUAL SSH CONNECTION

    //

    // THIS IS THE IMPORTANT PART

    //

    // NOT:

    //

    // host: deviceIp

    // port: 22

    //

    // INSTEAD:

    //

    // host: sshHost

    // port: sshPort

    //

    // Example:

    //

    // 4.4.4.4

    //      ↓

    // 192.168.75.139:2224

    //

    // =====================================================

    console.log(`🚀 Connecting SSH to ${sshHost}:${sshPort}...`);

    sshClient.connect({
      host: sshHost,
      port: sshPort,
      username: username,
      password: password,
      readyTimeout: 1000000,
      keepaliveInterval: 5000,
      keepaliveCountMax: 2,
      algorithms: {
        kex: ["diffie-hellman-group1-sha1", "diffie-hellman-group14-sha1"],
        cipher: ["aes128-cbc", "3des-cbc", "aes192-cbc", "aes256-cbc"],
      },
    });

    // sshClient.connect({
    //   host: sshHost,
    //   port: sshPort,
    //   username,
    //   password,
    //   readyTimeout: 20000,
    //   keepaliveInterval: 5000,
    //   keepaliveCountMax: 2,
    //   algorithms: {
    //     kex: [
    //       "diffie-hellman-group14-sha1",
    //       "diffie-hellman-group-exchange-sha1",
    //     ],
    //   },
    // });
  } catch (error) {
    console.error(
      "❌ SSH terminal error:",

      error,
    );

    sendJSON(ws, {
      type: "error",

      message: error instanceof Error ? error.message : "SSH terminal error",
    });

    if (ws.readyState === 1) {
      ws.close();
    }

    sshClient?.end();
  }
}
