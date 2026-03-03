# AGENTS.md

Инструкции для агентa, который работает в этом репозитории.

## Назначение проекта

Это персональный сайт-резюме Владислава Плотникова.

Проект уже очищен от старого шаблона. Не возвращайте:

- фейковые карточки проектов
- фейковые карточки постов
- placeholder-контент вида `ivan`, `example.com`, `github.com/example`
- большой UI-kit, если он не нужен для конкретной задачи

## Источник правды для контента

Главный рабочий источник для фактов о карьере:

- `resume.txt`

Главный источник для контента, который реально рендерится в приложении:

- `src/content/menu.md`
- `src/content/pages/*.md`
- `src/content/posts/*.md`
- `src/content/markdownPages.ts`
- `src/content/posts.ts`
- `src/content/generated/postVideoThumbnails.ts`

Статические изображения, используемые из markdown-контента:

- `public/images/*`

Правило:

- если меняется биография, опыт, стек или контакты, сначала сверяйтесь с `resume.txt`
- затем обновляйте соответствующие markdown-файлы в `src/content/pages/`
- если меняется список постов или их содержимое, обновляйте `src/content/posts/*.md`
- если меняется поведение video preview у постов, сверяйтесь с `src/content/generated/postVideoThumbnails.ts` и `scripts/generate-post-video-thumbnails.mjs`
- не храните большие блоки текста напрямую в page-компонентах, если это можно вынести в markdown-контент
- изображения, которые подключаются из markdown, храните в `public/images/`
- если изображение можно задать через markdown, не хардкодьте путь к нему в page-компоненте
- если меняется frontmatter или правила рендера markdown, сверяйтесь с `src/content/markdownPages.ts`, `src/content/posts.ts`, `src/components/MarkdownPage.tsx` и `src/components/PostPage.tsx`

`resume.txt` не должен автоматически парситься приложением. Это ручной источник фактов.

## Текущая структура сайта

Маршруты:

- `/` — `About`
- `/resume` — `Resume`
- `/projects` — заглушка
- `/posts` — лента постов
- `/posts/:slug` — отдельная страница поста

Текущие route components:

- `src/components/Layout.tsx`
- `src/components/MarkdownPage.tsx`
- `src/components/PostPage.tsx`

Роутинг находится в:

- `src/routes.ts`

Не добавляйте параллельные слои страниц вроде `src/pages/*` и `src/components/pages/*`, если на это нет прямого запроса.

## Markdown source of truth

Основные файлы markdown-слоя:

- `src/content/menu.md`
- `src/content/pages/about.md`
- `src/content/pages/resume.md`
- `src/content/pages/projects.md`
- `src/content/pages/posts.md`
- `src/content/posts/*.md`
- `src/content/markdownPages.ts`
- `src/content/posts.ts`
- `src/content/generated/postVideoThumbnails.ts`
- `src/components/MarkdownPage.tsx`
- `src/components/PostPage.tsx`

Ограничения текущего markdown-парсера:

- route, label и icon навигации задаются в `src/content/menu.md`, а не во frontmatter страниц
- `title` и menu `label` можно хранить в обычном регистре; UI сам отображает их в uppercase
- page header рендерится одинаково для всех страниц; он может содержать `eyebrow`, `title`, `description`
- если конкретное поле frontmatter пустое или отсутствует, оно не рендерится
- `::hero` не скрывает стандартный page header и остается обычным body-блоком
- `::post-feed` рендерит ленту карточек постов внутри обычной markdown-страницы
- menu item `page` связывает пункт меню с markdown-страницей по slug файла
- режим mobile layout действует до ширины `999px`, desktop начинается с `1000px`
- в body разрешены только `##` и `###`
- body-level `#` запрещен; для заголовков секций используйте `##`
- поддерживаются абзацы, простые списки, blockquote, ссылки, `**bold**`, `*emphasis*`, `` `inline code` ``
- поддерживаются multiline list items через indentation
- дополнительно поддерживаются структурные директивы `::menu-item`, `::hero`, `::card`, `::skill-group`, `::post-feed`
- это ограниченное подмножество markdown; не рассчитывайте на полный CommonMark

Ограничения markdown-постов (`src/content/posts/*.md`):

- post frontmatter использует отдельную схему: `title`, `date`, `order`, `tags`
- `slug` поста задается именем файла
- body поста поддерживает тот же текстовый набор (`##`, `###`, абзацы, списки, blockquote, ссылки, inline formatting)
- в body поста из структурных директив поддерживается только `::media`
- первое `::media` используется как preview media в карточке
- первый текстовый блок используется как preview excerpt, если он есть
- для `::media kind: video` thumbnail для карточки пытается автоматически извлекаться на этапе build из внешнего URL
- если thumbnail извлечь не удалось, карточка показывает fallback-блок `Видео`

Поддерживаемые директивы body markdown:

- `::menu-item`
- используется только в `src/content/menu.md`
- обязательные поля: `id`, `page`, `route`, `label`
- опциональное поле: `icon`
- `page` — это slug файла из `src/content/pages/*.md`

- `::hero`
- для титульного блока страницы
- обязательное поле: `name`
- повторяемое поле: `contact`
- `contact` использует формат `type|label|href`
- поддерживаемые `type`: `phone`, `email`, `telegram`
- опциональные общие поля карточки: `fill`, `stroke`, `headingVariant`, `photo`, `title`, `subtitle`, `period`, `meta`, `summary`
- `photo` использует URL изображения, например путь к файлу из `public`
- повторяемое поле: `subtitleLine`
- `subtitleLine` использует формат `text|period`
- `::hero` должен оставаться карточкой на базе общего дизайна `card`; hero-специфика здесь: `name`, контакты и опциональное фото
- `photo` рендерится как часть hero-card, а не как отдельный блок вне карточки
- при наличии `photo` на desktop фото должно оставаться у правого края
- при наличии `photo` на mobile фото должно идти выше текста и центрироваться
- при наличии `photo` контакты должны оставаться слева в текстовой колонке
- контакты в hero должны рендериться вертикальным списком, а не grid/box-раскладкой

- `::card`
- для блоков опыта и образования
- обязательные поля: `kind`, `title`
- `kind`: `experience` или `education`
- опциональные поля: `fill`, `stroke`, `headingVariant`, `subtitle`, `period`, `meta`, `summary`
- повторяемые поля: `bullet`, `subtitleLine`
- `subtitleLine` использует формат `text|period`
- legacy-алиасы, которые пока допустимы: `variant: outline`, `role`, `roleLine`

- `::skill-group`
- для групп навыков
- обязательные поля: `title`, `variant`
- `variant`: `solid` или `outline`
- повторяемое поле: `skill`

- `::post-feed`
- используется только в `src/content/pages/posts.md`
- полей не поддерживает
- рендерит список карточек постов из `src/content/posts/*.md`

- `::media`
- используется только в `src/content/posts/*.md`
- обязательные поля: `kind`, `src`
- `kind`: `image` или `video`
- опциональные поля: `alt`, `caption`
- первое `::media` внутри поста становится preview media в карточке
- для `video` thumbnail не хранится в markdown; он вычисляется build-скриптом best-effort

Если меняется допустимый markdown-синтаксис или логика рендера в `src/components/MarkdownPage.tsx`, синхронно обновляйте `README.md` и `AGENTS.md`.

Обязательное правило по документации:

- при любом изменении архитектуры контент-слоя, роутинга, frontmatter, поддерживаемых markdown-директив, responsive-правил или UI-поведения страниц агент обязан в той же задаче обновить `README.md` и `AGENTS.md`
- нельзя оставлять кодовые изменения, которые меняют фактическое поведение сайта, без синхронного обновления документации
- если изменилось поведение, но обновлять документацию не потребовалось, это нужно отдельно перепроверить, потому что по умолчанию такие изменения считаются требующими правки доков

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

Для текущих специальных блоков:

- hero block должен быть прямоугольником без границы
- hero block должен иметь сплошную серую заливку
- в светлой теме заливка hero block должна быть темнее фона страницы
- в темной теме заливка hero block должна быть светлее фона страницы
- если у hero есть фото, оно должно оставаться частью той же карточки, а не отдельной карточкой или самостоятельным медиаблоком
- фото в hero не должно ломать читаемость заголовка и контактов на mobile
- блоки опыта и образования должны быть прямоугольными, без заливки, с легким контуром затемненного mint-акцента
- карточки постов должны быть прямоугольными, без заливки, с серым контуром
- preview media в карточке поста должно оставаться внутри той же карточки
- на desktop preview media поста должно идти справа
- на mobile preview media поста должно идти выше текста
- навыки должны оформляться маленькими стандартизированными прямоугольниками, не pill-формой
- `solid`-скиллы используются для основных навыков
- `outline`-скиллы используются для остальных навыков

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
node scripts/generate-post-video-thumbnails.mjs
bash docker/run-npm.sh install
bash docker/run-check.sh typecheck
bash docker/run-check.sh build
```

Правила для агента:

- не запускать `npm install`, `npm run typecheck` и `npm run build` напрямую на хосте
- разрешается запускать `node scripts/generate-post-video-thumbnails.mjs` на хосте как часть подготовки content-manifest
- если нужна установка зависимости, сначала предложить запуск `bash docker/run-npm.sh ...` и дождаться подтверждения пользователя
- если нужна проверка, сначала предложить запуск `bash docker/run-check.sh ...` и дождаться подтверждения пользователя
- `docker/run-check.sh` использует `docker exec -it` / `docker run -it`; при запуске агентом или из sandbox может понадобиться TTY
- при ограниченном доступе к Docker daemon может потребоваться отдельное разрешение на выполнение Docker-команд

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

Чтобы добавить новую страницу, обычно нужно:

- создать markdown-файл в `src/content/pages/`
- добавить пункт в `src/content/menu.md`

Не возвращайте хранение `route` и `navLabel` во frontmatter страниц.

Дополнительные правила по страницам:

- `src/content/pages/about.md` должен оставаться агрегированным профилем, а не подробным CV-таймлайном
- для `about.md` используйте `::hero`, но не переносите туда отдельные карточки мест работы и отдельные карточки образования без прямого запроса
- если меняется фото профиля для `about.md`, обновляйте canonical-файл в `public/images/` и путь в `::hero`, не создавая дубли вроде `face-final.jpg`
- `src/content/pages/resume.md` должен оставаться полной структурированной CV-страницей
- для `resume.md` опыт и образование оформляйте через `::card`
- для `resume.md` навыки оформляйте через `::skill-group`
- `src/content/pages/posts.md` должен оставаться страницей-индексом и рендерить ленту через `::post-feed`
- отдельные посты храните в `src/content/posts/*.md`, а не внутри `posts.md`
- для постов используйте `::media`, если нужен preview image/video
- `photo` поддерживается только в `::hero`; не расширяйте `::card` и `::skill-group` изображениями без прямого запроса

## Ожидания по качеству

Перед завершением изменений желательно проверить:

1. Нет ли в коде строк `ivan` или `example.com`
2. Не появились ли битые импорты после удаления файлов
3. Не нарушена ли навигация между `/`, `/resume`, `/projects`, `/posts`
4. Не сломан ли GitHub Pages fallback
5. Агент должен в конце работы пытаться запускать `bash docker/run-check.sh typecheck` и `bash docker/run-check.sh build`; если запуск невозможен из-за sandbox, TTY или доступа к Docker, это нужно явно зафиксировать в ответе.

Если сборка локально не идет только потому, что зависимости не установлены, это нужно явно зафиксировать в ответе.
