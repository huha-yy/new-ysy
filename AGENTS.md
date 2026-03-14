# Repository Guidelines

## Project Structure & Module Organization
This repository is split into `frontend/` and `backend/`. The React client lives in `frontend/src`, with API wrappers in `src/api`, shared UI in `src/components`, hooks in `src/hooks`, route definitions in `src/router`, and role-based pages under `src/pages/{activity,organizer,admin,user}`. Static assets are in `frontend/public/`. The Spring Boot service lives in `backend/src/main/java/com/hiking/hikingbackend`, with shared code in `common/`, configuration in `config/`, security in `security/`, and domain modules under `module/`. Runtime config and MyBatis XML files are in `backend/src/main/resources/`. Database bootstrap SQL is in `sql/hiking_system0210.sql`; uploads go to `uploads/`.

## Build, Test, and Development Commands
Run commands from each subproject.

- `cd frontend && npm install` installs frontend dependencies.
- `cd frontend && npm run dev` starts Vite on `http://localhost:5173` with `/api` proxied to `http://localhost:8080`.
- `cd frontend && npm run build` creates the production bundle in `frontend/dist/`.
- `cd backend && mvn spring-boot:run` starts the API on `http://localhost:8080/api`.
- `cd backend && mvn test` runs backend tests.
- `cd backend && mvn clean package` builds the backend JAR.

## Coding Style & Naming Conventions
Match the existing style instead of introducing new formatting rules. Frontend code uses 2-space indentation, no semicolons, PascalCase React components, camelCase helpers, and page folders such as `pages/admin/Dashboard/` with `index.jsx` plus adjacent `.css` files. Backend Java uses 4-space indentation, standard Spring annotations, camelCase methods, and package names rooted at `com.hiking.hikingbackend`. No ESLint or Prettier config is checked in, so keep diffs small and consistent with surrounding files.

## Testing Guidelines
Backend testing is configured through `spring-boot-starter-test`; run `mvn test` before opening a PR. Add new Java tests under `backend/src/test/java` and keep test class names aligned with the target class, such as `ActivityServiceTest`. There is no frontend test runner configured, so for UI changes include manual verification steps covering login, activity flows, and affected admin pages.

## Commit & Pull Request Guidelines
Recent commits use short Chinese summaries, often joining related changes with `+`, for example `签到页面优化 + 地图组件增强`. Follow that style: keep the subject concise, specific, and scoped to visible behavior. PRs should include a summary, affected modules, linked issues, database or config changes, and screenshots or recordings for frontend changes.

## Security & Configuration Tips
Do not commit real secrets. `backend/src/main/resources/application.yml` currently contains local database and upload-path settings; treat them as developer-local defaults and document any environment-specific overrides in the PR. Keep the existing dual-environment `upload-path` comments: switch the active line per machine instead of rewriting the config for only Windows or only macOS. Verify the upload path and MySQL credentials before starting the backend.
