FROM golang:1.22-alpine AS build

WORKDIR /workspace/backend

COPY backend/go.mod ./
COPY backend/cmd ./cmd
COPY backend/internal ./internal

RUN go build -o /out/api ./cmd/api

FROM gcr.io/distroless/base-debian12

WORKDIR /app

COPY --from=build /out/api /app/api

ENV PORT=8080

EXPOSE 8080

ENTRYPOINT ["/app/api"]
