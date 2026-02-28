# AGENTS.md

Инструкции для агентa, который работает в этом репозитории.

## Назначение проекта

Это персональный сайт-резюме Владислава Плотникова.

Проект уже очищен от старого шаблона. Не возвращайте:

- фейковые карточки проектов
- фейковые карточки постов
- детальные страницы постов
- placeholder-контент вида `ivan`, `example.com`, `github.com/example`
- большой UI-kit, если он не нужен для конкретной задачи

## Источник правды для контента

Главный рабочий источник для фактов о карьере:

- `resume.txt`

Главный источник для контента, который реально рендерится в приложении:

- `src/content/pages/*.md`
- `src/content/markdownPages.ts`

Правило:

- если меняется биография, опыт, стек или контакты, сначала сверяйтесь с `resume.txt`
- затем обновляйте соответствующие markdown-файлы в `src/content/pages/`
- не храните большие блоки текста напрямую в page-компонентах, если это можно вынести в markdown-контент
- если меняется frontmatter или правила рендера markdown, сверяйтесь с `src/content/markdownPages.ts` и `src/components/MarkdownPage.tsx`

`resume.txt` не должен автоматически парситься приложением. Это ручной источник фактов.

## Текущая структура сайта

Маршруты:

- `/` — `About`
- `/resume` — `Resume`
- `/projects` — заглушка
- `/posts` — заглушка

Текущие route components:

- `src/components/About.tsx`
- `src/components/Resume.tsx`
- `src/components/Projects.tsx`
- `src/components/Posts.tsx`
- `src/components/Layout.tsx`

Роутинг находится в:

- `src/routes.ts`

Не добавляйте параллельные слои страниц вроде `src/pages/*` и `src/components/pages/*`, если на это нет прямого запроса.

## Markdown source of truth

Текущие route components являются тонкими обертками над markdown-контентом.

Основные файлы markdown-слоя:

- `src/content/pages/about.md`
- `src/content/pages/resume.md`
- `src/content/pages/projects.md`
- `src/content/pages/posts.md`
- `src/content/markdownPages.ts`
- `src/components/MarkdownPage.tsx`

Ограничения текущего markdown-парсера:

- `title` из frontmatter рендерится как единственный `h1` страницы
- в body разрешены только `##` и `###`
- body-level `#` запрещен; для заголовков секций используйте `##`
- поддерживаются абзацы, простые списки, blockquote, ссылки, `**bold**`, `*emphasis*`, `` `inline code` ``
- поддерживаются multiline list items через indentation
- это ограниченное подмножество markdown; не рассчитывайте на полный CommonMark

## UI Guidelines

Это обязательный UI-гайдлайн для дальнейших изменений интерфейса. Визуальный ориентир:

- спокойная и читаемая markdown-подача
- четкая иерархия заголовков
- нейтральный светлый фон с сдержанными серыми текстами
- акцент используется экономно и осмысленно

### Шрифты

Основной шрифт интерфейса:

- `Helvetica Neue, Helvetica, Arial, sans-serif`

Отдельный акцентный шрифт не использовать.

Для заголовков страниц, заголовков секций и меню использовать тот же основной sans-serif,
меняя только размер, насыщенность, интервалы и регистр.

### Типографика

Базовые размеры и роли:

- Page title: `40-72px`, `line-height: 1.05`, `letter-spacing: -0.02em`, основной sans-serif
- Section title: `24px` mobile, `28px` desktop, `line-height: 1.2`, `letter-spacing: -0.01em`, основной sans-serif
- Menu label: `10px` mobile, `14px` desktop, `line-height: 1.1`, `letter-spacing: 0.05-0.06em`, uppercase, основной sans-serif
- Eyebrow / small label: `12px`, `line-height: 1.4`, `letter-spacing: 0.08em`, uppercase, основной sans-serif
- Body: `16px`, `line-height: 1.7`, основной sans-serif
- Lead text: `18px` mobile, `20px` desktop, `line-height: 1.6`, основной sans-serif
- Secondary text: `16px`, `line-height: 1.65`, основной sans-serif
- Caption / meta: `13-14px`, `line-height: 1.5`, основной sans-serif
- Markdown h3 / subheading: `20px` mobile, `22px` desktop, `line-height: 1.35`, основной sans-serif

### Цвета

Основные токены:

- `--color-bg: #fafafa`
- `--color-text: #0a0a0a`
- `--color-text-muted: #525252`
- `--color-text-subtle: #737373`
- `--color-border: #e5e5e5`
- `--color-accent-fill: #00ffa3`
- `--color-accent-ink: #008a5f`

Для темной темы:

- использовать отдельные темные значения для `--color-bg`, `--color-text`, `--color-text-muted`, `--color-text-subtle`, `--color-border`
- `--color-accent-fill` можно оставить ярким
- `--color-accent-ink` должен оставаться контрастным на темном фоне, но не кислотным

### Правила акцента

- Если кнопка или активный navigation item залиты акцентом, оставляйте яркий `--color-accent-fill` как сейчас.
- Если акцент используется для маленьких деталей, иконок, маркеров, тонких границ, счетчиков и мелких highlight-элементов, используйте более темный `--color-accent-ink`.
- На светлом фоне не использовать яркий акцент для мелких деталей, если он визуально сливается.

### Темная тема

- Не добавлять ручной toggle для темы.
- Не сохранять ручной выбор темы в `localStorage`.
- Ночной режим должен включаться только по системной настройке пользователя через `prefers-color-scheme`.

### Mobile-first согласование

- Любое изменение типографики, навигации, отступов и акцентов нужно проверять и на desktop, и на mobile.
- Bottom navigation должна оставаться читаемой и сбалансированной по ширине.
- Tap target интерактивных элементов на mobile не должен деградировать.
- Длинные заголовки страниц не должны ломать композицию на узком экране.

## Запуск и проверка

Предпочтительный способ локальной проверки:

```bash
bash docker/run-dev.sh
```

Это поднимает Vite dev server в контейнере на `http://localhost:3000`.

Все установки зависимостей и проверки нужно выполнять только через Docker-скрипты:

```bash
bash docker/run-npm.sh install
bash docker/run-check.sh typecheck
bash docker/run-check.sh build
```

Правила для агента:

- не запускать `npm install`, `npm run typecheck` и `npm run build` напрямую на хосте
- если нужна установка зависимости, сначала предложить запуск `bash docker/run-npm.sh ...` и дождаться подтверждения пользователя
- если нужна проверка, сначала предложить запуск `bash docker/run-check.sh ...` и дождаться подтверждения пользователя

Если меняется `package.json`, ожидается обновление `package-lock.json`.

## Деплой и роутинг

Сайт публикуется на GitHub Pages.

Из-за `createBrowserRouter` для вложенных путей нужен SPA fallback:

- `public/404.html`
- скрипт в `index.html`, который восстанавливает путь после redirect

Не удаляйте эту логику, если не переводите приложение на альтернативную схему маршрутизации целиком.

## Ограничения на изменения

При изменениях придерживайтесь этих правил:

- не возвращайте удаленный шаблонный код
- не добавляйте зависимости “на всякий случай”
- не раздувайте `package.json` неиспользуемыми пакетами
- не добавляйте новый UI framework без необходимости
- не создавайте отдельные дублирующие компоненты с тем же смыслом

Если нужен новый раздел, сначала решите:

- это новая реальная страница
- или это обновление существующего контента

Если задача только про текст и резюме, почти всегда достаточно обновить соответствующие файлы в `src/content/pages/`.

## Ожидания по качеству

Перед завершением изменений желательно проверить:

1. Нет ли в коде строк `ivan` или `example.com`
2. Не появились ли битые импорты после удаления файлов
3. Не нарушена ли навигация между `/`, `/resume`, `/projects`, `/posts`
4. Не сломан ли GitHub Pages fallback

Если сборка локально не идет только потому, что зависимости не установлены, это нужно явно зафиксировать в ответе.
