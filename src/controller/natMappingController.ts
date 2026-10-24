import type { Request, Response } from "express";
import NatMapping from "../model/natMapping.js";

// =====================================================
// CREATE NAT MAPPING
// POST /api/v1/natmapping
// =====================================================
export async function createNatMapping(
  req: Request,
  res: Response
) {
  try {
    const {
      sourceIp,
      natHost,
      natPort,
    } = req.body;

    if (!sourceIp || !natHost || natPort === undefined) {
      return res.status(400).json({
        message: "sourceIp, natHost and natPort are required",
      });
    }

    const existing = await NatMapping.findOne({
      sourceIp,
    });

    if (existing) {
      return res.status(409).json({
        message: "NAT mapping already exists for this source IP",
      });
    }

    const mapping = await NatMapping.create({
      sourceIp,
      natHost,
      natPort,
    });

    return res.status(201).json({
      message: "NAT mapping created successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Create NAT mapping error:", error);

    return res.status(500).json({
      message: "Failed to create NAT mapping",
    });
  }
}

// =====================================================
// GET ALL NAT MAPPINGS
// GET /api/v1/natmapping
// =====================================================
export async function getAllNatMappings(
  req: Request,
  res: Response
) {
  try {
    const mappings = await NatMapping.find().sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message: "NAT mappings retrieved successfully",
      data: mappings,
    });
  } catch (error) {
    console.error("Get NAT mappings error:", error);

    return res.status(500).json({
      message: "Failed to retrieve NAT mappings",
    });
  }
}

// =====================================================
// GET NAT MAPPING BY ID
// GET /api/v1/natmapping/:id
// =====================================================
export async function getNatMappingById(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const mapping = await NatMapping.findById(id);

    if (!mapping) {
      return res.status(404).json({
        message: "NAT mapping not found",
      });
    }

    return res.status(200).json({
      message: "NAT mapping retrieved successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Get NAT mapping error:", error);

    return res.status(500).json({
      message: "Failed to retrieve NAT mapping",
    });
  }
}

// =====================================================
// UPDATE NAT MAPPING
// PUT /api/v1/natmapping/:id
// =====================================================
export async function updateNatMapping(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const {
      sourceIp,
      natHost,
      natPort,
    } = req.body;

    // Check mapping exists
    const existing = await NatMapping.findById(id);

    if (!existing) {
      return res.status(404).json({
        message: "NAT mapping not found",
      });
    }

    // Check duplicate source IP
    if (
      sourceIp !== undefined &&
      sourceIp !== existing.sourceIp
    ) {
      const duplicate = await NatMapping.findOne({
        sourceIp,
      });

      if (duplicate) {
        return res.status(409).json({
          message: "Another NAT mapping already uses this source IP",
        });
      }
    }

    // Build update object
    const updateData: {
      sourceIp?: string;
      natHost?: string;
      natPort?: number;
    } = {};

    if (sourceIp !== undefined) {
      updateData.sourceIp = sourceIp;
    }

    if (natHost !== undefined) {
      updateData.natHost = natHost;
    }

    if (natPort !== undefined) {
      updateData.natPort = Number(natPort);
    }

    const updatedMapping =
      await NatMapping.findByIdAndUpdate(
        id,
        updateData,
        {
          new: true,
          runValidators: true,
        }
      );

    return res.status(200).json({
      message: "NAT mapping updated successfully",
      data: updatedMapping,
    });
  } catch (error) {
    console.error("Update NAT mapping error:", error);

    return res.status(500).json({
      message: "Failed to update NAT mapping",
    });
  }
}

// =====================================================
// DELETE NAT MAPPING
// DELETE /api/v1/natmapping/:id
// =====================================================
export async function deleteNatMapping(
  req: Request,
  res: Response
) {
  try {
    const { id } = req.params;

    const mapping =
      await NatMapping.findByIdAndDelete(id);

    if (!mapping) {
      return res.status(404).json({
        message: "NAT mapping not found",
      });
    }

    return res.status(200).json({
      message: "NAT mapping deleted successfully",
      data: mapping,
    });
  } catch (error) {
    console.error("Delete NAT mapping error:", error);

    return res.status(500).json({
      message: "Failed to delete NAT mapping",
    });
  }
}