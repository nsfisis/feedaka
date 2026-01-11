# feedaka

A simple RSS/Atom feed reader. This is my personal project and is developed for my use only.

> [!NOTE]
> Built with AI & Vibe Coding - This project is developed through collaborative coding with AI assistants.

## Requirements

* Go 1.24+
* Node.js 22+
* Docker and Docker Compose
* [Just](https://github.com/casey/just)

## Run

### Docker

```bash
$ docker compose up
```

Access at <http://localhost:8002>.

### Non-docker

```bash
$ just build
$ cd frontend && npm run dev &
$ cd .. && just serve
```