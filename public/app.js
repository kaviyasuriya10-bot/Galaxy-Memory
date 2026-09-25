// ======================================================
// GALAXY MEMORY
// COMPLETE FRONTEND JAVASCRIPT
// MEMORY + TIMELINE + ALBUMS
// ======================================================


// ======================================================
// ELEMENTS
// ======================================================

const galaxy =
    document.getElementById("galaxy");

const backgroundStars =
    document.getElementById("backgroundStars");

const memoryStars =
    document.getElementById("memoryStars");

const constellationLines =
    document.getElementById("constellationLines");

const emptyMessage =
    document.getElementById("emptyMessage");

const memoryPanel =
    document.getElementById("memoryPanel");

const modalOverlay =
    document.getElementById("modalOverlay");


// ======================================================
// ALBUM ELEMENTS
// ======================================================

const albumsView =
    document.getElementById("albumsView");

const albumsGrid =
    document.getElementById("albumsGrid");

const albumsNavButton =
    document.getElementById("albumsNavButton");

const createAlbumButton =
    document.getElementById("createAlbumButton");

const albumModalOverlay =
    document.getElementById("albumModalOverlay");

const albumModalClose =
    document.getElementById("albumModalClose");

const albumForm =
    document.getElementById("albumForm");

const albumMemorySelector =
    document.getElementById("albumMemorySelector");


// ======================================================
// TIMELINE ELEMENTS
// ======================================================

const timelineView =
    document.getElementById("timelineView");

const timelineList =
    document.getElementById("timelineList");


// ======================================================
// API CLIENT
// Talks to the Express backend instead of localStorage.
// ======================================================

const API_BASE = "/api";

async function apiRequest(path, options) {

    const response = await fetch(
        API_BASE + path,
        options
    );

    if (!response.ok) {

        let message =
            "Request failed: " + response.status;

        try {

            const errorBody =
                await response.json();

            if (errorBody && errorBody.error) {

                message =
                    errorBody.error;

            }

        }
        catch (parseError) {
            // ignore - fall back to default message
        }

        throw new Error(message);

    }

    if (response.status === 204) {

        return null;

    }

    return response.json();

}

function fetchMemories() {

    return apiRequest(
        "/memories",
        { method: "GET" }
    );

}

function createMemoryOnServer(payload) {

    return apiRequest(
        "/memories",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

}

function deleteMemoryOnServer(id) {

    return apiRequest(
        "/memories/" + id,
        { method: "DELETE" }
    );

}

function fetchAlbums() {

    return apiRequest(
        "/albums",
        { method: "GET" }
    );

}

function createAlbumOnServer(payload) {

    return apiRequest(
        "/albums",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

}

function updateAlbumOnServer(id, payload) {

    return apiRequest(
        "/albums/" + id,
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        }
    );

}

function deleteAlbumOnServer(id) {

    return apiRequest(
        "/albums/" + id,
        { method: "DELETE" }
    );

}


// ======================================================
// MEMORY + ALBUM STATE
// Populated from the server on startup - see INITIALIZE
// at the bottom of this file.
// ======================================================

let memories = [];
let albums = [];


// ======================================================
// BACKGROUND GALAXY
// ======================================================

function createBackgroundStars() {

    if (!backgroundStars) {

        return;

    }

    backgroundStars.innerHTML = "";

    const STAR_COUNT = 2200;

    for (
        let i = 0;
        i < STAR_COUNT;
        i++
    ) {

        const star =
            document.createElement("div");

        star.className =
            "star";

        const distance =
            Math.pow(
                Math.random(),
                0.55
            ) * 48;

        const arms = 5;

        const arm =
            Math.floor(
                Math.random() * arms
            );

        const armAngle =
            (Math.PI * 2 / arms) *
            arm;

        const spiralAngle =
            distance * 0.17;

        const spread =
            (Math.random() - 0.5) *
            (2 + distance * 0.05);

        const angle =
            armAngle +
            spiralAngle +
            spread;

        const x =
            50 +
            Math.cos(angle) *
            distance;

        const y =
            54 +
            Math.sin(angle) *
            distance *
            0.48;

        star.style.left =
            x + "%";

        star.style.top =
            y + "%";

        const size =
            Math.random() < 0.08
                ? Math.random() * 3 + 2
                : Math.random() * 1.5 + 0.5;

        star.style.width =
            size + "px";

        star.style.height =
            size + "px";

        const colors = [
            "#ffffff",
            "#9c7cff",
            "#7fa8ff",
            "#ffd27d"
        ];

        const color =
            colors[
                Math.floor(
                    Math.random() *
                    colors.length
                )
            ];

        star.style.background =
            color;

        star.style.opacity =
            Math.random() * 0.7 + 0.3;

        star.style.boxShadow =
            `0 0 ${size * 3}px ${color}`;

        backgroundStars.appendChild(
            star
        );

    }

}


// ======================================================
// UPDATE STATS
// ======================================================

function updateStats() {

    const memoryCount =
        document.getElementById(
            "memoryCount"
        );

    const starCount =
        document.getElementById(
            "starCount"
        );

    const albumCount =
        document.querySelector(
            ".stats .stat:nth-child(4) strong"
        );

    if (memoryCount) {

        memoryCount.textContent =
            memories.length;

    }

    if (starCount) {

        starCount.textContent =
            memories.length;

    }

    if (albumCount) {

        albumCount.textContent =
            albums.length;

    }

    if (emptyMessage) {

        emptyMessage.style.display =
            memories.length === 0
                ? "block"
                : "none";

    }

}


// ======================================================
// FORMAT DATE
// ======================================================

function formatDate(dateString) {

    if (!dateString) {

        return "";

    }

    const date =
        new Date(
            dateString + "T00:00:00"
        );

    if (
        Number.isNaN(
            date.getTime()
        )
    ) {

        return dateString;

    }

    return date.toLocaleDateString(
        "en-GB",
        {
            day: "numeric",
            month: "short",
            year: "numeric"
        }
    );

}


// ======================================================
// CREATE MEMORY STAR
// ======================================================

function createMemoryStar(memory) {

    if (!memoryStars) {

        return;

    }

    if (!Array.isArray(memory.tags)) {

        memory.tags = [];

    }

    if (
        typeof memory.x !== "number" ||
        typeof memory.y !== "number"
    ) {

        memory.x =
            20 +
            Math.random() * 60;

        memory.y =
            20 +
            Math.random() * 55;

    }

    if (!memory.color) {

        memory.color =
            "#b493ff";

    }

    const container =
        document.createElement("div");

    container.className =
        "memory-star-container";

    container.style.left =
        memory.x + "%";

    container.style.top =
        memory.y + "%";

    const star =
        document.createElement("div");

    star.className =
        "memory-star";

    star.style.background =
        memory.color;

    star.style.color =
        memory.color;

    const label =
        document.createElement("div");

    label.className =
        "memory-label";

    const title =
        document.createElement("div");

    title.className =
        "memory-label-title";

    title.textContent =
        memory.title ||
        "Untitled Memory";

    const date =
        document.createElement("div");

    date.className =
        "memory-label-date";

    date.textContent =
        formatDate(
            memory.date
        );

    label.appendChild(title);
    label.appendChild(date);

    container.appendChild(star);
    container.appendChild(label);

    container.addEventListener(
        "click",
        function (event) {

            event.stopPropagation();

            showMemory(memory);

        }
    );

    memoryStars.appendChild(
        container
    );

    memory.starElement =
        container;

}


// ======================================================
// SHOW MEMORY PANEL
// ======================================================

function showMemory(memory) {

    if (!memoryPanel) {
        return;
    }

    const title =
        document.getElementById("memoryTitle");

    const date =
        document.getElementById("memoryDate");

    const description =
        document.getElementById("memoryDescription");

    const oldImage =
        document.getElementById("memoryImage");

    const tags =
        document.getElementById("memoryTags");

    const panelStar =
        document.getElementById("panelStar");


    if (title) {
        title.textContent =
            memory.title ||
            "Untitled Memory";
    }


    if (date) {
        date.textContent =
            formatDate(memory.date);
    }


    if (description) {
        description.textContent =
            memory.description ||
            "";
    }


    /* =========================================
       MULTIPLE PHOTOS
    ========================================= */

    if (oldImage) {
        oldImage.style.display = "none";
    }


    let imageContainer =
        document.getElementById(
            "memoryImages"
        );


    if (!imageContainer) {

        imageContainer =
            document.createElement("div");

        imageContainer.id =
            "memoryImages";

        imageContainer.className =
            "memory-images";

        if (oldImage) {
            oldImage.parentNode.insertBefore(
                imageContainer,
                oldImage
            );
        }
        else {
            memoryPanel.appendChild(
                imageContainer
            );
        }
    }


    imageContainer.innerHTML = "";


    let images = [];


    if (Array.isArray(memory.images)) {

        images =
            memory.images;

    }
    else if (memory.image) {

        images =
            [memory.image];

    }


    images.forEach(
        function (src) {

            const img =
                document.createElement("img");

            img.src = src;

            img.alt =
                memory.title ||
                "Memory photo";


            img.addEventListener(
                "click",
                function () {

                    window.open(
                        src,
                        "_blank"
                    );

                }
            );


            imageContainer.appendChild(
                img
            );

        }
    );


    if (panelStar) {

        const color =
            memory.color ||
            "#b493ff";

        panelStar.style.color =
            color;

        panelStar.style.textShadow =
            `
            0 0 15px ${color},
            0 0 35px ${color}
            `;
    }


    if (tags) {

        tags.innerHTML = "";

        const memoryTags =
            Array.isArray(memory.tags)
                ? memory.tags
                : [];


        memoryTags.forEach(
            function (tag) {

                const element =
                    document.createElement(
                        "span"
                    );

                element.textContent =
                    tag;

                tags.appendChild(
                    element
                );

            }
        );

    }


    memoryPanel.dataset.memoryId =
        memory.id;

    memoryPanel.style.display =
        "block";
}

// ======================================================
// CONSTELLATIONS
// ======================================================

function drawConstellations() {

    if (!constellationLines) {

        return;

    }

    constellationLines.innerHTML =
        "";

    if (memories.length < 2) {

        return;

    }

    for (
        let i = 0;
        i < memories.length;
        i++
    ) {

        for (
            let j = i + 1;
            j < memories.length;
            j++
        ) {

            const first =
                memories[i];

            const second =
                memories[j];

            const firstTags =
                Array.isArray(first.tags)
                    ? first.tags
                    : [];

            const secondTags =
                Array.isArray(second.tags)
                    ? second.tags
                    : [];

            const shared =
                firstTags.some(
                    function (tag) {

                        return secondTags.includes(
                            tag
                        );

                    }
                );

            if (shared) {

                createConstellationLine(
                    first,
                    second
                );

            }

        }

    }

}


function createConstellationLine(
    first,
    second
) {

    if (!constellationLines) {

        return;

    }

    const line =
        document.createElementNS(
            "http://www.w3.org/2000/svg",
            "line"
        );

    line.classList.add(
        "constellation-line"
    );

    line.setAttribute(
        "x1",
        first.x + "%"
    );

    line.setAttribute(
        "y1",
        first.y + "%"
    );

    line.setAttribute(
        "x2",
        second.x + "%"
    );

    line.setAttribute(
        "y2",
        second.y + "%"
    );

    constellationLines.appendChild(
        line
    );

}


// ======================================================
// MEMORY MODAL
// ======================================================

function openModal() {

    if (!modalOverlay) {

        return;

    }

    modalOverlay.style.display =
        "flex";

}


function closeModal() {

    if (!modalOverlay) {

        return;

    }

    modalOverlay.style.display =
        "none";

}


const addMemoryButton =
    document.getElementById(
        "addMemoryButton"
    );

if (addMemoryButton) {

    addMemoryButton.addEventListener(
        "click",
        openModal
    );

}


const emptyAddButton =
    document.getElementById(
        "emptyAddButton"
    );

if (emptyAddButton) {

    emptyAddButton.addEventListener(
        "click",
        openModal
    );

}


const timelineAddButton =
    document.getElementById(
        "timelineAddButton"
    );

if (timelineAddButton) {

    timelineAddButton.addEventListener(
        "click",
        openModal
    );

}


const modalClose =
    document.getElementById(
        "modalClose"
    );

if (modalClose) {

    modalClose.addEventListener(
        "click",
        closeModal
    );

}


if (modalOverlay) {

    modalOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                modalOverlay
            ) {

                closeModal();

            }

        }
    );

}


// ======================================================
// MEMORY FORM
// ======================================================

const memoryForm =
    document.getElementById(
        "memoryForm"
    );

if (memoryForm) {

    memoryForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const titleInput =
                document.getElementById(
                    "memoryInputTitle"
                );

            const dateInput =
                document.getElementById(
                    "memoryInputDate"
                );

            const descriptionInput =
                document.getElementById(
                    "memoryInputDescription"
                );

            const tagsInput =
                document.getElementById(
                    "memoryInputTags"
                );

            const imageInput =
                document.getElementById(
                    "memoryInputImage"
                );

            const title =
                titleInput
                    ? titleInput.value.trim()
                    : "";

            const date =
                dateInput
                    ? dateInput.value
                    : "";

            const description =
                descriptionInput
                    ? descriptionInput.value.trim()
                    : "";

            const tagText =
                tagsInput
                    ? tagsInput.value
                    : "";

            const tags =
                tagText
                    .split(",")
                    .map(
                        function (tag) {

                            return tag.trim();

                        }
                    )
                    .filter(
                        function (tag) {

                            return tag.length > 0;

                        }
                    );

            const colors = [
                "#b493ff",
                "#ffd27d",
                "#8db5ff",
                "#ff9fd6",
                "#ffffff"
            ];

            const color =
                colors[
                    Math.floor(
                        Math.random() *
                        colors.length
                    )
                ];

            const draft = {

                title:
                    title ||
                    "Untitled Memory",

                date:
                    date,

                description:
                    description,

                tags:
                    tags,

                color:
                    color,

                x:
                    18 +
                    Math.random() * 64,

                y:
                    20 +
                    Math.random() * 60,

                image:
                    null

            };

            const submitButton =
                memoryForm.querySelector(
                    "button[type='submit']"
                );

            if (submitButton) {

                submitButton.disabled = true;

            }

            if (
                imageInput &&
                imageInput.files &&
                imageInput.files.length > 0
            ) {

                const file =
                    imageInput.files[0];

                const reader =
                    new FileReader();

                reader.onload =
                    function () {

                        draft.image =
                            reader.result;

                        finishMemoryCreation(
                            draft,
                            submitButton
                        );

                    };

                reader.onerror =
                    function () {

                        finishMemoryCreation(
                            draft,
                            submitButton
                        );

                    };

                reader.readAsDataURL(file);

            }
            else {

                finishMemoryCreation(
                    draft,
                    submitButton
                );

            }

        }
    );

}


// ======================================================
// FINISH MEMORY CREATION
// Sends the draft to the backend, then renders whatever
// the server actually saved (with its assigned id and
// the final /uploads/... image URL).
// ======================================================

function finishMemoryCreation(draft, submitButton) {

    createMemoryOnServer(draft)
        .then(
            function (memory) {

                memories.push(memory);

                createMemoryStar(memory);

                drawConstellations();

                updateStats();

                closeModal();

                if (memoryForm) {

                    memoryForm.reset();

                }

                showMemory(memory);

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Could not save memory:",
                    error
                );

                alert(
                    "Could not save this memory. Is the server running?"
                );

            }
        )
        .finally(
            function () {

                if (submitButton) {

                    submitButton.disabled = false;

                }

            }
        );

}


// ======================================================
// CLOSE MEMORY PANEL
// ======================================================

const closePanel =
    document.getElementById(
        "closePanel"
    );

if (closePanel) {

    closePanel.addEventListener(
        "click",
        function () {

            if (memoryPanel) {

                memoryPanel.style.display =
                    "none";

            }

        }
    );

}


// ======================================================
// DELETE MEMORY
// ======================================================

const deleteMemory =
    document.getElementById(
        "deleteMemory"
    );

if (deleteMemory) {

    deleteMemory.addEventListener(
        "click",
        function () {

            if (!memoryPanel) {

                return;

            }

            const id =
                Number(
                    memoryPanel.dataset.memoryId
                );

            const index =
                memories.findIndex(
                    function (memory) {

                        return memory.id === id;

                    }
                );

            if (index === -1) {

                return;

            }

            const memory =
                memories[index];

            deleteMemoryOnServer(id)
                .then(
                    function () {

                        if (memory.starElement) {

                            memory.starElement.remove();

                        }

                        memories.splice(
                            index,
                            1
                        );

                        // Remove deleted memory
                        // from albums as well.
                        albums.forEach(
                            function (album) {

                                album.memoryIds =
                                    Array.isArray(
                                        album.memoryIds
                                    )
                                        ? album.memoryIds.filter(
                                            function (memoryId) {

                                                return (
                                                    memoryId !==
                                                    id
                                                );

                                            }
                                        )
                                        : [];

                            }
                        );

                        drawConstellations();

                        updateStats();

                        renderAlbums();

                        memoryPanel.style.display =
                            "none";

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Could not delete memory:",
                            error
                        );

                        alert(
                            "Could not delete this memory. Is the server running?"
                        );

                    }
                );

        }
    );

}


// ======================================================
// SEARCH
// ======================================================

const searchInput =
    document.getElementById(
        "searchInput"
    );

if (searchInput) {

    searchInput.addEventListener(
        "input",
        function (event) {

            const query =
                event.target.value
                    .toLowerCase()
                    .trim();

            memories.forEach(
                function (memory) {

                    if (!memory.starElement) {

                        return;

                    }

                    const searchable =
                        (
                            (memory.title || "") +
                            " " +
                            (memory.description || "") +
                            " " +
                            (
                                Array.isArray(
                                    memory.tags
                                )
                                    ? memory.tags.join(" ")
                                    : ""
                            )
                        )
                        .toLowerCase();

                    const match =
                        query === "" ||
                        searchable.includes(query);

                    memory.starElement.style.opacity =
                        match
                            ? "1"
                            : "0.08";

                }
            );

        }
    );

}


// ======================================================
// ALBUM MODAL
// ======================================================

function openAlbumModal() {

    if (!albumModalOverlay) {

        return;

    }

    renderAlbumMemorySelector();

    albumModalOverlay.style.display =
        "flex";

}


function closeAlbumModal() {

    if (!albumModalOverlay) {

        return;

    }

    albumModalOverlay.style.display =
        "none";

}


if (createAlbumButton) {

    createAlbumButton.addEventListener(
        "click",
        openAlbumModal
    );

}


if (albumModalClose) {

    albumModalClose.addEventListener(
        "click",
        closeAlbumModal
    );

}


if (albumModalOverlay) {

    albumModalOverlay.addEventListener(
        "click",
        function (event) {

            if (
                event.target ===
                albumModalOverlay
            ) {

                closeAlbumModal();

            }

        }
    );

}


// ======================================================
// ALBUM MEMORY SELECTOR
// ======================================================

function renderAlbumMemorySelector() {

    if (!albumMemorySelector) {

        return;

    }

    albumMemorySelector.innerHTML =
        "";

    if (memories.length === 0) {

        albumMemorySelector.innerHTML = `

            <div class="album-no-memories">

                <div>✦</div>

                <p>
                    Create some memories first.
                </p>

            </div>

        `;

        return;

    }

    memories.forEach(
        function (memory) {

            const wrapper =
                document.createElement(
                    "label"
                );

            wrapper.className =
                "album-memory-option";

            const checkbox =
                document.createElement(
                    "input"
                );

            checkbox.type =
                "checkbox";

            checkbox.value =
                memory.id;

            const star =
                document.createElement(
                    "span"
                );

            star.className =
                "album-selector-star";

            const color =
                memory.color ||
                "#b493ff";

            star.style.background =
                color;

            star.style.boxShadow =
                `
                0 0 8px ${color},
                0 0 18px ${color}
                `;

            const info =
                document.createElement(
                    "div"
                );

            info.className =
                "album-memory-info";

            const title =
                document.createElement(
                    "strong"
                );

            title.textContent =
                memory.title ||
                "Untitled Memory";

            const date =
                document.createElement(
                    "small"
                );

            date.textContent =
                formatDate(
                    memory.date
                );

            info.appendChild(title);
            info.appendChild(date);

            wrapper.appendChild(checkbox);
            wrapper.appendChild(star);
            wrapper.appendChild(info);

            albumMemorySelector.appendChild(
                wrapper
            );

        }
    );

}


// ======================================================
// CREATE ALBUM
// ======================================================

if (albumForm) {

    albumForm.addEventListener(
        "submit",
        function (event) {

            event.preventDefault();

            const nameInput =
                document.getElementById(
                    "albumNameInput"
                );

            const descriptionInput =
                document.getElementById(
                    "albumDescriptionInput"
                );

            const name =
                nameInput
                    ? nameInput.value.trim()
                    : "";

            const description =
                descriptionInput
                    ? descriptionInput.value.trim()
                    : "";

            if (!name) {

                return;

            }

            const checked =
                albumMemorySelector
                    ? albumMemorySelector.querySelectorAll(
                        "input[type='checkbox']:checked"
                    )
                    : [];

            const memoryIds =
                Array.from(
                    checked
                ).map(
                    function (checkbox) {

                        return Number(
                            checkbox.value
                        );

                    }
                );

            createAlbumOnServer({
                name: name,
                description: description,
                memoryIds: memoryIds
            })
                .then(
                    function (album) {

                        albums.push(album);

                        albumForm.reset();

                        closeAlbumModal();

                        renderAlbums();

                        updateStats();

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Could not save album:",
                            error
                        );

                        alert(
                            "Could not save this album. Is the server running?"
                        );

                    }
                );

        }
    );

}


// ======================================================
// RENDER ALBUMS
// ======================================================

function renderAlbums() {

    if (!albumsGrid) {

        return;

    }

    albumsGrid.innerHTML =
        "";

    if (albums.length === 0) {

        albumsGrid.innerHTML = `

            <div class="album-empty">

                <div class="album-empty-icon">
                    ▧
                </div>

                <h3>
                    No albums yet
                </h3>

                <p>
                    Create an album to organize
                    your memories.
                </p>

                <button
                    class="empty-album-button"
                    id="emptyCreateAlbum"
                >
                    + Create Album
                </button>

            </div>

        `;

        const button =
            document.getElementById(
                "emptyCreateAlbum"
            );

        if (button) {

            button.addEventListener(
                "click",
                openAlbumModal
            );

        }

        return;

    }

    albums.forEach(
        function (album) {

            // Make old/broken album data safe

            if (
                !Array.isArray(
                    album.memoryIds
                )
            ) {

                album.memoryIds = [];

            }

            const albumMemories =
                album.memoryIds
                    .map(
                        function (id) {

                            return memories.find(
                                function (memory) {

                                    return (
                                        memory.id ===
                                        id
                                    );

                                }
                            );

                        }
                    )
                    .filter(Boolean);

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "album-card";


            // ------------------------------------------
            // PREVIEW
            // ------------------------------------------

            const preview =
                document.createElement(
                    "div"
                );

            preview.className =
                "album-preview";

            albumMemories
                .slice(0, 5)
                .forEach(
                    function (memory) {

                        const star =
                            document.createElement(
                                "span"
                            );

                        star.className =
                            "album-preview-star";

                        const color =
                            memory.color ||
                            "#b493ff";

                        star.style.background =
                            color;

                        star.style.boxShadow =
                            `
                            0 0 10px ${color},
                            0 0 22px ${color}
                            `;

                        preview.appendChild(
                            star
                        );

                    }
                );


            // ------------------------------------------
            // CONTENT
            // ------------------------------------------

            const content =
                document.createElement(
                    "div"
                );

            content.className =
                "album-card-content";

            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                album.name;

            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                album.description ||
                "A collection of memories.";

            const count =
                document.createElement(
                    "span"
                );

            count.className =
                "album-count";

            count.textContent =
                `${albumMemories.length} ${
                    albumMemories.length === 1
                        ? "memory"
                        : "memories"
                }`;

            content.appendChild(title);
            content.appendChild(description);
            content.appendChild(count);


            // ------------------------------------------
            // DELETE ALBUM
            // ------------------------------------------

            const deleteButton =
                document.createElement(
                    "button"
                );

            deleteButton.className =
                "album-delete";

            deleteButton.textContent =
                "×";

            deleteButton.title =
                "Delete album";

            deleteButton.addEventListener(
                "click",
                function (event) {

                    event.stopPropagation();

                    deleteAlbum(
                        album.id
                    );

                }
            );


            card.appendChild(preview);
            card.appendChild(content);
            card.appendChild(deleteButton);


            // ------------------------------------------
            // OPEN ALBUM
            // ------------------------------------------

            card.addEventListener(
                "click",
                function () {

                    openAlbum(
                        album
                    );

                }
            );

            albumsGrid.appendChild(
                card
            );

        }
    );

}


// ======================================================
// OPEN ALBUM
// ======================================================

function openAlbum(album) {

    if (!Array.isArray(album.memoryIds)) {
        album.memoryIds = [];
    }


    const albumMemories =
        album.memoryIds
            .map(
                function (id) {

                    return memories.find(
                        function (memory) {

                            return (
                                memory.id === id
                            );

                        }
                    );

                }
            )
            .filter(Boolean);


    let overlay =
        document.getElementById(
            "albumDetailOverlay"
        );


    /* =========================================
       CREATE ALBUM DETAIL SCREEN
       ========================================= */

    if (!overlay) {

        overlay =
            document.createElement("div");

        overlay.id =
            "albumDetailOverlay";

        overlay.className =
            "album-detail-overlay";

        document.body.appendChild(
            overlay
        );

    }


    overlay.innerHTML = "";


    const container =
        document.createElement("div");

    container.className =
        "album-detail-container";


    /* =========================================
       TOP
    ========================================= */

    const top =
        document.createElement("div");

    top.className =
        "album-detail-top";


    const left =
        document.createElement("div");


    const backButton =
        document.createElement("button");

    backButton.className =
        "album-detail-back";

    backButton.textContent =
        "← Back to Albums";


    backButton.addEventListener(
        "click",
        function () {

            overlay.style.display =
                "none";

        }
    );


    const title =
        document.createElement("h1");

    title.className =
        "album-detail-title";

    title.textContent =
        album.name;


    const description =
        document.createElement("p");

    description.className =
        "album-detail-description";

    description.textContent =
        album.description ||
        "A collection of memories.";


    left.appendChild(
        backButton
    );

    left.appendChild(
        title
    );

    left.appendChild(
        description
    );


    /* =========================================
       ADD MORE MEMORIES BUTTON
    ========================================= */

    const addButton =
        document.createElement("button");

    addButton.className =
        "album-add-memory";

    addButton.textContent =
        "+ Add Memories";


    addButton.addEventListener(
        "click",
        function () {

            openAlbumMemoryPicker(
                album,
                overlay
            );

        }
    );


    top.appendChild(left);

    top.appendChild(addButton);

    container.appendChild(top);


    /* =========================================
       MEMORY GRID
    ========================================= */

    const grid =
        document.createElement("div");

    grid.className =
        "album-detail-memory-grid";


    if (albumMemories.length === 0) {

        const empty =
            document.createElement("div");

        empty.className =
            "album-detail-empty";

        empty.innerHTML = `
            <div style="
                font-size:45px;
                color:#a98aff;
                margin-bottom:15px;
            ">✦</div>

            <h3>
                No memories in this album yet
            </h3>

            <p style="
                margin-top:8px;
                color:#777589;
            ">
                Click "+ Add Memories" to add
                memories to this album.
            </p>
        `;

        grid.appendChild(
            empty
        );

    }
    else {

        albumMemories.forEach(
            function (memory) {

                const card =
                    document.createElement(
                        "div"
                    );

                card.className =
                    "album-detail-memory-card";


                let imageSrc = null;


                if (
                    Array.isArray(
                        memory.images
                    ) &&
                    memory.images.length > 0
                ) {

                    imageSrc =
                        memory.images[0];

                }
                else if (
                    memory.image
                ) {

                    imageSrc =
                        memory.image;

                }


                if (imageSrc) {

                    const image =
                        document.createElement(
                            "img"
                        );

                    image.className =
                        "album-detail-memory-photo";

                    image.src =
                        imageSrc;

                    image.alt =
                        memory.title;

                    card.appendChild(
                        image
                    );

                }
                else {

                    const noImage =
                        document.createElement(
                            "div"
                        );

                    noImage.className =
                        "album-detail-memory-no-photo";

                    noImage.textContent =
                        "✦";

                    card.appendChild(
                        noImage
                    );

                }


                const info =
                    document.createElement(
                        "div"
                    );

                info.className =
                    "album-detail-memory-info";


                const memoryTitle =
                    document.createElement(
                        "h4"
                    );

                memoryTitle.textContent =
                    memory.title;


                const memoryDate =
                    document.createElement(
                        "p"
                    );

                memoryDate.textContent =
                    formatDate(
                        memory.date
                    );


                const photoCount =
                    Array.isArray(
                        memory.images
                    )
                        ? memory.images.length
                        : memory.image
                            ? 1
                            : 0;


                const photoInfo =
                    document.createElement(
                        "p"
                    );

                if (photoCount > 0) {

                    photoInfo.textContent =
                        `${photoCount} ${
                            photoCount === 1
                                ? "photo"
                                : "photos"
                        }`;

                }


                info.appendChild(
                    memoryTitle
                );

                info.appendChild(
                    memoryDate
                );

                if (photoCount > 0) {

                    info.appendChild(
                        photoInfo
                    );

                }


                card.appendChild(
                    info
                );


                card.addEventListener(
                    "click",
                    function () {

                        showMemory(
                            memory
                        );

                    }
                );


                grid.appendChild(
                    card
                );

            }
        );

    }


    container.appendChild(
        grid
    );


    overlay.appendChild(
        container
    );


    overlay.style.display =
        "block";
}

function openAlbumMemoryPicker(
    album,
    albumOverlay
) {

    let picker =
        document.getElementById(
            "albumAddMemoryPicker"
        );


    if (picker) {
        picker.remove();
    }


    picker =
        document.createElement("div");

    picker.id =
        "albumAddMemoryPicker";


    picker.style.position =
        "fixed";

    picker.style.inset =
        "0";

    picker.style.zIndex =
        "500";

    picker.style.display =
        "flex";

    picker.style.alignItems =
        "center";

    picker.style.justifyContent =
        "center";

    picker.style.padding =
        "20px";

    picker.style.background =
        "rgba(0,0,0,0.75)";

    picker.style.backdropFilter =
        "blur(10px)";


    const box =
        document.createElement("div");


    box.style.width =
        "460px";

    box.style.maxWidth =
        "100%";

    box.style.maxHeight =
        "80vh";

    box.style.overflowY =
        "auto";

    box.style.padding =
        "25px";

    box.style.borderRadius =
        "22px";

    box.style.background =
        "#0b0c1d";

    box.style.border =
        "1px solid rgba(255,255,255,0.10)";


    box.innerHTML = `
        <h2 style="
            color:white;
            font-size:22px;
        ">
            Add Memories
        </h2>

        <p style="
            color:#858297;
            font-size:13px;
            margin-top:7px;
        ">
            Select the memories you want
            inside this album.
        </p>
    `;


    const list =
        document.createElement("div");


    list.style.marginTop =
        "20px";


    memories.forEach(
        function (memory) {

            const label =
                document.createElement(
                    "label"
                );


            label.style.display =
                "flex";

            label.style.alignItems =
                "center";

            label.style.gap =
                "12px";

            label.style.padding =
                "12px";

            label.style.marginBottom =
                "8px";

            label.style.borderRadius =
                "12px";

            label.style.background =
                "rgba(255,255,255,0.04)";


            const checkbox =
                document.createElement(
                    "input"
                );


            checkbox.type =
                "checkbox";

            checkbox.value =
                memory.id;


            checkbox.checked =
                album.memoryIds.includes(
                    memory.id
                );


            const text =
                document.createElement(
                    "span"
                );


            text.style.color =
                "#eeeaff";

            text.textContent =
                memory.title ||
                "Untitled Memory";


            label.appendChild(
                checkbox
            );

            label.appendChild(
                text
            );


            list.appendChild(
                label
            );

        }
    );


    box.appendChild(
        list
    );


    const saveButton =
        document.createElement(
            "button"
        );


    saveButton.textContent =
        "Save Memories";


    saveButton.style.width =
        "100%";

    saveButton.style.height =
        "48px";

    saveButton.style.marginTop =
        "18px";

    saveButton.style.borderRadius =
        "12px";

    saveButton.style.color =
        "white";

    saveButton.style.background =
        "linear-gradient(135deg,#8055e8,#633cc2)";


    saveButton.addEventListener(
        "click",
        function () {

            const checked =
                list.querySelectorAll(
                    "input[type='checkbox']:checked"
                );


            const memoryIds =
                Array.from(
                    checked
                ).map(
                    function (input) {

                        return Number(
                            input.value
                        );

                    }
                );


            updateAlbumOnServer(
                album.id,
                { memoryIds: memoryIds }
            )
                .then(
                    function (updatedAlbum) {

                        album.memoryIds =
                            updatedAlbum.memoryIds;

                        picker.remove();

                        openAlbum(
                            album
                        );

                    }
                )
                .catch(
                    function (error) {

                        console.error(
                            "Could not update album:",
                            error
                        );

                        alert(
                            "Could not save changes. Is the server running?"
                        );

                    }
                );

        }
    );


    box.appendChild(
        saveButton
    );


    picker.appendChild(
        box
    );


    document.body.appendChild(
        picker
    );
}


// ======================================================
// DELETE ALBUM
// ======================================================

function deleteAlbum(albumId) {

    const index =
        albums.findIndex(
            function (album) {

                return (
                    album.id === albumId
                );

            }
        );

    if (index === -1) {

        return;

    }

    const confirmed =
        confirm(
            "Delete this album? Your memories will not be deleted."
        );

    if (!confirmed) {

        return;

    }

    deleteAlbumOnServer(albumId)
        .then(
            function () {

                albums.splice(
                    index,
                    1
                );

                renderAlbums();

                updateStats();

            }
        )
        .catch(
            function (error) {

                console.error(
                    "Could not delete album:",
                    error
                );

                alert(
                    "Could not delete this album. Is the server running?"
                );

            }
        );

}


// ======================================================
// NAVIGATION
// ======================================================

const navItems =
    document.querySelectorAll(
        ".nav-item"
    );

navItems.forEach(
    function (item) {

        item.addEventListener(
            "click",
            function () {

                navItems.forEach(
                    function (nav) {

                        nav.classList.remove(
                            "active"
                        );

                    }
                );

                item.classList.add(
                    "active"
                );

                const text =
                    item.querySelector(
                        ".nav-text"
                    );

                if (!text) {

                    return;

                }

                const name =
                    text.textContent
                        .trim()
                        .toLowerCase();


                // ----------------------------------
                // GALAXY
                // ----------------------------------

                if (
                    name === "galaxy"
                ) {

                    if (timelineView) {

                        timelineView.style.display =
                            "none";

                    }

                    if (albumsView) {

                        albumsView.style.display =
                            "none";

                    }

                    if (galaxy) {

                        galaxy.style.display =
                            "block";

                    }

                    if (emptyMessage) {

                        emptyMessage.style.display =
                            memories.length === 0
                                ? "block"
                                : "none";

                    }

                }


                // ----------------------------------
                // TIMELINE
                // ----------------------------------

                if (
                    name === "timeline"
                ) {

                    if (galaxy) {

                        galaxy.style.display =
                            "none";

                    }

                    if (emptyMessage) {

                        emptyMessage.style.display =
                            "none";

                    }

                    if (albumsView) {

                        albumsView.style.display =
                            "none";

                    }

                    if (timelineView) {

                        timelineView.style.display =
                            "block";

                    }

                    renderTimeline();

                }


                // ----------------------------------
                // ALBUMS
                // ----------------------------------

                if (
                    name === "albums"
                ) {

                    if (galaxy) {

                        galaxy.style.display =
                            "none";

                    }

                    if (emptyMessage) {

                        emptyMessage.style.display =
                            "none";

                    }

                    if (timelineView) {

                        timelineView.style.display =
                            "none";

                    }

                    if (albumsView) {

                        albumsView.style.display =
                            "block";

                    }

                    renderAlbums();

                }

            }
        );

    }
);


// ======================================================
// ZOOM
// ======================================================

let zoom =
    100;

const zoomValue =
    document.getElementById(
        "zoomValue"
    );

const zoomIn =
    document.getElementById(
        "zoomIn"
    );

const zoomOut =
    document.getElementById(
        "zoomOut"
    );

function updateZoom() {

    if (zoomValue) {

        zoomValue.textContent =
            zoom + "%";

    }

    if (memoryStars) {

        memoryStars.style.transform =
            `scale(${zoom / 100})`;

        memoryStars.style.transformOrigin =
            "center center";

    }

}

if (zoomIn) {

    zoomIn.addEventListener(
        "click",
        function () {

            zoom =
                Math.min(
                    zoom + 10,
                    200
                );

            updateZoom();

        }
    );

}

if (zoomOut) {

    zoomOut.addEventListener(
        "click",
        function () {

            zoom =
                Math.max(
                    zoom - 10,
                    50
                );

            updateZoom();

        }
    );

}


// ======================================================
// ESCAPE
// ======================================================

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key === "Escape"
        ) {

            closeModal();

            closeAlbumModal();

            if (memoryPanel) {

                memoryPanel.style.display =
                    "none";

            }

        }

    }
);


// ======================================================
// TIMELINE
// ======================================================

function renderTimeline() {

    if (!timelineList) {

        return;

    }

    timelineList.innerHTML =
        "";

    if (memories.length === 0) {

        timelineList.innerHTML = `

            <div class="timeline-empty">

                <div class="timeline-empty-icon">
                    ✦
                </div>

                <h3>
                    Your timeline is empty
                </h3>

                <p>
                    Create a memory to begin
                    your journey.
                </p>

            </div>

        `;

        return;

    }

    const sorted =
        [...memories].sort(
            function (a, b) {

                return (
                    new Date(b.date) -
                    new Date(a.date)
                );

            }
        );

    sorted.forEach(
        function (memory) {

            const item =
                document.createElement(
                    "div"
                );

            item.className =
                "timeline-item";

            const dot =
                document.createElement(
                    "div"
                );

            dot.className =
                "timeline-dot";

            dot.style.background =
                memory.color;

            dot.style.boxShadow =
                `
                0 0 10px ${memory.color},
                0 0 25px ${memory.color}
                `;

            const card =
                document.createElement(
                    "div"
                );

            card.className =
                "timeline-card";

            const date =
                document.createElement(
                    "div"
                );

            date.className =
                "timeline-date";

            date.textContent =
                formatDate(
                    memory.date
                );

            const title =
                document.createElement(
                    "h3"
                );

            title.textContent =
                memory.title;

            const description =
                document.createElement(
                    "p"
                );

            description.textContent =
                memory.description;

            const tags =
                document.createElement(
                    "div"
                );

            tags.className =
                "timeline-tags";

            const memoryTags =
                Array.isArray(memory.tags)
                    ? memory.tags
                    : [];

            memoryTags.forEach(
                function (tag) {

                    const tagElement =
                        document.createElement(
                            "span"
                        );

                    tagElement.textContent =
                        tag;

                    tags.appendChild(
                        tagElement
                    );

                }
            );

            card.appendChild(date);
            card.appendChild(title);
            card.appendChild(description);
            card.appendChild(tags);

            item.appendChild(dot);
            item.appendChild(card);

            card.addEventListener(
                "click",
                function () {

                    showMemory(
                        memory
                    );

                }
            );

            timelineList.appendChild(
                item
            );

        }
    );

}


// ======================================================
// INITIALIZE
// Loads memories + albums from the backend, then renders
// everything once the data has actually arrived.
// ======================================================

createBackgroundStars();

// Make sure Galaxy starts visible while data loads

if (galaxy) {

    galaxy.style.display =
        "block";

}

if (timelineView) {

    timelineView.style.display =
        "none";

}

if (albumsView) {

    albumsView.style.display =
        "none";

}

function renderLoadedData() {

    // Clear dynamically generated
    // memory stars before rebuilding.

    if (memoryStars) {

        const existingStars =
            memoryStars.querySelectorAll(
                ".memory-star-container"
            );

        existingStars.forEach(
            function (element) {

                element.remove();

            }
        );

    }

    // Re-create saved memory stars

    memories.forEach(
        function (memory) {

            createMemoryStar(
                memory
            );

        }
    );

    // Draw constellation lines

    drawConstellations();

    // Render albums

    renderAlbums();

    // Update counters

    updateStats();

}

Promise.all(
    [fetchMemories(), fetchAlbums()]
)
    .then(
        function (results) {

            memories = results[0] || [];
            albums = results[1] || [];

            renderLoadedData();

            console.log(
                "🌌 GalaxyMemory loaded successfully!"
            );

            console.log(
                "Memories:",
                memories.length
            );

            console.log(
                "Albums:",
                albums.length
            );

        }
    )
    .catch(
        function (error) {

            console.error(
                "Could not load data from server:",
                error
            );

            if (emptyMessage) {

                emptyMessage.querySelector("h2").textContent =
                    "Could not reach the server";

                const message =
                    emptyMessage.querySelector("p");

                if (message) {

                    message.textContent =
                        "Make sure the GalaxyMemory backend is running, then refresh this page.";

                }

                emptyMessage.style.display =
                    "flex";

            }

        }
    );