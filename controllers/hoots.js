//controllers/hoots.js

const express = require("express");
const verifyToken = require("../middleware/verify-token");
const Hoot = require("../models/hoot.js");
const router = express.Router();

//add routes here

//POST /hoots CREATE route "protected"
router.post("/", verifyToken, async (req, res) => {
  try {
    //add the logged in user's id to the author field
    req.body.author = req.user._id;
    const hoot = await Hoot.create(req.body);
    hoot._doc.author = req.user;
    res.status(201).json(hoot);
  } catch (error) {
    res.status(500).json({ error: error.message });
    //TODO: remove before production
    console.log("error creating hoot: ", error);
  }
});

//GET /hoots Show all hoots in database, "protected"
router.get("/", verifyToken, async (req, res) => {
  try {
    const hoots = await Hoot.find({})
      .populate("author")
      .sort({ createdAt: "desc" });
    res.status(200).json(hoots);
  } catch (error) {
    res.status(500).json({ error: error.message });
    console.log("Error fetching hoots: ", error);
  }
});

//GET a single hoot, protected

router.get("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId).populate("author");
    res.status(200).json(hoot);
  } catch (error) {
    res.status(500).json({ error: error.message });
    //TODO remove console log when done
    console.log("Error fetching hoot: ", error);
  }
});

//UPDATE a single hoot, only the user that created can update/edit

router.put("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);
    //make sure request user and author are the same person
    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You are not allowed to do that!");
    }

    //update hoot:
    const updatedHoot = await Hoot.findByIdAndUpdate(
      req.params.hootId,
      req.body,
      { new: true }
    );
    updatedHoot._doc.author = req.user;

    res.status(200).json(updatedHoot);
  } catch (error) {
    res.status(500).json({ error: error.message });
    //TODO: remove console log
    console.log("Error updating hoot: ", error);
  }
});

//DELETE route /hoots/:hootId protected
router.delete("/:hootId", verifyToken, async (req, res) => {
  try {
    const hoot = await Hoot.findById(req.params.hootId);

    if (!hoot.author.equals(req.user._id)) {
      return res.status(403).send("You're not allowed to do that!");
    }
    const deletedHoot = await Hoot.findByIdAndDelete(req.params.hootId);
    res.status(200).json(deletedHoot);
  } catch (error) {
    res.status(500).json({ error: error.message });

    //TODO: remove console.log after testing
    console.log("Error deleted hoot: ", error);
  }
});

module.exports = router;
