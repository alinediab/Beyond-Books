Beyond Books is a full-stack university platform supporting non-academic student activities, including:

- Clubs
- Events
- Lost & Found
- Research projects
- Multiple roles including Student, Professor, and Student Affairs Officer, each with its own permissions

---

## Contributors

- **Aline Diab** — [@alinediab](https://github.com/alinediab)
- **Karim Nehme** — [@karim-nehme](https://github.com/karim-nehme)


## Project Structure

```
Beyond-Books/
│
├── frontend/      # User interface
├── backend/       # Server-side logic and APIs
├── .gitignore     # Files/folders to ignore
├── .env.example   # Template for environment variables
└── README.md      # This file
```

---

## Backend Setup

1. Navigate to the backend folder:

```bash
cd backend
```

2. Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

3. Open `.env` and fill in your database credentials. For example:

```env
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=StudentActivitiesDb
```

4. Install dependencies:

```bash
npm install
```

5. Start the server:

```bash
npm run dev
```

---

## Frontend Setup

1. Navigate to the frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Start the frontend:

```bash
npm start
```

---

## Notes

- `.env` contains sensitive credentials and is **never uploaded to GitHub**.  
- `.env.example` provides placeholder values so developers can set up their own environment.  
- Make sure MySQL is running locally before starting the backend.
