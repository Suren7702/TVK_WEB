// controllers/partyController.js
import PartyUnit from "../models/PartyUnit.js";

/**
 * Helper: normalize a Mongoose doc/plain object into a frontend-friendly node
 * ensures id is a string and keeps only useful fields.
 */
const normalizeNode = (doc = {}) => {
    return {
        id: String(doc._id ?? doc.id ?? ""),
        nameTa: doc.nameTa ?? "",
        type: doc.type ?? "",
        parentId: doc.parentId ? String(doc.parentId) : null,
        person: doc.person ?? "",
        roleTa: doc.roleTa ?? "",
        phone: doc.phone ?? "",
        photo: doc.photo ?? ""
    };
};

// ==========================================
// 1. GET FULL NETWORK (Tree Structure)
// ==========================================
export const getPartyNetwork = async (req, res) => {
    try {
        // Get all units as plain objects
        const allUnits = await PartyUnit.find({}).lean();

        // Partition by type (defensive: normalize type to lowercase)
        const unions = allUnits.filter((u) => String((u.type || "").toLowerCase()) === "union");
        const villages = allUnits.filter((u) => String((u.type || "").toLowerCase()) === "village");
        const wards = allUnits.filter((u) => String((u.type || "").toLowerCase()) === "ward");
        const booths = allUnits.filter((u) => String((u.type || "").toLowerCase()) === "booth");

        // Build Hierarchy Tree 
        const tree = unions.map((union) => {
            const u = normalizeNode(union);

            const unionVillages = villages
                .filter((v) => String(v.parentId) === String(union._id))
                .map((village) => {
                    const v = normalizeNode(village);

                    const villageWards = wards
                        .filter((w) => String(w.parentId) === String(village._id))
                        .map((ward) => {
                            const w = normalizeNode(ward);

                            const wardBooths = booths
                                .filter((b) => String(b.parentId) === String(ward._id))
                                .map((b) => normalizeNode(b));

                            return { ...w, booths: wardBooths };
                        });

                    return { ...v, wards: villageWards };
                });

            return { ...u, villages: unionVillages };
        });

        return res.json(tree);
    } catch (err) {
        console.error("[partyController] getPartyNetwork error:", err);
        return res.status(500).json({ message: "Network load failed", error: err.message });
    }
};

// ==========================================
// 2. ADD UNIT (The Save Function)
// Route: POST /api/party-network/add
// ==========================================
export const addPartyUnit = async (req, res) => {
    try {
        const {
            nameTa,
            type: rawType,
            parentId: rawParentId,
            personName,
            roleTa,
            phone,
            photoUrl 
        } = req.body || {};

        const type = (rawType || "").toLowerCase();
        const parentId = rawParentId || null;

        // Basic validation
        if (!type || !["union", "village", "ward", "booth"].includes(type)) {
            return res.status(400).json({ message: "Invalid or missing 'type' field" });
        }
        if (type !== "union" && !parentId) {
            return res.status(400).json({ message: `${type} requires a valid parent selection` });
        }
        if (!nameTa || String(nameTa).trim().length < 1) {
            return res.status(400).json({ message: "Missing or empty 'nameTa' field" });
        }

        // Photo handling (Placeholder for multer/base64)
        let finalPhotoValue = photoUrl || null;
        if (!finalPhotoValue && req.file && req.file.buffer) {
            finalPhotoValue = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        // Save to DB
        const newUnit = await PartyUnit.create({
            nameTa: String(nameTa).trim(),
            type,
            parentId: parentId || null,
            person: personName || req.body.person || "",
            roleTa: roleTa || "",
            phone: phone || "",
            photo: finalPhotoValue || ""
        });

        return res.status(201).json(normalizeNode(newUnit));
    } catch (err) {
        console.error("[partyController] Error saving unit:", err);
        return res.status(500).json({ message: "Failed to add unit", error: err.message });
    }
};

// ==========================================
// 3. DELETE UNIT (deletes item and all descendants)
// ==========================================
export const deletePartyUnit = async (req, res) => {
    const { id } = req.params;
    try {
        if (!id) return res.status(400).json({ message: "Missing id param" });

        // Helper to find all children recursively (omitted body for brevity but kept in your code)
        const findAllChildren = async (parentId) => {
            const children = await PartyUnit.find({ parentId }).lean();
            let ids = children.map(c => String(c._id));
            for (const child of children) {
                const grandChildren = await findAllChildren(String(child._id));
                ids = [...ids, ...grandChildren];
            }
            return ids;
        };

        const childrenIds = await findAllChildren(id);
        if (childrenIds.length > 0) {
            await PartyUnit.deleteMany({ _id: { $in: childrenIds } });
        }

        const deleted = await PartyUnit.findByIdAndDelete(id);

        if (!deleted) {
            return res.status(404).json({ message: "Unit not found" });
        }

        return res.json({ message: "Unit and all sub-levels deleted" });
    } catch (err) {
        console.error("[partyController] deletePartyUnit error:", err);
        return res.status(500).json({ message: "Error deleting unit", error: err.message });
    }
};

// ==========================================
// 4. UPDATE UNIT
// ==========================================
export const updatePartyUnit = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) return res.status(400).json({ message: "Missing id param" });

        const { nameTa, personName, roleTa, phone, photoUrl } = req.body || {};

        const updateData = {};
        if (typeof nameTa !== "undefined") updateData.nameTa = nameTa;
        if (typeof personName !== "undefined") updateData.person = personName;
        if (typeof req.body.person !== "undefined" && !updateData.person) updateData.person = req.body.person;
        if (typeof roleTa !== "undefined") updateData.roleTa = roleTa;
        if (typeof phone !== "undefined") updateData.phone = phone;

        // Photo Update
        if (req.file && req.file.buffer) {
            updateData.photo = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        } else if (typeof photoUrl !== "undefined") {
            updateData.photo = photoUrl;
        }

        const updatedUnit = await PartyUnit.findByIdAndUpdate(id, updateData, {
            new: true,
            lean: true
        });

        if (!updatedUnit) {
            return res.status(404).json({ message: "Unit not found" });
        }

        return res.json(normalizeNode(updatedUnit));
    } catch (err) {
        console.error("[partyController] Update Error:", err);
        return res.status(500).json({ message: "Failed to update details", error: err.message });
    }
};