# Thinkboard

A full-stack note-taking app that captures your thoughts as notes with two fields: **title** and **description**. Notes are saved to **MongoDB**, and you can perform full **CRUD** operations on them.

![Node.js](https://img.shields.io/badge/Node.js-339933?logo=node.js&logoColor=white)
![Express.js](https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?logo=mongodb&logoColor=white)
![React](https://img.shields.io/badge/React-19-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-38B2AC?logo=tailwind-css&logoColor=white)
![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)

## Features

- Create a note with a title and description
- View all notes
- View a single note by ID
- Update an existing note
- Delete a note
- Store notes in MongoDB
- RESTful API endpoints
- Timestamps for created and updated notes
- Rate limiting powered by Upstash Redis
- Clean separation between frontend and backend
- Toast notifications for user feedback
- Responsive UI with Tailwind CSS + DaisyUI

## Tech Stack

### Backend

- Node.js (ES Modules)
- Express 5
- MongoDB + Mongoose 9
- Upstash Redis + Upstash Ratelimit
- CORS
- dotenv
- Nodemon (development)

### Frontend

- React 19
- Vite
- React Router 7
- Axios
- Tailwind CSS 3
- DaisyUI 4
- lucide-react (icons)
- react-hot-toast (notifications)
- ESLint

## Project Structure

```text
Thinkboard/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   └── noteController.js
│   ├── middleware/
│   │   └── rateLimiter.js
│   ├── models/
│   │   └── Note.js
│   ├── routes/
│   │   └── noteRoutes.js
│   ├── .env
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── lib/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   ├── vite.config.js
│   ├── .env
│   └── package.json
└── README.md
```

> Adjust the folder names to match your actual structure.

## Getting Started

### Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher)
- npm
- MongoDB locally or a MongoDB Atlas account
- An [Upstash](https://upstash.com/) Redis database (free tier works fine)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/Thinkboard.git
cd Thinkboard
```

### 2. Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend` folder:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/thinkboard

# Upstash Redis (for rate limiting)
UPSTASH_REDIS_REST_URL=your_upstash_redis_rest_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_redis_rest_token
```

If you are using MongoDB Atlas, replace `MONGO_URI` with your Atlas connection string:

```env
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/thinkboard
```

Start the backend server:

```bash
npm run dev
```

The API will run at:

```text
http://localhost:5000
```

### 3. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend` folder:

```env
VITE_API_URL=http://localhost:5000
```

> ⚠️ Note: Vite only exposes environment variables that start with `VITE_`. Use `import.meta.env.VITE_API_URL` in your code.

Start the frontend dev server:

```bash
npm run dev
```

The app will open at:

```text
http://localhost:5173
```

### 4. Build for Production

```bash
cd frontend
npm run build
npm run preview
```

## Available Scripts

### Backend (`backend/package.json`)

| Script        | Description                 |
| ------------- | --------------------------- |
| `npm run dev` | Start backend with Nodemon  |
| `npm start`   | Start backend in production |

### Frontend (`frontend/package.json`)

| Script            | Description                  |
| ----------------- | ---------------------------- |
| `npm run dev`     | Start Vite dev server        |
| `npm run build`   | Build for production         |
| `npm run preview` | Preview the production build |
| `npm run lint`    | Run ESLint                   |

## API Endpoints

| Method | Endpoint     | Description             |
| ------ | ------------ | ----------------------- |
| GET    | `/notes`     | Get all notes           |
| GET    | `/notes/:id` | Get a single note by ID |
| POST   | `/notes`     | Create a new note       |
| PUT    | `/notes/:id` | Update a note           |
| DELETE | `/notes/:id` | Delete a note           |

> All endpoints are protected by Upstash Ratelimit middleware.

### Request Body Example

```json
{
  "title": "My first note",
  "description": "This is the content of my note."
}
```

### Response Example

```json
{
  "_id": "64f8c2a1b5d3e2f1a9c8b7d6",
  "title": "My first note",
  "description": "This is the content of my note.",
  "createdAt": "2025-01-01T10:00:00.000Z",
  "updatedAt": "2025-01-01T10:00:00.000Z"
}
```

## Data Model

```js
// backend/models/Note.js
import mongoose from "mongoose";

const noteSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true },
);

const Note = mongoose.model("Note", noteSchema);

export default Note;
```

## Rate Limiting

Thinkboard uses **Upstash Ratelimit** backed by **Upstash Redis** to protect the API from abuse.

Example middleware setup:

```js
// backend/middleware/rateLimiter.js
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

const redis = Redis.fromEnv();

export const rateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, "10 s"),
  analytics: true,
  prefix: "@upstash/ratelimit/thinkboard",
});
```

Apply it in your routes:

```js
import { rateLimiter } from "../middleware/rateLimiter.js";

router.post(
  "/",
  async (req, res, next) => {
    const { success } = await rateLimiter.limit(req.ip);
    if (!success) {
      return res.status(429).json({ message: "Too many requests" });
    }
    next();
  },
  createNote,
);
```

## Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
UPSTASH_REDIS_REST_URL=your_upstash_url
UPSTASH_REDIS_REST_TOKEN=your_upstash_token
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000
```

## Usage

1. Start MongoDB.
2. Start the backend server (`cd backend && npm run dev`).
3. Start the frontend dev server (`cd frontend && npm run dev`).
4. Open your browser at `http://localhost:5173`.
5. Create, read, update, and delete notes through the UI.

You can also test the API directly using Postman, Insomnia, Thunder Client, or curl.

### Example curl Request

```bash
curl -X POST http://localhost:5000/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Shopping list","description":"Milk, eggs, bread"}'
```

## Screenshots

Add screenshots or a demo GIF here.

```md
![Thinkboard Screenshot](./screenshots/thinkboard.png)
```

## Future Improvements

- Add user authentication
- Add note categories or tags
- Add search and filtering
- Add dark mode toggle
- Add pagination
- Add tests
- Deploy backend (Render / Railway) and frontend (Vercel / Netlify)

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch:

```bash
git checkout -b feature/your-feature-name
```

3. Commit your changes:

```bash
git commit -m "Add your feature"
```

4. Push to your branch:

```bash
git push origin feature/your-feature-name
```

5. Open a pull request.

## License

This project is licensed under the MIT License.

## Author

Oloruntoba jethro Jetawo  
GitHub: [@tobajetex](https://github.com/tobajetex)
