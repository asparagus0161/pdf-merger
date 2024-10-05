
document.getElementById('select-pdfs-btn').addEventListener('click', function () {
    document.getElementById('pdf-input').click();
});

document.getElementById('pdf-input').addEventListener('change', function (event) {
    const files = Array.from(event.target.files);
    const pdfGrid = document.querySelector('.pdf-grid');
    pdfGrid.innerHTML = '';  // Clear the grid

    files.forEach((file, index) => {
        // Create a grid item for each PDF
        const pdfItem = document.createElement('div');
        pdfItem.classList.add('pdf-item');
        pdfItem.setAttribute('draggable', 'true');
        pdfItem.setAttribute('data-index', index);
        pdfItem.innerText = file.name;

        // Add event listeners for drag and drop functionality
        pdfItem.addEventListener('dragstart', dragStart);
        pdfItem.addEventListener('dragover', dragOver);
        pdfItem.addEventListener('drop', drop);
        pdfItem.addEventListener('dragend', dragEnd);

        // Append the grid item to the grid
        pdfGrid.appendChild(pdfItem);
    });

    // Function to pass selected files' paths to Python backend
    const filePaths = files.map(file => file.path);
    eel.process_selected_pdfs(filePaths);  // Call Python function
});

let draggedItem = null;

function dragStart(event) {
    draggedItem = event.target;
    setTimeout(() => {
        event.target.classList.add('dragging');
    }, 0); // Small delay to avoid applying opacity immediately
}

function dragOver(event) {
    event.preventDefault();
    const currentItem = event.target;
    const grid = document.querySelector('.pdf-grid');

    if (currentItem !== draggedItem) {
        const items = Array.from(grid.children);
        const draggedIndex = items.indexOf(draggedItem);
        const targetIndex = items.indexOf(currentItem);

        // Insert dragged item dynamically with smooth transition
        if (draggedIndex < targetIndex) {
            grid.insertBefore(draggedItem, currentItem.nextSibling);
        } else {
            grid.insertBefore(draggedItem, currentItem);
        }
    }
}

function dragEnd(event) {
    event.target.classList.remove('dragging');

    // Update the order of the files based on the new arrangement
    const grid = document.querySelector('.pdf-grid');
    const newOrder = Array.from(grid.children).map(item => item.innerText);
    console.log('New file order:', newOrder);

    // Optionally pass the new order to Python backend
    eel.update_pdf_order(newOrder);
}


function drop(event) {
    event.preventDefault();
}
