@echo off
echo Creating migrations...
python manage.py makemigrations
echo.
echo Applying migrations...
python manage.py migrate
echo.
echo Migration complete!
pause
