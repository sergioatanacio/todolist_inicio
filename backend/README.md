# Backend

Backend en Go orientado a clean architecture.

Capas:

- `internal/domain`: agregados, value objects, eventos, state machines y estrategias.
- `internal/application`: casos de uso y validacion de comandos.
- `internal/infrastructure`: adaptadores, ids, clock, persistencia y transacciones.
- `internal/httpserver`: wiring y handlers HTTP.

Patrones ya reflejados en codigo:

- puertos y adaptadores,
- aggregate root,
- result pattern,
- state machines,
- strategy pattern.

Slice vertical ya migrado:

- `task`: agregado, eventos, maquina de estados, repositorio y caso de uso `CreateTask`.

La siguiente fase es portar el resto de agregados actuales del frontend hacia estas mismas capas y reemplazar los adaptadores en memoria por Firestore y Firebase Auth.
