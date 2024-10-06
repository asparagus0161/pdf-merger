import eel
import os
import sys
from pypdf import PdfWriter, PdfReader
import io

# Determine if application is a script file or frozen exe
if getattr(sys, 'frozen', False):
    application_path = sys._MEIPASS
else:
    application_path = os.path.dirname(os.path.abspath(__file__))

# Initialize eel with your web files directory
eel.init(os.path.join(application_path, 'web'))

@eel.expose
def merge_pdfs(pdf_data_array):
    """Merge the PDFs in the given order and save the output in the Downloads folder."""
    try:
        merger = PdfWriter()

        for pdf_data in pdf_data_array:
            # Convert the array back to bytes
            pdf_bytes = bytes(pdf_data['data'])
            
            # Create a BytesIO object from the PDF data
            pdf_stream = io.BytesIO(pdf_bytes)
            
            # Read the PDF from the BytesIO object
            pdf = PdfReader(pdf_stream)
            merger.append(pdf)

        # Get the user's "Downloads" folder path
        downloads_folder = os.path.join(os.path.expanduser("~"), "Downloads")
        if not os.path.exists(downloads_folder):
            os.makedirs(downloads_folder)

        output_path = os.path.join(downloads_folder, 'merged_output.pdf')
        
        # Write the merged PDF
        with open(output_path, 'wb') as output_file:
            merger.write(output_file)

        print(f"Merged PDF saved as {output_path}")
        return True

    except Exception as e:
        print(f"Error during PDF merge: {e}")
        return False

# Start the application
if __name__ == '__main__':
    try:
        # Use Chrome app mode if available
        eel.start('main.html', mode='chrome-app', size=(1366, 768))
    except EnvironmentError:
        # If Chrome isn't found, fall back to Microsoft Edge
        try:
            eel.start('main.html', mode='edge', size=(1366, 768))
        except:
            # If no supported browsers are found, use the default system browser
            eel.start('main.html', mode='default', size=(1366, 768))