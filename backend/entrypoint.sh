#!/bin/bash
export FLASK_APP=run.py
flask db upgrade
exec gunicorn --bind 0.0.0.0:5000 run:app
