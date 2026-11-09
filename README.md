# vladislavplotnikov.ru

Персональный сайт-резюме Владислава Плотникова.

Сайт собирается из markdown-контента двух типов:

- `src/content/pages/*.md` — обычные страницы сайта
- `src/content/cards/**/*.md` — карточки/посты для feed-страниц

`resume.txt` не рендерится напрямую. Это ручной источник фактов для обновления контента.

## Что откуда рендерится

- `pages/*.md` автоматически становятся маршрутами по полю `route`
- главная собирается из `home.md`, опубликованных проектов и трёх последних публикаций
- `showInNav` остаётся метаданными контента; постоянного меню в текущем дизайне нет
- страница может объявить feed через `::post-feed` с `feed: <id>`
- `cards/**/*.md` автоматически становятся detail-страницами
- карточка указывает `feed: <id>` в frontmatter
- detail-route карточки строится от route страницы, которой принадлежит feed
- `/about` содержит ссылку на полное резюме `/resume`; консультации доступны на `/consult`

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
- `::project-feed`
- `::native-demo`
- `::media` (тот же формат изображений/видео, что в постах)

`::project-feed` показывает страницы `/projects/*`. В их frontmatter можно задать `projectTags` (темы через запятую) и `projectIcon` (emoji или public-path изображения). Архивы проектов и публикаций используют множественный выбор тем с условием «ИЛИ»; годовые теги остаются в контенте, но не становятся фильтрами.

`::native-demo` принимает необязательный `poster: <URL изображения>` из Markdown. Демо запускается только кнопкой «Открыть демо». После «Выйти из демо» iframe остаётся для сохранения незавершённых правок, становится `inert` и перестаёт принимать ввод; его layout/render приостанавливаются. Колесо снова прокручивает страницу.

`::native-demo` встраивает браузерную версию того же UI Genealogy Graph на вымышленных данных. Самодостаточный HTML хранится в `src/assets/genealogy-native.html`, загружается отдельным lazy chunk и исполняется в sandbox iframe. Изменения демо изолированы в хранилище браузера; реального vault и доступа к Obsidian нет. Исходный plugin UI, лицензии и происхождение сборки описаны в `public/licenses/genealogy-*`. Это принятый снимок демо: для обновления нужно заново собрать browser host в отдельной библиотеке компонентов и заменить HTML вместе с лицензиями, без зависимости от соседнего репозитория при запуске сайта. Файл снимка не патчится: `src/components/ui/nativeDemoDocument.ts` добавляет перед `</body>` читаемый site-owned `src/assets/genealogy-host-override.js`. Он скрывает внутреннюю шапку browser host, сохраняя исходный plugin UI/стили. Единственная внешняя шапка содержит выход и кнопки настроек/сброса. Source-checked message bridge вызывает именно существующие обработчики `.native-host-actions` через `.click()`, включая оригинальное подтверждение и перезагрузку при сбросе. При закрытом демо все три кнопки скрыты и отключены. При обновлении снимка проверьте контракт `window.__nativeGenealogy`, `.native-header`, `.native-host-actions`, подписи кнопок и открытие/выход/настройки/сброс.

### `::hero`

Рендерит hero-карточку страницы.

Пример:

```md
::hero
name: Владислав Плотников
photo: /images/face.jpg
imageSize: medium
photoLayout: side
title: Короткое описание
::
```

Правила:

- `name` обязателен
- `photo` опционален
- `imageSize` опционален: `small`, `medium`, `large`
- если `imageSize` не указан, используется `medium`
- `photoLayout` опционален: `side`, `banner`
- если `photoLayout` не указан, используется `side`

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

Ссылка на Telegram-блог находится на странице `/blog`; контактный Telegram доступен в социальных ссылках на главной.

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

## Приватная статистика посещений

Cloudflare Web Analytics подключается только в production-сборке на `vladislavplotnikov.ru`, когда задан `VITE_CF_WEB_ANALYTICS_TOKEN`. Без токена, в dev-режиме и на локальных/других доменах скрипт не загружается. Счётчика на странице нет; статистика доступна в кабинете Cloudflare.

1. В Cloudflare → Web Analytics добавьте сайт `vladislavplotnikov.ru` и выберите ручную установку JS snippet.
2. Из **Manage site → JS snippet** возьмите значение `token` из `data-cf-beacon`. Это публичный идентификатор сайта, а не Cloudflare API token.
3. В GitHub-репозитории откройте **Settings → Secrets and variables → Actions → Variables** и добавьте repository variable `CF_WEB_ANALYTICS_TOKEN` с этим значением.
4. Запустите workflow **Deploy Vite site to GitHub Pages** заново. Он передаёт переменную в Vite во время сборки. Для отключения удалите переменную и повторите публикацию.

Используется один официальный beacon; переходы React Router учитываются автоматически, без дополнительных вызовов счётчика. Не включайте параллельно автоматическую вставку того же скрипта через Cloudflare proxy.

Документация: [подключение](https://developers.cloudflare.com/web-analytics/get-started/) · [автоматический учёт SPA-переходов](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/).

## Дизайн и доступность

`src/components/ui` содержит используемые сайтом компоненты, `src/styles/tokens.css` — шрифты и палитру. Inter и Roboto Mono поставляются локально из npm-пакетов. Фон остаётся закреплённым при прокрутке; переходы сохраняют старую страницу до завершения fade-out. Клавиатурная навигация, история браузера и `prefers-reduced-motion` переключают страницы сразу. При скрытии страницы живой фон и demo приостанавливаются.

Полные тексты постов по-прежнему рендерятся из исходных Markdown, включая ссылки и `::media`. Поддерживаются также fenced code blocks. Отчёты локальных проверок и снимки экрана можно хранить в игнорируемой `.qa/`.

## Практические правила

- изображения для markdown храните в `public/images/`
- в markdown ссылайтесь на них через public-path, например `/images/face.jpg`
- не хардкодьте markdown-изображения в page-компонентах
- любые изменения типографики, навигации, отступов и акцентов проверяйте и на desktop, и на mobile
- сохраняйте компактную главную и явную ссылку возврата на внутренних страницах
- длинные заголовки страниц не должны ломать композицию на узком экране
