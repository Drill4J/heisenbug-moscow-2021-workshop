# Heisenbug 2021 Moscow

## Prerequisites

- [Docker](https://www.docker.com/)
- [git](https://git-scm.com/)
- [jq](https://github.com/stedolan/jq/releases)
- [Node](https://nodejs.org/en/) (preferably 14.x or greater)

## Folders

- `app-config` - various files required for example application
- `drill4j-services` - compose and .env files required to launch Drill4J backend services

## Подготовка и запуск приложения

- https://github.com/Drill4J/realworld-react-cypress
- git clone 
- `npm install`
- билд
  - `npm run build`
  - `docker-compose build --no-cache`
- перезапуск `docker-compose down && npm run build && docker-compose build --no-cache && docker-compose up -d`
- смотрим тесты `node_modules/.bin/cypress open`

## Настройка Drill4J

1. Example project
    - `npm i -g @drill4j/js-parser`
    - npx @drill4j/js-parser
        - `npx @drill4j/js-parser generate`
        - `npx @drill4j/js-parser match`
        - `npx @drill4j/js-parser --dry`

2. Сервисы Drill4J
    - cd drill4js-services
    - `docker-compose up -d`
    - Drill4J Admin Panel на http://localhost:8091

3. Регистрируем приложение

4. Cypress
    - Drill4J Js Auto Test agent
        - `npm i --save-dev @drill4j/js-auto-test-agent`
        - настраиваем `drill4j-integration.js`, `cypress.json`
        - импортируем `drill4j-integration.js` в `support/index.js`
    - cypress-grep
        - `npm i --save-dev cypress-grep`
        - импортируем cypress-grep в `support/index.js`
    - установить [jq](https://github.com/stedolan/jq/releases)
    - добавить в .env DRILL_AGENT_ID и DRILL_ADMIN_URL
    - копируем скрипт для запуска тестов tests2run.sh
