#!/bin/bash

# Railway deployment script for Whip Montez app
# Installs and runs backend on specified port

set -e

echo "Installing backend dependencies..."
cd backend
npm install

echo "Starting backend server..."
npm start
