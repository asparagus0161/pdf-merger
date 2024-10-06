// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.10.377/pdf.worker.min.js';

let selectedFiles = []; // Store the actual File objects

document.getElementById('select-pdfs-btn').addEventListener('click', function() {
    document.getElementById('pdf-input').click();
});

document.getElementById('pdf-input').addEventListener('change', async function(event) {
    const files = Array.from(event.target.files);
    selectedFiles = files; // Store the files
    const pdfGrid = document.querySelector('.pdf-grid');
    pdfGrid.innerHTML = '';  // Clear the grid

    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const arrayBuffer = await file.arrayBuffer();
        
        // Load the PDF using PDF.js
        const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
        try {
            const pdf = await loadingTask.promise;
            const page = await pdf.getPage(1);
            const viewport = page.getViewport({ scale: 0.5 });
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('2d');
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            const pdfItem = document.createElement('div');
            pdfItem.classList.add('pdf-item');
            pdfItem.setAttribute('draggable', 'true');
            pdfItem.setAttribute('data-index', i);

            // Create a thumbnail container
            const thumbnailContainer = document.createElement('div');
            thumbnailContainer.classList.add('thumbnail-container');
            thumbnailContainer.appendChild(canvas);
            pdfItem.appendChild(thumbnailContainer);

            // Add the PDF file name as a title
            const pdfTitle = document.createElement('div');
            pdfTitle.innerText = file.name;
            pdfTitle.classList.add('pdf-title');
            pdfItem.appendChild(pdfTitle);

            // Add event listeners for drag and drop
            pdfItem.addEventListener('dragstart', dragStart);
            pdfItem.addEventListener('dragover', dragOver);
            pdfItem.addEventListener('drop', drop);
            pdfItem.addEventListener('dragend', dragEnd);

            pdfGrid.appendChild(pdfItem);
        } catch (error) {
            console.error('Error loading PDF:', error);
        }
    }
});

let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target.closest('.pdf-item');
    setTimeout(() => {
        draggedItem.classList.add('dragging');
    }, 0);
}

function dragOver(event) {
    event.preventDefault();
    const currentItem = event.target.closest('.pdf-item');
    if (!currentItem || currentItem === draggedItem) return;

    const grid = document.querySelector('.pdf-grid');
    const items = Array.from(grid.children);
    const draggedIndex = items.indexOf(draggedItem);
    const targetIndex = items.indexOf(currentItem);

    if (draggedIndex !== targetIndex) {
        if (draggedIndex < targetIndex) {
            grid.insertBefore(draggedItem, currentItem.nextSibling);
        } else {
            grid.insertBefore(draggedItem, currentItem);
        }
        updateFileOrder();
    }
}

function dragEnd(event) {
    if (draggedItem) {
        draggedItem.classList.remove('dragging');
        draggedItem = null;
    }
}

function drop(event) {
    event.preventDefault();
}

function updateFileOrder() {
    const grid = document.querySelector('.pdf-grid');
    const newOrder = Array.from(grid.children).map(item => {
        const index = parseInt(item.getAttribute('data-index'));
        return selectedFiles[index];
    });
    selectedFiles = newOrder;
}

document.getElementById('merge-pdfs-btn').addEventListener('click', async function() {
    try {
        // Convert files to array buffers
        const pdfDataArray = await Promise.all(selectedFiles.map(async (file) => {
            const arrayBuffer = await file.arrayBuffer();
            return {
                name: file.name,
                data: Array.from(new Uint8Array(arrayBuffer)) // Convert to regular array for eel transfer
            };
        }));
        
        // Send the PDF data to Python
        const result = await eel.merge_pdfs(pdfDataArray)();
        if (result) {
            alert('PDFs merged successfully!');
        } else {
            alert('Error merging PDFs. Please check the console for details.');
        }
    } catch (error) {
        console.error('Error preparing files for merge:', error);
        alert('Error preparing files for merge. Please check the console for details.');
    }
});