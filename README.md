# Wittr

This is a silly little demo app for an offline-first course.

You could run the app either using machine dependnecies, or using docker

## Running using docker

```sh
docker-compose up
```

## Running using local machine

### Installing

Dependencies:

* [Node.js](https://nodejs.org/en/) v0.12.7 or above

Then check out the project and run:

```sh
npm install
```

### Running

```sh
npm run serve
```

## Using the app

You should now have the app server at [localhost:8888](http://localhost:8888) and the config server at [localhost:8889](http://localhost:8889).

You can also configure the ports:

```sh
npm run serve -- --server-port=8000 --config-server-port=8001
```

If you are using docker-compose, update the host port(s) in docker-compose.yml

```yml
ports:
  # <host>:<container>
  - 8000:8888
  - 8001:8889
```

## Troubleshooting

* Errors while executing `npm run serve`
  * The first thing to try is to upgrade to latest version of node
  * If latest version also produces errors, try installing v4.5.0
    * An easy for that would be to use `nvm` as discussed [here](http://stackoverflow.com/a/7718438/1585523)
* If you faced any node-sass errors, try running `npm rebuild node-sass --force` or remove __node_modules__ folder and run `npm install` again
