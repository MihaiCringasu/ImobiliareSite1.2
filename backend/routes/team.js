const express = require("express");
const router = express.Router();
const { v4: uuidv4 } = require("uuid");
const mockData = require("../data/_data");

// Try to use database, fallback to mock data
let useDatabase = true;
let db;

try {
  db = require("../config/db");
} catch (error) {
  console.warn("Database connection failed, using mock data");
  useDatabase = false;
}

// GET /api/team
router.get("/", async (req, res) => {
  console.log("GET /api/team - Start");
  try {
    // Always try to use database first
    if (db) {
      try {
        console.log("Attempting to fetch team members from database...");
        const [team] = await db.query("SELECT * FROM team_members");
        console.log(`Found ${team.length} team members in database`);
        
        // Format the response to match frontend expectations
        const formattedTeam = team.map(member => ({
          id: member.id,
          name: member.name || 'Nume Agent',
          role: member.role || 'Agent Imobiliar',
          phone: member.phone || '',
          email: member.email || 'contact@dvs.ro',
          image: member.image || '/placeholder-avatar.jpg',
          // Add missing fields with default values
          firstName: member.name ? member.name.split(' ')[0] : 'Nume',
          lastName: member.name ? member.name.split(' ').slice(1).join(' ') : 'Agent',
          createdAt: member.createdAt || new Date().toISOString(),
          updatedAt: member.updatedAt || new Date().toISOString()
        }));
        
        console.log("Sending team members to client");
        return res.json({ 
          success: true, 
          data: { 
            data: formattedTeam, 
            total: formattedTeam.length 
          } 
        });
      } catch (dbError) {
        console.error("Database query failed:", dbError);
        // Don't fall back to mock data, just return error
        return res.status(500).json({ 
          success: false, 
          message: "Eroare la preluarea datelor din baza de date" 
        });
      }
    }

    // If we get here, database is not available
    console.warn("Database not available, using mock data");
    const team = mockData.team || [];
    res.json({ 
      success: true, 
      data: { 
        data: team, 
        total: team.length 
      } 
    });
  } catch (error) {
    console.error("Error in GET /api/team:", error);
    res.status(500).json({ 
      success: false, 
      message: "Eroare internă a serverului" 
    });
  }
});

// GET /api/team/:id
router.get("/:id", async (req, res) => {
  try {
    const [rows] = await db.query("SELECT * FROM team_members WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length > 0) {
      res.json({ success: true, data: rows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Team member not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/team
router.post("/", async (req, res) => {
  try {
    const newMember = { id: uuidv4(), ...req.body };
    const { id, name, role, phone, email, image } = newMember;
    await db.query(
      "INSERT INTO team_members (id, name, role, phone, email, image) VALUES (?, ?, ?, ?, ?, ?)",
      [id, name, role, phone, email, image],
    );
    res.status(201).json({ success: true, data: newMember });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /api/team/:id
router.put("/:id", async (req, res) => {
  try {
    const { name, role, phone, email, image } = req.body;
    const [result] = await db.query(
      "UPDATE team_members SET name = ?, role = ?, phone = ?, email = ?, image = ? WHERE id = ?",
      [name, role, phone, email, image, req.params.id],
    );
    if (result.affectedRows > 0) {
      const [updatedRows] = await db.query(
        "SELECT * FROM team_members WHERE id = ?",
        [req.params.id],
      );
      res.json({ success: true, data: updatedRows[0] });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Team member not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE /api/team/:id
router.delete("/:id", async (req, res) => {
  try {
    const [result] = await db.query("DELETE FROM team_members WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows > 0) {
      res.json({ success: true, message: "Team member deleted" });
    } else {
      res
        .status(404)
        .json({ success: false, message: "Team member not found" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
