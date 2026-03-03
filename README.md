
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

- `src/content/menu.md` — источник правды для навигации, route и связи route -> markdown-страница
- `src/content/pages/*.md` — markdown-страницы, которые реально рендерятся в UI
- `src/content/markdownPages.ts` — загрузка `.md`, frontmatter и реестр страниц
- `src/components/MarkdownPage.tsx` — рендер markdown-подмножества в UI
- `src/components/Layout.tsx` — навигация и общий layout
- `src/routes.ts` — маршруты приложения
- `resume.txt` — исходный источник фактов для обновления профессионального контента

## Markdown-контент

Контент страниц хранится в `src/content/pages/*.md`.

Каждый файл содержит:

- frontmatter с метаданными (опционально `title`, `eyebrow`, `description`)
- markdown body

Навигация и route хранятся отдельно в `src/content/menu.md`.
Связь страницы с роутом задается только через `menu.md`: `page` в `::menu-item` указывает на slug markdown-файла.
`title` и `label` можно хранить в обычном регистре: UI сам отображает их в uppercase.

Ограничения текущего markdown-парсера:

- page header рендерится одинаково для всех страниц; он может содержать `eyebrow`, `title`, `description`
- если конкретное поле в frontmatter пустое или отсутствует, оно не рендерится
- `::hero` не заменяет page header и рендерится как обычный body-блок
- режим mobile layout действует до ширины `999px`, desktop начинается с `1000px`
- в body разрешены только `##` и `###`
- body-level `#` не поддерживается
- поддерживаются абзацы, простые списки, цитаты, ссылки, `**bold**`, `*emphasis*`, `` `inline code` ``
- поддерживается перенос строки внутри list item через indentation
- дополнительно поддерживаются структурные директивы `::hero`, `::card`, `::skill-group`
- это намеренно ограниченное подмножество markdown с небольшим кастомным DSL, а не полный CommonMark

### Структурные директивы

Body markdown поддерживает несколько специальных блоков с жестко ограниченным синтаксисом. Это не YAML и не полный markdown-расширитель: неизвестные поля и неправильный формат считаются ошибкой парсера.

### `menu.md`

`src/content/menu.md` использует директиву `::menu-item` и задает:

- `id`
- `page` — slug файла из `src/content/pages/*.md`
- `route`
- `label`
- `icon`

Пример:

```md
::menu-item
id: about
page: about
route: /
label: Главная
icon: user
::
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
bash docker/run-npm.sh install
bash docker/run-check.sh typecheck
bash docker/run-check.sh build
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

Для поддержки прямых заходов и `refresh` на вложенных маршрутах (`/resume`, `/projects`, `/posts`) используется SPA fallback:

- `public/404.html`
- скрипт восстановления маршрута в `index.html`

Эту механику нельзя удалять без замены на другой способ SPA-маршрутизации.

## Обновление контента

Если нужно обновить опыт, стек или контакты:

1. Сначала обновите `resume.txt`, если меняется исходный контекст.
2. Затем синхронизируйте соответствующие markdown-файлы в `src/content/pages/`.
3. Для `about.md` держите контент агрегированным и narrative-формата, без подробного employer-by-employer таймлайна.
4. Для `resume.md` используйте полный структурированный формат через `::hero`, `::card` и `::skill-group`.
5. Проверьте изменения через `bash docker/run-check.sh typecheck` и `bash docker/run-check.sh build`.

`resume.txt` не рендерится напрямую в UI. Это источник фактов, а не шаблон для дословного вывода.
  
