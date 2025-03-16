@echo off

set port=8000

@rem start python server
echo Server URL: http://localhost:%port%
python -m http.server %port%