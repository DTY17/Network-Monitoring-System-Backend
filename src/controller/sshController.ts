import { type Request, type Response } from "express";
import { Client } from "ssh2";

import SyslogMessage from "../model/notification.js";
import System from "../model/deviceDetails.js";
import NatMapping from "../model/natMapping.js";

export async function connectSSH(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    // =====================================================
    // 1. FIND SYSLOG
    // =====================================================

    const notification =
      await SyslogMessage.findById(id);

    if (!notification) {
      return res.status(404).json({
        message: "Syslog notification not found",
      });
    }

    // =====================================================
    // 2. GET IP FROM SYSLOG
    // =====================================================

    const rawIpAddress =
      notification.ipAddress;

    if (
      typeof rawIpAddress !== "string" ||
      rawIpAddress.trim() === ""
    ) {
      return res.status(400).json({
        message:
          "IP address is not available for this syslog",
      });
    }

    // =====================================================
    // 3. EXTRACT DEVICE IP
    // =====================================================

    let deviceIp: string =
      rawIpAddress.trim();

    const ipMatch = deviceIp.match(
      /^(\d{1,3}(?:\.\d{1,3}){3})(?::\d+)?$/
    );

    if (ipMatch && ipMatch[1]) {
      deviceIp = ipMatch[1];
    }

    console.log("\n========================================");
    console.log("SYSLOG DEVICE");
    console.log("========================================");
    console.log(
      "Original IP:",
      rawIpAddress
    );
    console.log(
      "Device IP:",
      deviceIp
    );
    console.log("========================================");

    // =====================================================
    // 4. FIND NAT MAPPING
    // =====================================================

    const natMapping =
      await NatMapping.findOne({
        sourceIp: deviceIp,
      }).lean();

    if (!natMapping) {
      return res.status(404).json({
        message:
          `No NAT mapping found for device IP ${deviceIp}`,
      });
    }

    // =====================================================
    // 5. EXTRACT NAT INFORMATION
    // =====================================================

    const natHostValue =
      natMapping.natHost;

    const natPortValue =
      natMapping.natPort;

    // =====================================================
    // VALIDATE NAT HOST
    // =====================================================

    if (
      typeof natHostValue !== "string" ||
      natHostValue.trim() === ""
    ) {
      return res.status(400).json({
        message:
          `NAT host is missing for device ${deviceIp}`,
      });
    }

    // =====================================================
    // VALIDATE NAT PORT
    // =====================================================

    if (
      typeof natPortValue !== "number" ||
      !Number.isInteger(natPortValue) ||
      natPortValue <= 0
    ) {
      return res.status(400).json({
        message:
          `NAT port is invalid for device ${deviceIp}`,
      });
    }

    // =====================================================
    // NOW TYPESCRIPT KNOWS THESE ARE VALID
    // =====================================================

    const sshHost: string =
      natHostValue.trim();

    const sshPort: number =
      natPortValue;

    console.log("\n========================================");
    console.log("NAT MAPPING");
    console.log("========================================");
    console.log(
      "Source IP:",
      deviceIp
    );
    console.log(
      "NAT Host:",
      sshHost
    );
    console.log(
      "NAT Port:",
      sshPort
    );
    console.log(
      "SSH Target:",
      `${sshHost}:${sshPort}`
    );
    console.log("========================================");

    // =====================================================
    // 6. FIND DEVICE
    // =====================================================

    const device =
      await System.findOne({
        ipAddress: deviceIp,
      }).select("+password");

    if (!device) {
      return res.status(404).json({
        message:
          `No device found for IP address ${deviceIp}`,
        data: {
          deviceIp: deviceIp,
          sshHost: sshHost,
          sshPort: sshPort,
        },
      });
    }

    // =====================================================
    // 7. GET CREDENTIALS
    // =====================================================

    const usernameValue =
      device.username;

    const passwordValue =
      device.password;

    // =====================================================
    // VALIDATE USERNAME
    // =====================================================

    if (
      typeof usernameValue !== "string" ||
      usernameValue.trim() === ""
    ) {
      return res.status(400).json({
        message:
          `Username is missing for device ${deviceIp}`,
      });
    }

    // =====================================================
    // VALIDATE PASSWORD
    // =====================================================

    if (
      typeof passwordValue !== "string" ||
      passwordValue === ""
    ) {
      return res.status(400).json({
        message:
          `Password is missing for device ${deviceIp}`,
      });
    }

    // =====================================================
    // CREATE DEFINITELY STRING VALUES
    // =====================================================

    const username: string =
      usernameValue.trim();

    const password: string =
      passwordValue;

    const hostname: string =
      typeof device.hostname === "string"
        ? device.hostname
        : deviceIp;

    // =====================================================
    // 8. FINAL DEBUG
    // =====================================================

    console.log("\n========================================");
    console.log("FINAL SSH CONNECTION");
    console.log("========================================");
    console.log(
      "Hostname:",
      hostname
    );
    console.log(
      "Device IP:",
      deviceIp
    );
    console.log(
      "SSH Host:",
      sshHost
    );
    console.log(
      "SSH Port:",
      sshPort
    );
    console.log(
      "SSH Target:",
      `${sshHost}:${sshPort}`
    );
    console.log(
      "Username:",
      username
    );
    console.log("========================================");

    // =====================================================
    // 9. CREATE SSH CLIENT
    // =====================================================

    const connection =
      new Client();

    let responseSent = false;

    const sendResponse = (
      statusCode: number,
      data: object
    ) => {

      if (responseSent) {
        return;
      }

      responseSent = true;

      return res
        .status(statusCode)
        .json(data);
    };

    // =====================================================
    // 10. SSH READY
    // =====================================================

    connection.on(
      "ready",
      () => {

        console.log(
          "\n========================================"
        );

        console.log(
          "SSH CONNECTED SUCCESSFULLY"
        );

        console.log(
          "========================================"
        );

        console.log(
          "Device IP:",
          deviceIp
        );

        console.log(
          "Connected to:",
          `${sshHost}:${sshPort}`
        );

        console.log(
          "========================================"
        );

        connection.end();

        return sendResponse(
          200,
          {
            message:
              "SSH connection successful",

            data: {

              hostname:
                hostname,

              deviceIp:
                deviceIp,

              sshHost:
                sshHost,

              sshPort:
                sshPort,

              username:
                username,

              connected:
                true,
            },
          }
        );
      }
    );

    // =====================================================
    // 11. SSH ERROR
    // =====================================================

    connection.on(
      "error",
      (error) => {

        console.error(
          "\n========================================"
        );

        console.error(
          "SSH CONNECTION FAILED"
        );

        console.error(
          "========================================"
        );

        console.error(
          "Device IP:",
          deviceIp
        );

        console.error(
          "SSH Target:",
          `${sshHost}:${sshPort}`
        );

        console.error(
          "Error:",
          error.message
        );

        console.error(
          "========================================"
        );

        return sendResponse(
          502,
          {
            message:
              "SSH connection failed",

            error:
              error.message,

            data: {

              hostname:
                hostname,

              deviceIp:
                deviceIp,

              sshHost:
                sshHost,

              sshPort:
                sshPort,

              connected:
                false,
            },
          }
        );
      }
    );

    // =====================================================
    // 12. SSH CLOSE
    // =====================================================

    connection.on(
      "close",
      () => {

        console.log(
          `SSH connection closed: ${sshHost}:${sshPort}`
        );
      }
    );

    // =====================================================
    // 13. ACTUAL SSH CONNECTION
    // =====================================================
    //
    // IMPORTANT
    //
    // DEVICE IP:
    //
    // 4.4.4.4
    //
    // is ONLY used for database lookup.
    //
    // SSH:
    //
    // 192.168.75.139:2224
    //
    // =====================================================

    connection.connect({

      host: sshHost,

      port: sshPort,

      username: username,

      password: password,

      readyTimeout: 10000,

      keepaliveInterval: 5000,

      keepaliveCountMax: 2,

      algorithms: {

        kex: [
          "diffie-hellman-group1-sha1",
          "diffie-hellman-group14-sha1",
        ],

        cipher: [
          "aes128-cbc",
          "3des-cbc",
          "aes192-cbc",
          "aes256-cbc",
        ],
      },
    });

  } catch (error) {

    console.error(
      "SSH connection controller error:",
      error
    );

    if (!res.headersSent) {

      return res.status(500).json({
        message:
          "Internal server error",
      });
    }
  }
}