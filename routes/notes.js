const express = require("express");
const router = express.Router();
const Notes = require("../models/Notes.js");
const { body, validationResult } = require("express-validator");
const fetchuser1 = require("../middleware/fetchuser1.js");
// const fetchuser = require("../middleware/fetchuser.js");


router.get("/fetchallcandidate",async (req, res) => {
  try {
    const notes = await Notes.find({});
    try {
      res.json(notes);
    } catch (error) {
      res.send({error:error.message})
    }
    
  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
});

router.post(
  "/addcandidate",
  fetchuser1,
  [
    body("name", "enter the valid name").isLength({ min: 3 }),
    body("party", "enter the valid party"),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (!result.isEmpty()) {
      success=false;
        return res.json({success,errors: result.array()});
    }
    const aaaa = await Notes.findOne({ name: req.body.name });
    if (aaaa) {
      return res.status(401).send({ error: "Please enter the valid Name" });
    }
    const { name, party, voteCount } = req.body;
    try {
      notes = await Notes.create({
        name,
        party,
        voteCount,
      });
      const savenote = await notes.save();
      res.json(savenote);
    } catch (error) {
      return res.send({ error: error.message });
    }
  }
);
router.put("/updatecandidate/:id",async (req, res) => {
  try{
    const { name,party, voteCount } = req.body;
    const newNote = {};
    if (name) {
      newNote.name = name;
    }
    if (party) {
      newNote.party = party;
    }
    if (voteCount) {
      newNote.voteCount = voteCount;
    }
    
    let notes = await Notes.findById( req.params.id );
    if (!notes) {
      return res.status(404).send("please use the correct credential" );
    }

    /*if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }*/


    notes = await Notes.findByIdAndUpdate(req.params.id,{ $set: newNote },{ new: true });
    res.json({notes});

  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occur");
  }
});
router.delete("/deletecandidate/:id",fetchuser1,async (req, res) => {
  try{
    let notes = await Notes.findById( req.params.id );

    if (!notes) {
      return res.status(404).send("please use the correct credential" );
    }

    /*if (notes.user.toString() !== req.user.id) {
      return res.status(401).send("Not allowed");
    }*/


    notes = await Notes.findByIdAndDelete(req.params.id);
    res.json({"success":"the note has been deleted"});

  } catch (error) {
    console.error(error.message);
    res.status(500).send("some error occured");
  }
});
module.exports=router