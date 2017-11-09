# Wittr

This is a silly little demo app for an offline-first course.

# Installing

Dependencies:

* [Node.js](https://nodejs.org/en/) v0.12.7 or above

Then check out the project and run:

```sh
npm install
```

# Running

```sh
npm run serve
```

You should now have the app server at [localhost:8888](http://localhost:8888) and the config server at [localhost:8889](http://localhost:8889).

You can also configure the ports:

```sh
npm run serve -- --server-port=8000 --config-server-port=8001
```

# Troubleshooting

- Errors while executing `npm run serve`
  - The first thing to try is to upgrade to latest version of node
  - If latest version also produces errors, try installing v4.5.0
    - An easy for that would be to use `nvm` as discussed [here](http://stackoverflow.com/a/7718438/1585523)
