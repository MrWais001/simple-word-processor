const editor = document.getElementById("editor");
const wordCountDisplay = document.getElementById("wordCount");
const charCountDisplay = document.getElementById("charCount");

// Text Formatting
function format(command, value = null) {
  document.execCommand(command, false, value);
  updateCounts();
}

// Undo and Redo
function undo() {
  document.execCommand("undo");
}

function redo() {
  document.execCommand("redo");
}

// Word and Character Count
editor.addEventListener("input", updateCounts);

function updateCounts() {
  const text = editor.innerText.trim();
  const words = text.match(/\b\S+\b/g) || [];
  wordCountDisplay.textContent = words.length;
  charCountDisplay.textContent = text.length;
}

// File Export
function exportToFile() {
  const blob = new Blob([editor.innerText], { type: "text/plain" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "document.txt";
  link.click();
}

// File Import
// function importFromFile() {
//   const fileInput = document.getElementById("fileInput");
//   const file = fileInput.files[0];
//   if (file) {
//     const reader = new FileReader();
//     reader.onload = (e) => {
//       editor.innerText = e.target.result;
//       updateCounts();
//     };
//     reader.readAsText(file);
//   }
// }

function importFromFile() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  const supportedTypes = [
    "text/plain",
    "text/html",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ];

  if (file) {
    if (!supportedTypes.includes(file.type)) {
      alert(
        "Unsupported file type. Please upload a .txt, .html, or .docx file."
      );
      return;
    }

    const reader = new FileReader();

    if (
      file.type ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      reader.onload = (e) => {
        const arrayBuffer = e.target.result;
        mammoth
          .convertToHtml({ arrayBuffer: arrayBuffer })
          .then((result) => {
            editor.innerHTML = result.value;
            updateCounts();
          })
          .catch((err) => {
            console.error("Error converting DOCX to HTML:", err);
          });
      };
      reader.readAsArrayBuffer(file);
    } else {
      reader.onload = (e) => {
        editor.innerText = e.target.result;
        updateCounts();
      };
      reader.readAsText(file);
    }
  }
}

// Change font family and size
document.getElementById("fontFamily").addEventListener("change", (e) => {
  const selectedFont = e.target.value;
  editor.style.fontFamily = selectedFont;
});

document.getElementById("fontSize").addEventListener("change", (e) => {
  format("fontSize", e.target.value);
});

// Auto-save interval in milliseconds (e.g., 5 seconds)
const AUTO_SAVE_INTERVAL = 5000;

// Load document content on page load
async function loadDocument() {
  try {
    const response = await fetch("/document");
    const data = await response.json();
    editor.innerText = data.content || "Start typing here...";
  } catch (error) {
    console.error("Error loading document:", error);
  }
}

// Auto-save function to save content every interval
async function autoSave() {
  const content = editor.innerText;
  try {
    await fetch("/document", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content }),
    });
    console.log("Document auto-saved.");
  } catch (error) {
    console.error("Error saving document:", error);
  }
}

// Print Document
function printDocument() {
  const printWindow = window.open("", "_blank"); // Open a new blank window
  const editorContent = editor.innerHTML; // Get the content of the editor

  // Create the HTML structure for the print window
  printWindow.document.open();
  printWindow.document.write(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Print Document</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 20px;
        }
      </style>
    </head>
    <body>
      ${editorContent}
    </body>
    </html>
  `);
  printWindow.document.close();

  // Trigger the print dialog
  printWindow.print();

  // Close the print window after printing
  printWindow.onafterprint = function () {
    printWindow.close();
  };
}

// Add other code here...

// Initialize auto-save
loadDocument();
setInterval(autoSave, AUTO_SAVE_INTERVAL);
