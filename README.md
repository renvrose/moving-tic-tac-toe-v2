🎮 Advanced Moving Tic-Tac-Toe v2.0
📌 Description
Advanced Moving Tic-Tac-Toe v2.0 is an enhanced strategy game that modernizes the classic formula. Once players reach their piece limit, the game shifts into a high-stakes Movement Phase, requiring players to strategically slide existing pieces into adjacent or diagonal slots to secure a win.

This version features a robust DevOps Lifecycle, utilizing a high-speed CI/CD pipeline via GitHub Actions and containerization with Docker for seamless, automated deployment to Render.

✨ New & Enhanced Features
Dynamic Board Scaling: Select between 3x3, 4x4, or 5x5 grids for varying difficulty.

Advanced Moving Mechanic: Once the piece limit is reached, players must move existing pieces to adjacent/diagonal empty cells. 

One-Time Power Cards: Brand new to v2.0! Utilize unique abilities like Earthquake or Tornado to disrupt the board.

Global Theme Engine: Choose from 5 distinct visual styles: Classic Blue, Midnight Gamer, Cyber Neon, Enchanted Forest, or Sunset Vibes.

Modern UI/UX: Interactive canvas-confetti celebrations, custom power-up alerts, and local storage persistence.

🚀 CI/CD Pipeline & Docker Tagging
The project utilizes a cloud-native automation workflow. A critical component of this version is the migration to the v2.0 container registry.

🏷️ Updating the Docker Image Tag
When moving to Version 2.0, the Docker image tag in your .github/workflows/deploy.yml must be updated. This ensures the GitHub Action pushes the container to the correct repository in the GitHub Container Registry (GHCR).

How to update the tag:

Open .github/workflows/deploy.yml.

Locate the Build and Push Docker Image step.

Update the tags property to: tags: ghcr.io/renvrose/moving-tic-tac-toe-v2:latest

🛠 How to Deploy to GitHub & Render
1. Repository Setup
Bash
# Initialize git and link to v2
git init
git remote add origin https://github.com/renvrose/moving-tic-tac-toe-v2.git
git add .
git commit -m "feat: setup v2.0 with updated Docker tags"
git branch -M main
git push -u origin main
2. Configure GitHub Secrets
Add the following secret in Settings > Secrets and variables > Actions:

RENDER_DEPLOY_HOOK: Your unique Webhook URL from the Render dashboard.

3. Render Configuration
New Web Service: Connect your moving-tic-tac-toe-v2 repository.

Environment: Select Docker.

Auto-Deploy: Once the hook is triggered by GitHub Actions, Render will pull the image tagged :latest and go live.

👥 Team Contributions
Sahana (Team Leader): Version 1.0 & Troubleshooting Overall App, V2

Li Xuan & Daniel: Comprehensive Test Case Suites.

Wee Teck: CI/CD Pipeline Architecture (GitHub Actions).

Sean: Dockerization & Render Environment Configuration.

Xin Ru: Version 2.0 App Features & Logic.