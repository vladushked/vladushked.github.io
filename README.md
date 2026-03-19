
# vladislavplotnikov.ru

Персональный сайт-резюме Владислава Плотникова.

Текущая версия проекта использует единый content-driven page engine для обычных страниц, постов, проектов и React-level 404.

- `БЛОГ` (`/`) — страница-лента постов
- `About` (`/about`) — профильная страница с интро и резюме
- `Projects` (`/projects`) — страница-лента проектов
- `Project detail` (`/projects/:slug`) — отдельная страница проекта
- `Post detail` (`/blog/:slug`) — отдельная страница поста
- `404` (`*` и `/404`) — системная страница в общем renderer

## Стек

- React 18
- Vite
- TypeScript
- React Router

## Структура проекта

Основные файлы:

- `src/content/pages/*.md` — markdown-страницы, которые реально рендерятся в UI
- `src/content/posts/*.md` — markdown-посты для `/blog` и `/blog/:slug`
- `src/content/projects/*.md` — markdown-проекты для `/projects` и `/projects/:slug`
- `src/content/pages.ts` — загрузка обычных страниц, их frontmatter, route и navigation-метаданных
- `src/content/posts.ts` — загрузка постов, их frontmatter, body и preview-данных
- `src/content/projects.ts` — загрузка проектов и preview-данных
- `src/content/documents.ts` — общий registry документов для router/navigation
- `src/content/generated/postVideoThumbnails.ts` — сгенерированный манифест thumbnail для video-превью
- `src/components/DocumentPage.tsx` — единый renderer для pages/posts/projects/404
- `src/components/Layout.tsx` — навигация и общий layout
- `src/routes.ts` — маршруты приложения
- `resume.txt` — исходный источник фактов для обновления профессионального контента

## Markdown-контент

Контент страниц хранится в `src/content/pages/*.md`.
Контент постов хранится отдельно в `src/content/posts/*.md`.

Каждый файл содержит:

- frontmatter с метаданными (опционально `title`, `eyebrow`, `description`)
- markdown body

Обычные страницы теперь сами описывают `route` и навигационные поля в frontmatter.
`title` и `label` рендерятся в том регистре, в котором они заданы в контенте.

Ограничения текущего markdown-парсера:

- page header рендерится одинаково для всех страниц; он может содержать `eyebrow`, `title`, `description`
- если конкретное поле в frontmatter пустое или отсутствует, оно не рендерится
- `::hero` не заменяет page header и рендерится как обычный body-блок
- `::post-feed` рендерит ленту карточек постов внутри обычной markdown-страницы
- режим mobile layout действует до ширины `999px`, desktop начинается с `1000px`
- в body разрешены только `##` и `###`
- body-level `#` не поддерживается
- поддерживаются абзацы, простые списки, цитаты, ссылки, `**bold**`, `*emphasis*`, `` `inline code` ``
- поддерживается перенос строки внутри list item через indentation
- дополнительно поддерживаются структурные директивы `::hero`, `::card`, `::skill-group`, `::post-feed`, `::project-feed`
- это намеренно ограниченное подмножество markdown с небольшим кастомным DSL, а не полный CommonMark

### Структурные директивы

Body markdown поддерживает несколько специальных блоков с жестко ограниченным синтаксисом. Это не YAML и не полный markdown-расширитель: неизвестные поля и неправильный формат считаются ошибкой парсера.

### Frontmatter страниц

Обычные страницы в `src/content/pages/*.md` поддерживают:

- `route` — обязательный route страницы
- `title`
- `eyebrow`
- `description`
- `showInNav: true|false`
- `navLabel` — обязателен, если `showInNav: true`
- `navIcon` — обязателен, если `showInNav: true`
- `order` — обязателен, если `showInNav: true`

Пример:

```md
---
route: /about
showInNav: true
navLabel: /about
navIcon: user
order: 2
eyebrow: Vladislav Plotnikov
---
```

#### `::hero`

Используется для крупного титульного блока в body страницы. Визуально это та же базовая карточка, что и для `::card`, но с большим `h1`, контактами и опциональным фото.

Обязательные поля:

- `name`

Повторяемые поля:

- `contact` в формате `type|label|href`

Опциональные общие поля карточки:

- `fill: none|gray|accent`
- `stroke: none|gray|accent`
- `headingVariant: page|card`
- `photo` — URL изображения (например, путь к файлу из `public`)
- `title`
- `subtitle`
- `period`
- `meta`
- `summary`
- `subtitleLine` в формате `text|period`

Поддерживаемые `type`:

- `phone`
- `email`
- `telegram`

Поведение:

- `::hero` рендерится после общего page header, если header есть
- если `photo` указан, изображение рендерится внутри hero-card
- на desktop фото располагается справа
- на mobile фото переносится вверх
- на mobile фото центрируется
- если `photo` не указан, hero рендерится как обычная текстовая карточка без пустой колонки
- контакты в hero идут вертикальным списком
- для `photo` используйте public-path (`/images/...`) или обычный `https://` URL

Статические изображения для markdown-контента:

- изображения, используемые из markdown, храните в `public/images/`
- в markdown ссылайтесь на них через public-путь, например `/images/face.jpg`
- не используйте import изображений из `src/*` для markdown-полей

Пример:

```md
::hero
name: Владислав Плотников
photo: /images/face.jpg
fill: gray
stroke: none
headingVariant: page
title: Tech lead / Senior Python Developer (робототехника)
meta: Стаж: 8 лет 6 месяцев
contact: phone|+7 (963) 922-34-64|tel:+79639223464
contact: email|vladislav.a.plotnikov@yandex.ru|mailto:vladislav.a.plotnikov@yandex.ru
contact: telegram|@vladislavplotnikov|https://t.me/vladislavplotnikov
::
```

#### `::card`

Используется для блоков опыта и образования.

Обязательные поля:

- `kind: experience|education`
- `title`

Опциональные поля:

- `fill: none|gray|accent`
- `stroke: none|gray|accent`
- `headingVariant: page|card`
- `subtitle`
- `period`
- `meta`
- `summary`

Повторяемые поля:

- `bullet`
- `subtitleLine` в формате `text|period`

Legacy-алиасы, которые пока поддерживаются парсером:

- `variant: outline`
- `role`
- `roleLine`

Пример:

```md
::card
kind: experience
title: l-labs.tech / ООО «Система 1»
fill: none
stroke: accent
headingVariant: card
subtitle: Python-разработчик
period: Декабрь 2021 — настоящее время
bullet: Разработка архитектуры верхнего уровня управления.
::
```

#### `::skill-group`

Используется для групп навыков.

Обязательные поля:

- `title`
- `variant: solid|outline`

Повторяемые поля:

- `skill`

Пример:

```md
::skill-group
title: Продвинутый уровень
variant: solid
skill: Python
skill: ROS2
::
```

#### `::post-feed`

Используется в `src/content/pages/posts.md` и рендерит список карточек постов.

Поля не поддерживаются: любой непустой контент внутри директивы считается ошибкой парсера.

Пример:

```md
::post-feed
::
```

#### `::project-feed`

Используется в `src/content/pages/projects.md` и рендерит список карточек проектов в стиле карточек постов.

Поля не поддерживаются: любой непустой контент внутри директивы считается ошибкой парсера.

Пример:

```md
::project-feed
::
```

### Markdown-посты

Посты в `src/content/posts/*.md` используют отдельный frontmatter:

- `title` — обязательно
- `date` — обязательно
- `order` — обязательно, целое число для сортировки в ленте
- `tags` — обязательно, список через запятую

Пример:

```md
---
title: ROS Meetup 2025
date: 2025
order: 1
tags: ROS Meetup, 2025, выступление
---
```

Body поста поддерживает те же текстовые блоки (`##`, `###`, абзацы, списки, цитаты, ссылки, inline-formatting) и отдельную директиву `::media`.

#### `::media`

Используется только внутри `src/content/posts/*.md`.

Обязательные поля:

- `kind: image|video`
- `src`

Опциональные поля:

- `alt`
- `caption`

Правила:

- первое `::media` в посте используется как превью-медиа для карточки в `/`
- первый текстовый блок поста используется как preview excerpt, если он есть
- для `kind: video` карточка пытается показать thumbnail, автоматически извлеченный из source URL на этапе build
- если thumbnail извлечь не удалось, карточка показывает fallback-блок `Видео`
- карточки постов всегда прозрачные, с серым контуром без заливки
- на desktop превью-медиа располагается справа, на mobile переносится выше текста

Пример:

```md
::media
kind: video
src: https://vkvideo.ru/video-212217448_456239836
caption: Видео выступления
::
```

## Запуск локально

Основной dev-flow в этом репозитории идет через Docker-скрипты:

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
node scripts/generate-post-video-thumbnails.mjs
bash docker/run-npm.sh install
bash docker/run-check.sh typecheck
bash docker/run-check.sh build
```

`node scripts/generate-post-video-thumbnails.mjs` проходит по `src/content/posts/*.md`, ищет первое `::media kind: video` и пересобирает `src/content/generated/postVideoThumbnails.ts`.

- Для `vk.com`/`vkvideo.ru` используется `video.get` через `VK_USER_ACCESS_TOKEN`. Если токен не передан или VK API недоступен, генератор пропускает thumbnail и карточка показывает fallback `Видео`.
- Для остальных источников используется извлечение `og:image`/`twitter:image`.

Пример запуска с токеном:

```bash
VK_USER_ACCESS_TOKEN=... bash docker/run-check.sh build
```

`docker/run-check.sh` использует интерактивный запуск Docker (`-it`). Если команда выполняется из sandbox или агентского инструмента, ей может понадобиться TTY; типичная ошибка в таком случае: `the input device is not a TTY`.

Если меняется `package.json`, нужно обновить и закоммитить `package-lock.json`.

## Деплой

Сайт деплоится на GitHub Pages через workflow `.github/workflows/deploy-pages.yml`.

Пайплайн делает:

1. `npm install`
2. `npm run typecheck`
3. `npm run build`
4. публикацию папки `build`

Для поддержки прямых заходов и `refresh` на вложенных маршрутах (`/about`, `/projects`, `/blog/:slug`) используется SPA fallback:

- `public/404.html`
- скрипт восстановления маршрута в `index.html`

Эту механику нельзя удалять без замены на другой способ SPA-маршрутизации.

## Обновление контента

Если нужно обновить опыт, стек или контакты:

1. Сначала обновите `resume.txt`, если меняется исходный контекст.
2. Затем синхронизируйте соответствующие markdown-файлы в `src/content/pages/`, `src/content/posts/` или `src/content/projects/`.
3. Для `about.md` используйте объединенный формат: narrative-интро плюс структурированные блоки `::hero`, `::card` и `::skill-group`.
4. Чтобы добавить новую обычную страницу, достаточно создать один `src/content/pages/<slug>.md` файл с `route`; если страница должна быть в меню, добавьте `showInNav`, `navLabel`, `navIcon` и `order`.
5. Проверьте изменения через `bash docker/run-check.sh typecheck` и `bash docker/run-check.sh build`.

`resume.txt` не рендерится напрямую в UI. Это источник фактов, а не шаблон для дословного вывода.
  
