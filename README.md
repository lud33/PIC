# PIC — Partner In Crime

Meet people, join experiences, and make plans that turn into memorable moments.

PIC is a social discovery app designed for creating and joining community-driven plans, activities, and events. Users can discover new experiences, send join requests, chat with others, and build connections around shared interests.

<p align="center">
  <img src="https://img.shields.io/badge/React-18.3.1-61DAFB?style=for-the-badge&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.6-3178C6?style=for-the-badge&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Laravel-12-FF2D20?style=for-the-badge&logo=laravel" alt="Laravel 12" />
  <img src="https://img.shields.io/badge/PHP-8.2-777BB4?style=for-the-badge&logo=php" alt="PHP 8.2" />
</p>

## Why PIC?

People are more likely to show up and connect when they can discover experiences that match their interests. PIC helps users:

- find and explore planned activities
- create their own events or social outings
- join others with a simple request flow
- manage conversations and notifications
- keep track of invitations, accepted requests, and messages

## Key Features

- Discover page for browsing available activities
- Create and publish new "Pic" events
- Join request and approval workflow
- My Pics and saved/participated listing
- Personal profile setup and editing
- Messaging and chat for event conversations
- Notifications for join requests and updates
- Responsive user interface for desktop and mobile use

## App Structure

```text
pic/
├── pic-backend/   # Laravel API, auth, business logic, database access
├── pic-frontend/  # React + Vite app for the user interface
├── README.md      # Project overview and setup guide
└── .git/
```

## Tech Stack

### Frontend
- React
- TypeScript
- Vite
- Tailwind CSS
- React Router
- Lucide icons
- Date-fns

### Backend
- PHP 8.2
- Laravel 12
- MySQL (configured in `.env.example`)
- Laravel Sanctum / session-based auth patterns
- Eloquent ORM

## Core User Flow

1. Create a profile or sign in.
2. Browse available activities in Discover.
3. View Pic details and join requests.
4. Create your own Pic for others to discover.
5. Connect with participants through chat and notifications.
6. Manage your profile, messages, and activity history.

## Getting Started

### Prerequisites

Make sure these tools are installed on your machine:

- PHP 8.2+
- Composer
- Node.js 18+
- npm
- MySQL (or another supported database configured in the backend)

### 1) Set up the backend

```bash
cd pic-backend
composer install
cp .env.example .env
php artisan key:generate
php artisan migrate
php artisan serve
```

The backend will run on:

```text
http://127.0.0.1:8000
```

### 2) Set up the frontend

Open a second terminal and run:

```bash
cd pic-frontend
npm install
npm run dev
```

The frontend will typically run on:

```text
http://localhost:5173
```

## Environment Configuration

The backend `.env` file includes project settings such as app name, database config, and frontend URL.

Example:

```env
APP_NAME="PIC — Partner In Crime"
APP_URL=http://127.0.0.1:8000
FRONTEND_URL=http://localhost:5173

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pic_backend
DB_USERNAME=root
DB_PASSWORD=
```

Update the values to match your local setup before starting the app.

## Project Features by Area

### Discover & Explore
- browse activities and social events
- filter and view detailed event information
- evaluate availability and participant count

### Event Management
- create new activities with details like title, date, time, and location
- manage your own published pics
- review event status and participation flow

### Social Interaction
- send and receive join requests
- accept or decline participation
- chat with members in dedicated conversations
- track notifications and updates

### User Profiles
- set up account profile details
- add interests, bio, location, and preferences
- manage personal settings and profile information

## Development Notes

- The frontend is built with Vite and TypeScript for fast local development.
- The backend is powered by Laravel and is designed to handle event data, auth, and messaging workflows.
- The project structure separates API logic from the interface, making it easier to extend the app.

## Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a feature branch.
3. Make your changes.
4. Validate the relevant frontend/backend behavior.
5. Open a pull request.

## License

This project is intended for development and personal use unless specified by the repository owner.

---

