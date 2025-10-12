# PowerShell script to start the FastAPI backend server
$env:PYTHONPATH = "C:\Users\moham\OneDrive\Documents\GitHub\RecruBotX\Backend"
Set-Location "C:\Users\moham\OneDrive\Documents\GitHub\RecruBotX\Backend"
uvicorn main:app --reload --port 8000
