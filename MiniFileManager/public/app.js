const fileNameInput = document.getElementById("filename");
const fileContentInput = document.getElementById("content");
const messageInput = document.getElementById("message");
const fileList = document.getElementById("fileList");

async function createFile() {
    try {
        const fileName = fileNameInput.value.trim();
        const fileContent = fileContentInput.value;

        if (!fileName) {
            messageInput.textContent = "Please enter a filename.";
            return;
        }

        const response = await fetch("/api/createFile", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ fileName, fileContent })
        });

        const data = await response.json();

        messageInput.textContent = data.message;

        if (response.ok && data.success) {
            fileNameInput.value = "";
            fileContentInput.value = "";
        }
    } catch (error) {
        console.error("Error creating file:", error);
        messageInput.textContent = "Unable to create the file.";
    }
}

async function showFiles() {
    try {
        const response = await fetch("/api/showFiles");

        if (!response.ok) {
            throw new Error("Failed to retrieve files");
        }

        const files = await response.json();

        fileList.innerHTML = "";

        if (files.length === 0) {
            fileList.textContent = "No files found.";
            return;
        }

        files.forEach((filename) => {
            const element = document.createElement("li");
            element.textContent = filename;
            fileList.appendChild(element);
        });
    } catch (error) {
        console.error("Error fetching files:", error);
        fileList.textContent = "Unable to load files.";
    }
}

async function getSystemInfo() {
    try {
        const response = await fetch("/api/getSystemInfo");

        if (!response.ok) {
            throw new Error("Failed to retrieve system information");
        }

        const info = await response.json();

        const systemInfo = document.getElementById("systemInfo");
        systemInfo.innerHTML = "";

        const details = [
            ["Platform", info.platform],
            ["Architecture", info.architecture],
            ["Hostname", info.hostname],
            ["Node.js Version", info.nodeVersion],
            ["CPU Model", info.cpu[0]?.model ?? "Unavailable"],
            ["CPU Speed", info.cpu[0]?.speed
                ? `${info.cpu[0].speed} MHz`
                : "Unavailable"],
            ["Total Memory", `${(info.totalMemory / (1024 ** 3)).toFixed(2)} GiB`],
            ["Free Memory", `${(info.freeMemory / (1024 ** 3)).toFixed(2)} GiB`]
        ];

        details.forEach(([label, value]) => {
            const element = document.createElement("div");
            element.textContent = `${label}: ${value}`;
            systemInfo.appendChild(element);
        });
    } catch (error) {
        console.error("Error fetching system information:", error);

        document.getElementById("systemInfo").textContent =
            "Unable to load system information.";
    }
}