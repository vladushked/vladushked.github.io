
# vladislavplotnikov.ru

Персональный сайт-резюме Владислава Плотникова.

Текущая версия проекта больше не использует старый шаблон с карточками постов и проектов. Сайт сведен к компактной структуре:

- `About` (`/`)
- `Resume` (`/resume`)
- `Projects` (`/projects`) — временная заглушка
- `Posts` (`/posts`) — временная заглушка

## Стек

- React 18
- Vite
- TypeScript
- React Router

## Структура проекта

Основные файлы:

- `src/content/pages/*.md` — markdown-страницы, которые реально рендерятся в UI
- `src/content/markdownPages.ts` — загрузка `.md`, frontmatter и реестр страниц
- `src/components/MarkdownPage.tsx` — рендер markdown-подмножества в UI
- `src/components/About.tsx` — обертка для главной markdown-страницы
- `src/components/Resume.tsx` — обертка для markdown-страницы резюме
- `src/components/Projects.tsx` — обертка для markdown-заглушки проектов
- `src/components/Posts.tsx` — обертка для markdown-заглушки публикаций
- `src/components/Layout.tsx` — навигация и общий layout
- `src/routes.ts` — маршруты приложения
- `resume.txt` — исходный источник фактов для обновления профессионального контента

## Markdown-контент

Контент страниц хранится в `src/content/pages/*.md`.

Каждый файл содержит:

- frontmatter с метаданными (`route`, `title`, `navLabel`, опционально `eyebrow`, `description`)
- markdown body

Ограничения текущего markdown-парсера:

- `title` из frontmatter рендерится как единственный `h1` страницы
- в body разрешены только `##` и `###`
- body-level `#` не поддерживается
- поддерживаются абзацы, простые списки, цитаты, ссылки, `**bold**`, `*emphasis*`, `` `inline code` ``
- поддерживается перенос строки внутри list item через indentation
- это намеренно ограниченное подмножество markdown, а не полный CommonMark

## Запуск локально

### Вариант 1: напрямую

```bash
npm install
npm run dev
```

После запуска откройте `http://localhost:3000`.

### Вариант 2: через Docker

Основной dev-flow в этом репозитории:

```bash
bash docker/run-dev.sh
```

Что делает скрипт:

- собирает dev-образ из `docker/Dockerfile`
- поднимает контейнер на порту `3000`
- монтирует текущий проект в `/app`
- хранит `node_modules` внутри контейнерного volume

После запуска откройте `http://localhost:3000`.

Остановить контейнер можно через `Ctrl + C` в терминале, где запущен скрипт.

## Проверки

Доступные команды:

```bash
npm run typecheck
npm run build
```

Если меняется `package.json`, нужно обновить и закоммитить `package-lock.json`.

## Деплой

Сайт деплоится на GitHub Pages через workflow `.github/workflows/deploy-pages.yml`.

Пайплайн делает:

1. `npm install`
2. `npm run typecheck`
3. `npm run build`
4. публикацию папки `build`

Для поддержки прямых заходов и `refresh` на вложенных маршрутах (`/resume`, `/projects`, `/posts`) используется SPA fallback:

- `public/404.html`
- скрипт восстановления маршрута в `index.html`

Эту механику нельзя удалять без замены на другой способ SPA-маршрутизации.

## Обновление контента

Если нужно обновить опыт, стек или контакты:

1. Сначала обновите `resume.txt`, если меняется исходный контекст.
2. Затем синхронизируйте соответствующие markdown-файлы в `src/content/pages/`.
3. Проверьте `npm run typecheck` и `npm run build`.

`resume.txt` не рендерится напрямую в UI. Это источник фактов, а не шаблон для дословного вывода.
  
