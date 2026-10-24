import type { Request, Response } from "express";
import System from "../model/deviceDetails.js";

// CREATE SYSTEM
export async function saveSystem(
  req: Request,
  res: Response
) {
  try {
    const {
      hostname,
      ipAddress,
      subnet,
      username,
      password,
    } = req.body;

    const system = new System({
      hostname,
      ipAddress,
      subnet,
      username,
      password,
    });

    await system.save();

    return res.status(201).json({
      message: "System created successfully",
      data: system,
    });
  } catch (err) {
    console.error("Error creating system:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET ALL SYSTEMS
export async function getAllSystems(
  req: Request,
  res: Response
) {
  try {
    const systems = await System.find();

    return res.status(200).json({
      message: "System list",
      data: systems,
    });
  } catch (err) {
    console.error("Error fetching systems:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// GET SYSTEM BY ID
export async function getSystemById(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const system = await System.findById(id);

    if (!system) {
      return res.status(404).json({
        message: "System not found",
      });
    }

    return res.status(200).json({
      message: "System details",
      data: system,
    });
  } catch (err) {
    console.error("Error fetching system:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// UPDATE SYSTEM
export async function updateSystem(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const updatedSystem =
      await System.findByIdAndUpdate(
        id,
        req.body,
        {
          new: true,
          runValidators: true,
        }
      );

    if (!updatedSystem) {
      return res.status(404).json({
        message: "System not found",
      });
    }

    return res.status(200).json({
      message: "System updated successfully",
      data: updatedSystem,
    });
  } catch (err) {
    console.error("Error updating system:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// DELETE SYSTEM
export async function deleteSystem(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const deleted =
      await System.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({
        message: "System not found",
      });
    }

    return res.status(200).json({
      message: "System deleted successfully",
    });
  } catch (err) {
    console.error("Error deleting system:", err);

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}

// COUNT SYSTEMS
export async function getSystemCount(
  req: Request,
  res: Response
) {
  try {
    const count =
      await System.countDocuments();

    return res.status(200).json({
      message: "System count",
      data: { count },
    });
  } catch (err) {
    console.error(
      "Error counting systems:",
      err
    );

    return res.status(500).json({
      message: "Internal server error",
    });
  }
}