
  # vladislavplotnikov.ru

  This is a code bundle for vladislavplotnikov.ru. The original project is available at https://www.figma.com/design/WYuEujv0hKePGsKCUPYc7W/vladislavplotnikov.ru.

  ## Running the code

  Run `npm i` to install the dependencies.

  Run `npm run dev` to start the development server.

  ## Run in Docker (dev mode)

  Quick start:

  ```bash
  bash docker/run-dev.sh
  ```

  Then open `http://localhost:3000`.

  What this script does:
  - builds a dev image from `docker/Dockerfile`,
  - starts a container with port `3000:3000`,
  - mounts your project into `/app` for live reload,
  - keeps `node_modules` inside container volume.

  Stop with `Ctrl + C` in the terminal where it runs.
  