# vladislavplotnikov.ru

Персональный сайт-резюме Владислава Плотникова.

Сайт собирается из markdown-контента двух типов:

- `src/content/pages/*.md` — обычные страницы сайта
- `src/content/cards/**/*.md` — карточки/посты для feed-страниц

`resume.txt` не рендерится напрямую. Это ручной источник фактов для обновления контента.

## Что откуда рендерится

- `pages/*.md` автоматически становятся маршрутами по полю `route`
- страница из `pages` попадает в меню только если у неё есть `showInNav: true`
- страница может объявить feed через `::post-feed` с `feed: <id>`
- `cards/**/*.md` автоматически становятся detail-страницами
- карточка указывает `feed: <id>` в frontmatter
- detail-route карточки строится от route страницы, которой принадлежит feed
- если root-страницы `/` нет, `/` редиректит на первый пункт навигации

Пример:

- страница `/blog` с `::post-feed` и `feed: blog`
- карточка с `feed: blog`
- маршрут карточки будет `/blog/<slug>`

## Как добавить новую страницу

1. Создайте файл `src/content/pages/<slug>.md`.
2. Добавьте frontmatter с `route`.
3. Если страница должна появиться в меню, добавьте `showInNav`, `navLabel`, `navIcon`, `order`.
4. Если это feed-страница, добавьте `::post-feed` и укажите `feed: <id>`.

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

Пример страницы в меню с собственной лентой:

```md
---
route: /notes
showInNav: true
navLabel: /notes
navIcon: book-open
order: 4
title: Notes
eyebrow: Vladislav Plotnikov
---

::post-feed
feed: notes
::
```

Поддерживаемые `navIcon`:

- `user`
- `file-text`
- `folder-open`
- `book-open`

## Как добавить новую карточку

1. Создайте файл в `src/content/cards`, можно использовать подпапки, например `src/content/cards/blog/<slug>.md`.
2. Укажите `feed`, `date`, `tags`.
3. Добавьте текст и, при необходимости, `::media`.

Пример:

```md
---
title: ROS Meetup 2026
feed: blog
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

- карточка попадёт на страницу, где `::post-feed` ссылается на тот же `feed`
- маршрут будет построен автоматически от route этой страницы
- сортировка внутри feed идёт по `date` от новых к старым
- превью-текст берётся из первого текстового блока
- превью-медиа берётся из первого блока `::media`

Ограничения:

- каждый `feed` должен быть объявлен ровно на одной странице
- карточка не может ссылаться на несуществующий `feed`
- slug карточек остаётся глобально уникальным

## Директивы в `pages`

Поддерживаются:

- `::hero`
- `::card`
- `::skill-group`
- `::post-feed`

### `::hero`

Рендерит hero-карточку страницы.

Пример:

```md
::hero
name: Владислав Плотников
photo: /images/face.jpg
imageSize: medium
title: Короткое описание
::
```

Правила:

- `name` обязателен
- `photo` опционален
- `imageSize` опционален: `small`, `medium`, `large`
- если `imageSize` не указан, используется `medium`

### `::post-feed`

Рендерит список карточек из `cards`.

Пример:

```md
::post-feed
feed: blog
::
```

## Директивы в `cards`

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
