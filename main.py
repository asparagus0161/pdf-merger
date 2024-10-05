import eel
eel.init('web')

@eel.expose
def process_selected_pdfs(file_paths):
    print(f"Selected PDF files: {file_paths}")
    



eel.start('main.html', mode='custom', cmdline_args=['node_modules/electron/dist/electron.exe', '.'])
