list:
    @just -l

dev:
    ./backend/feedaka &
    cd frontend && npm run dev

build: generate
    cd frontend && npm run build
    cd backend && just build

fmt:
    cd frontend && npm run fix
    cd backend && just fmt

check:
    cd frontend && npm run check
    cd backend && just check

generate:
    cd frontend && npm run generate
    cd backend && just generate
