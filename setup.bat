@echo off
echo 🛡️  CyberShield Sentinel — AI-Powered Scam Intelligence Platform
echo =================================================================

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Node.js not found. Please install from https://nodejs.org
    pause
    exit /b 1
)

echo ✅ Node.js detected

echo.
echo 📦 Installing backend dependencies...
cd backend
call npm install

if not exist .env (
    copy .env.example .env
    echo ✅ Created backend\.env
)

cd ..

echo.
echo 📦 Installing frontend dependencies...
cd frontend
call npm install

if not exist .env (
    copy .env.example .env
    echo ✅ Created frontend\.env
)

cd ..

echo.
echo =================================================================
echo ✅ Setup complete!
echo.
echo   Open TWO terminal windows and run:
echo.
echo   Terminal 1: cd backend ^&^& node server.js
echo   Terminal 2: cd frontend ^&^& npm start
echo.
echo   Frontend:  http://localhost:3000
echo   Backend:   http://localhost:5000/api/health
echo =================================================================
pause
