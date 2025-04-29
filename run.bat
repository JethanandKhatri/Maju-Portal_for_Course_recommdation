@echo off
echo Starting the application...

echo Starting backend server...
start cmd /k "cd backend && python app.py"

echo Starting frontend server...
start cmd /k "cd frontend && npx serve -s build --no-clipboard"

echo Application started!
echo Backend running at http://localhost:5000
echo Frontend running at http://localhost:3000

echo.
echo If you see 404 errors, please wait a few seconds and refresh the page.
echo The servers may take a moment to fully start up. 