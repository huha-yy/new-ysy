# Repository Guidelines

## Project Structure & Module Organization
`backend/` contains the Spring Boot API. Main code lives in `backend/src/main/java/com/hiking/hikingbackend`, split by `common`, `config`, `security`, and business modules under `module/*` such as `activity`, `checkin`, `route`, and `user`. Mapper XML files are in `backend/src/main/resources/mapper`.

`frontend/` contains the React + Vite client. App code is organized under `frontend/src` by `api`, `components`, `hooks`, `pages`, `router`, and `utils`. Role-based views live in `pages/admin`, `pages/organizer`, `pages/user`, and `pages/activity`. SQL schema lives in `sql/`. Runtime uploads go to `uploads/`. Design and thesis notes are kept in `系统实现与设计/` and `论文初稿参考/`.

## Build, Test, and Development Commands
- `cd backend && mvn spring-boot:run` — start the API at `http://localhost:8080/api`.
- `cd backend && mvn clean package` — compile, test, and build the backend artifact.
- `cd backend && mvn test` — run backend unit/integration tests.
- `cd frontend && npm install` — install frontend dependencies.
- `cd frontend && npm run dev` — start Vite on `http://localhost:5173` with `/api` proxied to the backend.
- `cd frontend && npm run build` — generate the production bundle in `frontend/dist`.

## Coding Style & Naming Conventions
Follow the existing style instead of introducing a new formatter. Frontend files use 2-space indentation, functional React components, `PascalCase` for components/pages, and `camelCase` for hooks, helpers, and API functions. Keep component CSS next to the related JSX file when that pattern already exists.

Backend code uses 4-space indentation, lowercase package names, and descriptive suffixes such as `Controller`, `Service`, `ServiceImpl`, `DTO`, `VO`, and `Mapper`. Mirror existing module boundaries when adding new features.

## Testing Guidelines
Backend testing is set up through Spring Boot Test and Maven. Add new tests under `backend/src/test/java` using the same package path as production code and name them `*Test`. Frontend has no configured automated test runner yet, so every UI change should at least pass `npm run build` and a manual smoke test of the affected flow.

## Commit & Pull Request Guidelines
Recent commits are short, Chinese, and feature-focused, for example `签到页面优化 + 地图组件增强 + CLAUDE.md 文档更新`. Keep commit messages scoped to the changed module and outcome. PRs should include a concise summary, affected paths, database/config changes, screenshots for UI work, and linked tasks or issues when available.

## Security & Configuration Tips
Do not commit real credentials. Review `backend/src/main/resources/application.yml` before sharing changes: database credentials, JWT secrets, and `file.upload-path` are environment-specific. Treat `uploads/` and `target/` as generated output, not source.
