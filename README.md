# Heisenbug 2021 Moscow

## Требуемое ПО

- [Docker](https://www.docker.com/)
- [git](https://git-scm.com/)
- [jq](https://github.com/stedolan/jq/releases)
- [Node](https://nodejs.org/en/) (preferably 14.x or greater)

## Структура проекта

- `app-config` - примеры файлов конфигурации для интеграции Drill4J с Cypress
- `drill4j-services` - композник и .env для запуска сервисов Drill4J

## Подготовка и запуск приложения

1. Склонировать репозиторий

    ```shell
    git clone https://github.com/Drill4J/realworld-react-cypress
    ```

2. Установить зависимости

    - В случае медленной установки Cypress можно установить альтернативный URL для загрузки cypress binaries

        > команда "npm config set CYPRESS_INSTALL_BINARY" применяется глобально, изменения записываются .npmrc файл. Не забудьте удалить после workshop для корретной работы с другими версиями cypress

        windows

        `npm config set CYPRESS_INSTALL_BINARY "https://github.com/Drill4J/heisenbug-moscow-2021-workshop/releases/download/binaries/cypress-8.4.0-win32-x64.zip"`

        macOS

        `npm config set CYPRESS_INSTALL_BINARY "https://github.com/Drill4J/heisenbug-moscow-2021-workshop/releases/download/binaries/cypress-8.4.0-darwin-x64.zip"`

        linux

        `npm config set CYPRESS_INSTALL_BINARY "https://github.com/Drill4J/heisenbug-moscow-2021-workshop/releases/download/binaries/cypress-8.4.0-linux-x64.zip"`

    - Install

    ```shell
        npm install
    ```

3. Сделать билд

    ```shell
        npm run build && \
        docker-compose build --no-cache

    ```

4. Запустить приложение (by default на http://localhost:4100)

    ```shell
        docker-compose up -d
    ```

5. Запустить тесты

    ```shell
        node_modules/.bin/cypress open
    ```

## Drill4J - запуск и интеграция

1. Запустить сервисы Drill4J
    - cd drill4js-services
    - `docker-compose up -d`
    - Drill4J Admin Panel на http://localhost:8091

2. Добавить [@drill4j/js-parser](https://www.npmjs.com/package/@drill4j/js-parser) в build pipeline приложения
    - Установить `npm i -g @drill4j/js-parser`
    - Сгенерировать конфиг
        - `npx @drill4j/js-parser generate`
        - `npx @drill4j/js-parser match`
        - `npx @drill4j/js-parser --dry`
    - Проанализировать приложение (с отправкой данный в Drill4J)
        - `npx @drill4j/js-parser`

3. Зарегистрировать приложение в Drill4J Admin Panel http://localhost:8091

4. Интегрировать Drill4J с Cypress

    Шаг 1 - Собрать данные с baseline build

    - Установить [@drill4j/js-auto-test-agent](https://www.npmjs.com/package/@drill4j/js-auto-test-agent)
        - `npm i --save-dev @drill4j/js-auto-test-agent`
        - Копировать [drill4j-integration.js](./app-config/drill4j-integration.js)
        - Добавить DRILL_AGENT_ID и DRILL_ADMIN_URL в поле "env" в [cypress.json](./app-config/cypress.json)
        - Импортировать `drill4j-integration.js` в [support/index.js](./app-config/supportfile.js)

    - Запустить тесты
        - `node_modules/.bin/cypress run`

    - Открыть Drill4J Admin Panel http://localhost:8091

    - Перейти на [страницу агента](http://localhost:8091/full-page/react-redux-realworld-ui/0.1.0/test2code/dashboard/methods)

    - Дождаться окончания тестов

    - ***ВАЖНО***: сохранить данные нажатием кнопки "Finish scope"

    Шаг 1.5 - изменить код [см. раздел ниже](#new-build)

    Шаг 2 - Использовать рекомендации по запуску тестов (test2runs)

    - Установить Cypress grep `npm i --save-dev cypress-grep`
    - Установить [jq](https://github.com/stedolan/jq/releases) (для преобразования JSON от Drill4J в строку для cypress-grep)
    - Импортировать cypress-grep в [support/index.js](./app-config/supportfile.js)
    - Использовать скрипт [`tests2run.sh`](./app-config/tests2run.sh) для запуска тестов с test2run-ами

## New build

- Поменять что-то в исходниках (изменить существующие функции, можно еще и добавить новые)

- ***ВАЖНО***: Увеличить версию - package.json, поле `"version"`

- Перебилдить, отправить данные в Drill4J

```shell
    npm run build && \
    npx @drill4j/js-parser && \
    docker-compose build --no-cache && \
    docker-compose down && \
    docker-compose up -d
    
```
