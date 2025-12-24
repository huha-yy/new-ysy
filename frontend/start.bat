@echo off
chcp 65001 >nul
echo ========================================
echo    🌞 户外徒步活动管理系统 - 前端
echo ========================================
echo.
echo 🚀 正在启动开发服务器...
echo.
echo 📍 访问地址: http://localhost:5173
echo 📍 后端地址: http://localhost:8080
echo.
echo 💡 提示:
echo    - 确保后端服务已启动 (http://localhost:8080)
echo    - 首次运行会自动安装依赖
echo    - 按 Ctrl+C 可停止服务
echo.
echo ========================================
echo.

cd /d "%~dp0"
if exist node_modules (
    echo ✓ 依赖已安装
    npm run dev
) else (
    echo ⏳ 首次运行，正在安装依赖...
    call npm install
    echo ✓ 依赖安装完成
    npm run dev
)

pause


