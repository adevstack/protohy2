
# Estate Envision

Welcome to Estate Envision, a modern web application for browsing, listing, and managing real estate properties. This platform allows users to discover properties, save favorites, receive recommendations, and list their own properties with AI-powered description generation.

## ✨ Features

*   **User Authentication:** Secure registration and login using JWT and cookies. Includes a demo user login.
*   **Property Listings:**
    *   Browse a comprehensive list of properties.
    *   Detailed property view with images, amenities, tags, and location.
    *   Properties are fetched from a main `properties` collection.
*   **User-Submitted Properties:**
    *   Authenticated users can add their own properties via a detailed form.
    *   These properties are stored in a separate `newproperties` collection.
    *   Users can view properties they have submitted on a dedicated "My Properties" page.
*   **Favorites System:** Logged-in users can mark properties (from the main collection) as favorites and view them on a "My Favorites" page.
*   **Property Recommendations:** Logged-in users can recommend properties to other users via email. A "Recommendations" page displays properties recommended to the current user.
*   **AI Property Description Generation:** Leverages Genkit to generate engaging property descriptions based on key details (implemented in `src/ai/flows/generate-property-description.ts` but not yet fully integrated into the Add Property form UI).
*   **User Profiles:** View basic user profile information.
*   **Responsive Design:** Built with mobile-first considerations.
*   **Theme Toggle:** Supports light, dark, and system themes.
*   **Dockerized:** Includes a `Dockerfile` for easy containerization and deployment.

## 🛠️ Tech Stack

*   **Framework:** [Next.js](https://nextjs.org/) (App Router)
*   **Language:** [TypeScript](https://www.typescriptlang.org/)
*   **UI Components:** [ShadCN UI](https://ui.shadcn.com/)
*   **Styling:** [Tailwind CSS](https://tailwindcss.com/)
*   **Database:** [MongoDB](https://www.mongodb.com/) (using `mongodb` driver)
*   **Authentication:** JWT (JSON Web Tokens) with `bcryptjs` for password hashing.
*   **AI Integration:** [Genkit](https://firebase.google.com/docs/genkit) (for AI flows, e.g., property description generation)
*   **State Management:** React Context API (for auth status), React Hook Form (for forms)
*   **Icons:** [Lucide React](https://lucide.dev/)
*   **Caching (Optional):** Setup for [Redis](https://redis.io/) (using `ioredis`) is included but not yet fully implemented in application logic.

## ⚙️ Environment Variables

Create a `.env` file in the root of your project and populate it with the following variables. Replace placeholder values with your actual credentials and settings.

```env
# MongoDB Configuration
MONGODB_URI="mongodb+srv://your_user:your_password@your_cluster.mongodb.net/?retryWrites=true&w=majority"
MONGODB_DB_NAME="estate_envision_db"

# JWT Configuration
JWT_SECRET="your_super_strong_and_unique_jwt_secret_key_here"
# JWT_ACCESS_TOKEN_EXPIRES_IN="1h" # Optional, defaults to 1 hour

# Redis Configuration (Optional - if you plan to use Redis)
REDIS_HOST="your_redis_host"
REDIS_PORT="your_redis_port" # e.g., 6379
REDIS_PASSWORD="your_redis_password" # Optional, if your Redis requires authentication
# OR, if your Redis provider gives a single connection URL:
# REDIS_URL="redis://:your_redis_password@your_redis_host:your_redis_port"

# Genkit / Google AI Configuration (if using Gemini models)
# GOOGLE_API_KEY="your_google_ai_studio_api_key" # If Genkit is configured to use it
# Ensure your Genkit setup (e.g., in src/ai/genkit.ts) and dev server (src/ai/dev.ts)
# are correctly configured for your chosen AI provider and model.
```

**Important:**
*   The `MONGODB_URI`, `MONGODB_DB_NAME`, and `JWT_SECRET` are **critical** for the application to run correctly.
*   Ensure your `.env` file is added to `.gitignore` to prevent committing sensitive credentials.

## 🚀 Getting Started

### Prerequisites

*   Node.js (v18.x or later recommended)
*   npm or yarn
*   MongoDB instance (local or cloud-hosted like MongoDB Atlas)
*   (Optional) Redis instance if you plan to implement Redis caching.
*   (Optional) Access to a Genkit-supported AI model provider (e.g., Google AI Studio API Key for Gemini) if you intend to use AI features.

### Local Development

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/adevstack/protohy2.git
    cd protohy2
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    # yarn install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory and fill it with your configuration as described in the "Environment Variables" section above.

4.  **Run the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will typically be available at `http://localhost:9002`.

5.  **(Optional) Run the Genkit development server (for AI features):**
    If you are working on or testing AI flows:
    ```bash
    npm run genkit:dev
    # or for watching changes
    # npm run genkit:watch
    ```
    This usually starts on a different port (e.g., `http://localhost:3100` by default for Genkit).

### Available Scripts

*   `npm run dev`: Starts the Next.js development server (with Turbopack on port 9002).
*   `npm run genkit:dev`: Starts the Genkit development server.
*   `npm run genkit:watch`: Starts the Genkit development server with file watching.
*   `npm run build`: Builds the application for production.
*   `npm run start`: Starts the Next.js production server (after running `build`).
*   `npm run lint`: Runs Next.js ESLint checks.
*   `npm run typecheck`: Runs TypeScript type checking.

## 🏗️ Building for Production

To build the application for a production environment:

```bash
npm run build
```

This will create an optimized build in the `.next` folder. You can then start the production server using:

```bash
npm run start
```

## 🐳 Dockerization & Deployment (e.g., on Render)

This project includes a `Dockerfile` and `.dockerignore` to facilitate containerization.

### Building the Docker Image

```bash
docker build -t estate-envision .
```

### Running the Docker Container Locally

```bash
docker run -p 3000:3000 \
  -e MONGODB_URI="your_mongodb_uri" \
  -e MONGODB_DB_NAME="your_db_name" \
  -e JWT_SECRET="your_jwt_secret" \
  # Add other necessary environment variables here
  estate-envision
```
Access the app at `http://localhost:3000`.

### Deploying to Render

1.  Push your code to a GitHub repository.
2.  On Render, create a new "Web Service".
3.  Connect your GitHub repository.
4.  Render should automatically detect the `Dockerfile`.
5.  **Configure Environment Variables:** In the Render service settings, add all the necessary environment variables (`MONGODB_URI`, `MONGODB_DB_NAME`, `JWT_SECRET`, `REDIS_URL` etc.) from your `.env` file. **Do not commit your `.env` file.**
6.  Render will build the Docker image and deploy your application.

---

This README provides a comprehensive overview of Estate Envision. If you have any questions or suggestions, please feel free to open an issue or contribute!
