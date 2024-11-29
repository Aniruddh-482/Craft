const jwt = require("jsonwebtoken");
const express = require("express");
const { body, validationResult } = require("express-validator");

const Craft = require("../models/Craft");


const router = express.Router();

const authenticate = (req, res, next) => {
    const authHeader = req.header("Authorization");
    if (!authHeader) {
        return res.status(401).json({ error: "Access denied. No token provided." });
    }

    try {
        const token = authHeader.split(" ")[1]; // Extract token from "Bearer <token>"
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach user info to the request object
        next();
    } catch (err) {
        res.status(400).json({ error: "Invalid token." });
    }
};

// createCraft
router.post(
    "/create",
    authenticate,
    body("name").notEmpty().withMessage("Craft name is required."),
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, isPublic } = req.body;

        try {
            const newCraft = new Craft({
                name,
                owner: req.user.id,
                isPublic: Boolean(isPublic),
            });

            await newCraft.save();
            res.status(201).json(newCraft);
        } catch (err) {
            console.error("Create Craft Error:", err.message);
            res.status(500).json({ error: "Internal server error." });
        }
    }
);

// listCrafts
router.get("/", authenticate, async (req, res) => {
    try {
        const crafts = await Craft.find({
            $or: [{ owner: req.user.id }, { isPublic: true }],
        }).populate("owner", "username email"); // Populate specific fields of the owner

        res.status(200).json(crafts);
    } catch (err) {
        console.error("List Crafts Error:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// updateCraft
router.put("/:id", authenticate, async (req, res) => {
    const { isPublic, collaborators } = req.body;

    try {
        const craft = await Craft.findById(req.params.id);

        if (!craft) {
            return res.status(404).json({ error: "Craft not found." });
        }

        if (craft.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: "Access denied." });
        }

        // Update fields if provided
        if (isPublic !== undefined) craft.isPublic = Boolean(isPublic);
        if (collaborators) craft.collaborators = collaborators;

        await craft.save();
        res.status(200).json(craft);
    } catch (err) {
        console.error("Update Craft Error:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

// deleteCraft
router.delete("/:id", authenticate, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
            return res.status(400).json({ error: "Invalid craft ID." });
        }

        const craft = await Craft.findById(id);

        if (!craft) {
            return res.status(404).json({ error: "Craft not found." });
        }

        if (craft.owner.toString() !== req.user.id) {
            return res.status(403).json({ error: "Access denied." });
        }

        await craft.deleteOne();
        res.status(200).json({ message: "Craft deleted successfully!" });
    } catch (err) {
        console.error("Delete Craft Error:", err.message);
        res.status(500).json({ error: "Internal server error." });
    }
});

module.exports = router;
