# Navigate to backend
cd d:\VNIT\personal_life_os\backend

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn app.main:app --reload



# Navigate to frontend
cd d:\VNIT\personal_life_os\frontend

# Install dependencies
npm install

# Start the development server
npm run dev


cd d:\VNIT\personal_life_os
docker-compose up --build
