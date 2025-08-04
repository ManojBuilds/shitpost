# shitpost

**Build in Public Without the Burnout**

`shitpost` is a tool that helps you consistently tweet about what you're building without spending hours writing threads manually. It turns your git diffs into engaging tweets, so you can focus on coding while keeping your audience updated.

## How It Works

1.  **Generate Tweet Ideas:** Run `npx shitpost` in your terminal. The CLI will analyze your latest git diff and generate tweet ideas based on your changes.
2.  **Refine with AI:** The generated tweets are enhanced using AI to be more engaging and informative.
3.  **Schedule or Post:** View and manage your tweets from the web dashboard. You can schedule them to be posted automatically or post them manually.

## Features

*   **Developer-friendly CLI:** A simple and interactive CLI that integrates seamlessly into your workflow.
*   **Gemini-powered tweet enhancement:** Leverages the power of Google's Gemini to generate high-quality tweets.
*   **Smart tweet scheduling:** Schedule your tweets to be posted at optimal times.
*   **Seamless X OAuth login:** Securely connect your X account to post tweets directly.

## Getting Started

1.  **Run the CLI:**
    ```bash
    npx shitpost
    ```
2.  **Authorize with X:** The CLI will guide you through the process of authorizing your X account.
3.  **View your dashboard:** After the tweets are generated, you can view them on your dashboard at [https://your-frontend-url.com/dashboard](https://your-frontend-url.com/dashboard).

## Tech Stack

*   **CLI:**
    *   Node.js
    *   TypeScript
    *   `@clack/prompts`
    *   `twitter-api-v2`
    *   Google Gemini
*   **Web:**
    *   Next.js
    *   Convex
    *   Clerk
    *   Tailwind CSS

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
