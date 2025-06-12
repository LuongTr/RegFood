:: filepath: d:\Code_Space\RegFood\backend\run_food_recognition.bat
@echo off
echo RegFood - Food Recognition System
echo =====================================
echo.

:: Check if model exists
if not exist food_model\food_model.keras (
    echo No trained model found! Would you like to train the model now? (Y/N)
    set /p TRAIN_CHOICE=
    if /i "%TRAIN_CHOICE%"=="Y" (
        echo.
        echo Training model (this may take some time)...
        python train_model.py --epochs 1
    ) else (
        echo.
        echo Cannot continue without a trained model. Exiting.
        exit /b 1
    )
)

echo.
echo Starting Food Recognition Server...
echo The server will be available at http://localhost:5001
echo Press Ctrl+C to stop the server
echo.

python app.py