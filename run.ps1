Write-Host "Starting the application..."

# Start backend server
Write-Host "Starting backend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd backend; python app.py"

# Wait for backend to start
Start-Sleep -Seconds 5

# Start frontend server
Write-Host "Starting frontend server..."
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd frontend; npm start"

Write-Host "Application started!"
Write-Host "Backend running at http://localhost:5000"
Write-Host "Frontend running at http://localhost:3000"
Write-Host ""
Write-Host "If you see 404 errors, please wait a few seconds and refresh the page."
Write-Host "The servers may take a moment to fully start up." 