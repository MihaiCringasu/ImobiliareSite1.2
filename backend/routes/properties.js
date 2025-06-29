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

// Helper function to get property with images and videos
async function getPropertyWithMedia(propertyId) {
  if (!useDatabase || !db) return null;

  try {
    // Get property with agent
    const [propertyRows] = await db.query(
      `SELECT p.*,
              t.id as agent_id, t.name as agent_name, t.role as agent_role,
              t.phone as agent_phone, t.email as agent_email, t.image as agent_image
       FROM properties p
       LEFT JOIN team_members t ON p.agentId = t.id
       WHERE p.id = ?`,
      [propertyId],
    );

    if (propertyRows.length === 0) return null;

    const property = propertyRows[0];
    property.badges = JSON.parse(property.badges || "[]");

    // Get images
    const [imageRows] = await db.query(
      `SELECT id, url, alt, order_index as \`order\`, is_primary as isPrimary
       FROM property_images
       WHERE property_id = ?
       ORDER BY order_index ASC`,
      [propertyId],
    );

    // Get videos
    const [videoRows] = await db.query(
      `SELECT id, url, title, description, order_index as \`order\`
       FROM property_videos
       WHERE property_id = ?
       ORDER BY order_index ASC`,
      [propertyId],
    );

    property.images = imageRows;
    property.videos = videoRows;

    // Add agent information if exists
    if (property.agent_id) {
      property.agent = {
        id: property.agent_id,
        name: property.agent_name,
        role: property.agent_role,
        phone: property.agent_phone,
        email: property.agent_email,
        image: property.agent_image,
      };
    }

    // Clean up agent fields
    const {
      agent_id,
      agent_name,
      agent_role,
      agent_phone,
      agent_email,
      agent_image,
      ...cleanedProperty
    } = property;

    return cleanedProperty;
  } catch (error) {
    console.error("Error getting property with media:", error);
    return null;
  }
}

// Helper function to save property images
async function savePropertyImages(propertyId, images) {
  if (!useDatabase || !db || !images || !Array.isArray(images)) return;

  try {
    // Delete existing images
    await db.query("DELETE FROM property_images WHERE property_id = ?", [
      propertyId,
    ]);

    // Insert new images
    for (const image of images) {
      await db.query(
        "INSERT INTO property_images (id, property_id, url, alt, order_index, is_primary) VALUES (?, ?, ?, ?, ?, ?)",
        [
          uuidv4(),
          propertyId,
          image.url,
          image.alt || null,
          image.order || 0,
          image.isPrimary || false,
        ],
      );
    }
  } catch (error) {
    console.error("Error saving property images:", error);
  }
}

// Helper function to save property videos
async function savePropertyVideos(propertyId, videos) {
  if (!useDatabase || !db || !videos || !Array.isArray(videos)) return;

  try {
    // Delete existing videos
    await db.query("DELETE FROM property_videos WHERE property_id = ?", [
      propertyId,
    ]);

    // Insert new videos
    for (const video of videos) {
      await db.query(
        "INSERT INTO property_videos (id, property_id, url, title, description, order_index) VALUES (?, ?, ?, ?, ?, ?)",
        [
          uuidv4(),
          propertyId,
          video.url,
          video.title || null,
          video.description || null,
          video.order || 0,
        ],
      );
    }
  } catch (error) {
    console.error("Error saving property videos:", error);
  }
}

// GET /api/properties
router.get("/", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    if (useDatabase && db) {
      try {
        const [countResult] = await db.query(
          "SELECT COUNT(*) as total FROM properties",
        );
        const total = countResult[0].total;

        const [results] = await db.query(
          "SELECT * FROM properties ORDER BY createdAt DESC LIMIT ? OFFSET ?",
          [limit, offset],
        );

        // Get images for each property
        const propertiesWithImages = await Promise.all(
          results.map(async (property) => {
            const [imageRows] = await db.query(
              "SELECT id, url, alt, order_index as `order`, is_primary as isPrimary FROM property_images WHERE property_id = ? ORDER BY order_index ASC",
              [property.id],
            );

            return {
              ...property,
              badges: JSON.parse(property.badges || "[]"),
              images: imageRows,
            };
          }),
        );

        res.json({
          success: true,
          data: {
            data: propertiesWithImages,
            total: total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
          },
        });
        return;
      } catch (dbError) {
        console.warn(
          "Database query failed, falling back to mock data:",
          dbError.message,
        );
      }
    }

    // Use mock data
    const allProperties = mockData.properties;
    const total = allProperties.length;
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedProperties = allProperties.slice(startIndex, endIndex);

    res.json({
      success: true,
      data: {
        data: paginatedProperties,
        total: total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// GET /api/properties/:id
router.get("/:id", async (req, res) => {
  try {
    if (useDatabase && db) {
      try {
        const property = await getPropertyWithMedia(req.params.id);
        if (property) {
          res.json({ success: true, data: property });
          return;
        } else {
          // If property not found in DB, fall back to mock data
          console.log("Property not found in DB, using mock data");
          const mockProperty = mockData.properties.find(
            (p) => p.id === req.params.id,
          );
          if (mockProperty) {
            res.json({ success: true, data: mockProperty });
            return;
          }
          res
            .status(404)
            .json({ success: false, message: "Property not found" });
          return;
        }
      } catch (dbError) {
        console.error(
          "Database error, falling back to mock data:",
          dbError.message,
        );
        // Fall back to mock data if database error
        const mockProperty = mockData.properties.find(
          (p) => p.id === req.params.id,
        );
        if (mockProperty) {
          res.json({ success: true, data: mockProperty });
          return;
        }
      }
    }

    // Use mock data
    const property = mockData.properties.find((p) => p.id === req.params.id);
    if (property) {
      res.json({ success: true, data: property });
    } else {
      res.status(404).json({ success: false, message: "Property not found" });
    }
  } catch (error) {
    console.error("Error in property detail endpoint:", error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// POST /api/properties
router.post("/", async (req, res) => {
  try {
    const propertyId = uuidv4();
    const newProperty = {
      id: propertyId,
      ...req.body,
    };

    if (useDatabase && db) {
      const {
        title,
        price,
        location,
        area,
        rooms,
        type,
        videoUrl,
        thumbnailUrl,
        badges,
        images,
        videos,
      } = newProperty;

      // Insert property
      const sql =
        "INSERT INTO properties (id, title, price, location, address, area, rooms, floor, yearBuilt, description, type, videoUrl, thumbnailUrl, badges, agentId, city, county, category, status, featured, currency, map_url, map_embed_url) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

      await db.query(sql, [
        propertyId,
        title,
        price,
        location,
        req.body.address || null,
        area,
        rooms,
        req.body.floor || null,
        req.body.yearBuilt || null,
        req.body.description || "",
        type,
        videoUrl || null,
        thumbnailUrl || null,
        JSON.stringify(badges || []),
        req.body.agentId || null,
        req.body.city || null,
        req.body.county || null,
        req.body.category || "vanzare",
        req.body.status || "disponibil",
        req.body.featured || false,
        req.body.currency || "EUR",
        req.body.mapUrl || null,
        req.body.mapEmbedUrl || null,
      ]);

      // Save images and videos
      await savePropertyImages(propertyId, images);
      await savePropertyVideos(propertyId, videos);

      // Get the complete property with media
      const completeProperty = await getPropertyWithMedia(propertyId);
      res.status(201).json({ success: true, data: completeProperty });
    } else {
      // Mock data fallback
      mockData.properties.push(newProperty);
      res.status(201).json({ success: true, data: newProperty });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// PUT /api/properties/:id
router.put("/:id", async (req, res) => {
  try {
    if (useDatabase && db) {
      const {
        title,
        price,
        location,
        area,
        rooms,
        type,
        videoUrl,
        thumbnailUrl,
        badges,
        images,
        videos,
      } = req.body;

      // Update property
      const sql =
        "UPDATE properties SET title = ?, price = ?, location = ?, address = ?, area = ?, rooms = ?, floor = ?, yearBuilt = ?, description = ?, type = ?, videoUrl = ?, thumbnailUrl = ?, badges = ?, agentId = ?, city = ?, county = ?, category = ?, status = ?, featured = ?, currency = ?, map_url = ?, map_embed_url = ? WHERE id = ?";

      await db.query(sql, [
        title,
        price,
        location,
        req.body.address || null,
        area,
        rooms,
        req.body.floor || null,
        req.body.yearBuilt || null,
        req.body.description || "",
        type,
        videoUrl || null,
        thumbnailUrl || null,
        JSON.stringify(badges || []),
        req.body.agentId || null,
        req.body.city || null,
        req.body.county || null,
        req.body.category || "vanzare",
        req.body.status || "disponibil",
        req.body.featured || false,
        req.body.currency || "EUR",
        req.body.mapUrl || null,
        req.body.mapEmbedUrl || null,
        req.params.id,
      ]);

      // Update images and videos
      await savePropertyImages(req.params.id, images);
      await savePropertyVideos(req.params.id, videos);

      // Get the complete updated property
      const updatedProperty = await getPropertyWithMedia(req.params.id);
      res.json({ success: true, data: updatedProperty });
    } else {
      // Mock data fallback
      const index = mockData.properties.findIndex(
        (p) => p.id === req.params.id,
      );
      if (index !== -1) {
        mockData.properties[index] = {
          ...mockData.properties[index],
          ...req.body,
        };
        res.json({ success: true, data: mockData.properties[index] });
      } else {
        res.status(404).json({ success: false, message: "Property not found" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

// DELETE /api/properties/:id
router.delete("/:id", async (req, res) => {
  try {
    if (useDatabase && db) {
      // Delete images and videos (cascade should handle this, but explicit is better)
      await db.query("DELETE FROM property_images WHERE property_id = ?", [
        req.params.id,
      ]);
      await db.query("DELETE FROM property_videos WHERE property_id = ?", [
        req.params.id,
      ]);

      // Delete property
      const [result] = await db.query("DELETE FROM properties WHERE id = ?", [
        req.params.id,
      ]);

      if (result.affectedRows > 0) {
        res.json({ success: true, message: "Property deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Property not found" });
      }
    } else {
      // Mock data fallback
      const index = mockData.properties.findIndex(
        (p) => p.id === req.params.id,
      );
      if (index !== -1) {
        mockData.properties.splice(index, 1);
        res.json({ success: true, message: "Property deleted successfully" });
      } else {
        res.status(404).json({ success: false, message: "Property not found" });
      }
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server Error" });
  }
});

module.exports = router;
