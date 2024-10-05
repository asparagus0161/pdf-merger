import eel

eel.init('web')

@eel.expose
def process_selected_pdfs(file_paths):
    """Process the selected PDF files."""
    print(f"Selected PDF files: {file_paths}")
    # Store these file paths for later merging

@eel.expose
def update_pdf_order(new_order):
    """Update the order of PDFs to merge."""
    print(f"Updated PDF order: {new_order}")
    # Update the merging order or process accordingly

eel.start('main.html', mode='custom', cmdline_args=['node_modules/electron/dist/electron.exe', '.'])
