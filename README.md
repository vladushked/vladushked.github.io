# vladislavplotnikov.ru

Персональный сайт-резюме Владислава Плотникова.

Сайт собирается из markdown-контента двух типов:

- `src/content/pages/*.md` — обычные страницы сайта
- `src/content/posts/*.md` — материалы двух секций: `blog` и `projects`

`resume.txt` не рендерится напрямую. Это ручной источник фактов для обновления контента.

## Что откуда рендерится

- `pages/*.md` автоматически становятся маршрутами по полю `route`
- страница из `pages` попадает в меню только если у неё есть `showInNav: true`
- `posts/*.md` автоматически становятся detail-страницами
- `section: blog` рендерится по адресу `/blog/:slug`
- `section: projects` рендерится по адресу `/projects/:slug`
- `/blog` редиректит на `/`
- главная страница `/` остаётся обычной markdown-страницей и показывает ленту через `::post-feed`

## Как добавить новую страницу

1. Создайте файл `src/content/pages/<slug>.md`.
2. Добавьте frontmatter с `route`.
3. Если страница должна появиться в меню, добавьте `showInNav`, `navLabel`, `navIcon`, `order`.
4. Напишите body в поддерживаемом markdown-формате.

Минимальный пример:

```md
---
route: /services
title: Услуги
eyebrow: Vladislav Plotnikov
description: Короткое описание страницы
---

## Что здесь есть

Текст страницы.
```

Пример страницы в меню:

```md
---
route: /services
showInNav: true
navLabel: /services
navIcon: file-text
order: 4
title: Услуги
eyebrow: Vladislav Plotnikov
---
```

Поддерживаемые `navIcon`:

- `user`
- `file-text`
- `folder-open`
- `book-open`

## Как добавить новый пост

1. Создайте файл `src/content/posts/<slug>.md`.
2. Укажите `section: blog`.
3. Укажите `date` строго в формате `YYYY-MM-DD`.
4. Укажите `tags` через запятую.
5. Добавьте текст и, при необходимости, `::media`.

Пример:

```md
---
title: ROS Meetup 2026
section: blog
date: 2026-03-19
tags: ROS Meetup, 2026, выступление
---

::media
kind: video
src: https://example.com/video
caption: Видео выступления
::

Краткое описание материала.
```

Поведение:

- маршрут будет создан автоматически как `/blog/<slug>`
- карточка появится на главной странице в `post-feed`
- сортировка на главной идёт по `date` от новых к старым
- превью-текст берётся из первого текстового блока
- превью-медиа берётся из первого блока `::media`

## Как добавить новый проект

Проект теперь использует тот же тип контента, что и пост.

1. Создайте файл `src/content/posts/<slug>.md`.
2. Укажите `section: projects`.
3. Укажите `date` в формате `YYYY-MM-DD`.
4. Добавьте `tags`.

Пример:

```md
---
title: My Robotics Framework
section: projects
date: 2026-03-19
tags: ROS 2, robotics, architecture
---

Краткое описание проекта.
```

Поведение:

- маршрут будет создан автоматически как `/projects/<slug>`
- карточка попадёт на страницу `/projects`, если на ней используется `::post-feed` с `section: projects`
- в главную ленту такой материал не попадёт

## Директивы в `pages`

Поддерживаются:

- `::hero`
- `::card`
- `::skill-group`
- `::post-feed`

### `::post-feed`

Рендерит список карточек из `posts`.

По умолчанию:

- если поле не указано, используется `section: blog`

Примеры:

```md
::post-feed
::
```

```md
::post-feed
section: projects
::
```

## Директивы в `posts`

Поддерживается `::media`.

Пример:

```md
::media
kind: image
src: /images/example.jpg
alt: Подпись для изображения
caption: Короткая подпись
::
```

Правила:

- `kind` обязателен: `image` или `video`
- `src` обязателен
- первое `::media` используется как превью для карточки
- для видео thumbnail берётся из `src/content/generated/postVideoThumbnails.ts`, если он был сгенерирован

## Локальная проверка

Предпочтительный способ локальной разработки:

```bash
bash docker/run-dev.sh
```

Dev server поднимается на `http://localhost:3000`.

## Проверки и зависимости

Все установки и проверки выполняйте только через Docker-скрипты:

```bash
bash docker/run-npm.sh install
bash docker/run-check.sh typecheck
bash docker/run-check.sh build
```

Если меняются video-posts и нужны новые превью для видео:

```bash
node scripts/generate-post-video-thumbnails.mjs
```

## Практические правила

- изображения для markdown храните в `public/images/`
- в markdown ссылайтесь на них через public-path, например `/images/face.jpg`
- не хардкодьте markdown-изображения в page-компонентах
- любые изменения типографики, навигации, отступов и акцентов проверяйте и на desktop, и на mobile
- bottom navigation должна оставаться читаемой и сбалансированной по ширине
- длинные заголовки страниц не должны ломать композицию на узком экране
