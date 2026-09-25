// ======================================================
// GALAXYMEMORY BACKEND
// Express API + static file server
// ======================================================

const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_DIR = path.join(__dirname, "data");
const UPLOADS_DIR = path.join(__dirname, "uploads");
const MEMORIES_FILE = path.join(DATA_DIR, "memories.json");
const ALBUMS_FILE = path.join(DATA_DIR, "albums.json");

// ------------------------------------------------------
// Make sure our "database" files exist
// ------------------------------------------------------

[DATA_DIR, UPLOADS_DIR].forEach((dir) => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
});

[MEMORIES_FILE, ALBUMS_FILE].forEach((file) => {
    if (!fs.existsSync(file)) {
        fs.writeFileSync(file, "[]");
    }
});

function readJSON(file) {
    try {
        const raw = fs.readFileSync(file, "utf8");
        const parsed = JSON.parse(raw);
        return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
        console.error(`Could not read ${file}:`, error.message);
        return [];
    }
}

function writeJSON(file, data) {
    fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

// ------------------------------------------------------
// Middleware
// ------------------------------------------------------

app.use(express.json({ limit: "15mb" }));
app.use("/uploads", express.static(UPLOADS_DIR));
app.use(express.static(path.join(__dirname, "public")));

// ------------------------------------------------------
// Helper: decode a base64 data URL and save it as a file,
// returning the public URL to store on the memory record.
// ------------------------------------------------------

function saveImage(dataUrl, idHint) {
    if (!dataUrl || typeof dataUrl !== "string") {
        return null;
    }

    // Already a URL (e.g. re-saving an existing memory) - keep as is.
    if (!dataUrl.startsWith("data:")) {
        return dataUrl;
    }

    const match = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);

    if (!match) {
        return null;
    }

    const mime = match[1];
    const base64Data = match[2];
    const ext = (mime.split("/")[1] || "png").split("+")[0];
    const filename = `${idHint}-${Date.now()}.${ext}`;
    const filepath = path.join(UPLOADS_DIR, filename);

    fs.writeFileSync(filepath, Buffer.from(base64Data, "base64"));

    return `/uploads/${filename}`;
}

function deleteImageFile(imageUrl) {
    if (!imageUrl || !imageUrl.startsWith("/uploads/")) {
        return;
    }

    const filepath = path.join(__dirname, imageUrl);

    fs.unlink(filepath, (err) => {
        if (err && err.code !== "ENOENT") {
            console.error("Could not delete image file:", err.message);
        }
    });
}

// ======================================================
// MEMORIES API
// ======================================================

app.get("/api/memories", (req, res) => {
    res.json(readJSON(MEMORIES_FILE));
});

app.post("/api/memories", (req, res) => {
    const memories = readJSON(MEMORIES_FILE);
    const body = req.body || {};

    const id = Date.now();
    const imageUrl = saveImage(body.image, id);

    const memory = {
        id,
        title: (body.title || "Untitled Memory").toString(),
        date: body.date || "",
        description: (body.description || "").toString(),
        tags: Array.isArray(body.tags) ? body.tags.map(String) : [],
        color: body.color || "#b493ff",
        x: typeof body.x === "number" ? body.x : 18 + Math.random() * 64,
        y: typeof body.y === "number" ? body.y : 20 + Math.random() * 60,
        image: imageUrl,
        createdAt: new Date().toISOString()
    };

    memories.push(memory);
    writeJSON(MEMORIES_FILE, memories);

    res.status(201).json(memory);
});

app.delete("/api/memories/:id", (req, res) => {
    const id = Number(req.params.id);
    const memories = readJSON(MEMORIES_FILE);
    const target = memories.find((m) => m.id === id);
    const remaining = memories.filter((m) => m.id !== id);

    writeJSON(MEMORIES_FILE, remaining);

    if (target) {
        deleteImageFile(target.image);
    }

    // Clean the deleted memory out of every album too.
    const albums = readJSON(ALBUMS_FILE);
    const updatedAlbums = albums.map((album) => ({
        ...album,
        memoryIds: Array.isArray(album.memoryIds)
            ? album.memoryIds.filter((memoryId) => memoryId !== id)
            : []
    }));

    writeJSON(ALBUMS_FILE, updatedAlbums);

    res.json({ success: true, id });
});

// ======================================================
// ALBUMS API
// ======================================================

app.get("/api/albums", (req, res) => {
    res.json(readJSON(ALBUMS_FILE));
});

app.post("/api/albums", (req, res) => {
    const body = req.body || {};
    const name = (body.name || "").toString().trim();

    if (!name) {
        return res.status(400).json({ error: "Album name is required" });
    }

    const albums = readJSON(ALBUMS_FILE);

    const album = {
        id: Date.now(),
        name,
        description: (body.description || "").toString().trim(),
        memoryIds: Array.isArray(body.memoryIds) ? body.memoryIds.map(Number) : [],
        createdAt: new Date().toISOString()
    };

    albums.push(album);
    writeJSON(ALBUMS_FILE, albums);

    res.status(201).json(album);
});

app.put("/api/albums/:id", (req, res) => {
    const id = Number(req.params.id);
    const albums = readJSON(ALBUMS_FILE);
    const index = albums.findIndex((a) => a.id === id);

    if (index === -1) {
        return res.status(404).json({ error: "Album not found" });
    }

    const body = req.body || {};

    if (body.name !== undefined) {
        albums[index].name = body.name.toString().trim();
    }

    if (body.description !== undefined) {
        albums[index].description = body.description.toString().trim();
    }

    if (body.memoryIds !== undefined) {
        albums[index].memoryIds = Array.isArray(body.memoryIds)
            ? body.memoryIds.map(Number)
            : [];
    }

    writeJSON(ALBUMS_FILE, albums);

    res.json(albums[index]);
});

app.delete("/api/albums/:id", (req, res) => {
    const id = Number(req.params.id);
    const albums = readJSON(ALBUMS_FILE);
    const remaining = albums.filter((a) => a.id !== id);

    writeJSON(ALBUMS_FILE, remaining);

    res.json({ success: true, id });
});

// ------------------------------------------------------
// Fallback: send index.html for any other GET
// (keeps things working if you add client-side routing later)
// ------------------------------------------------------

app.get("*", (req, res, next) => {
    if (req.path.startsWith("/api/") || req.path.startsWith("/uploads/")) {
        return next();
    }
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`🌌 GalaxyMemory server running at http://localhost:${PORT}`);
});
