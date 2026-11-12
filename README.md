# SkyBook Airline Reservation Frontend

React + Vite frontend for the existing Spring Boot Airline Reservation System.

## Requirements
- Node.js 20+ recommended
- Spring Boot backend running at `http://localhost:8080`
- Existing registered USER and ADMIN accounts
- Existing passenger records to create bookings (the current backend booking endpoint accepts `passengerId` and `flightId`)

## Run in VS Code terminal

```bash
npm install
npm run dev
```

Open http://localhost:5173

## API base URL
Default: `http://localhost:8080/api/v1`

To change it, copy `.env.example` to `.env` and set `VITE_API_BASE_URL`.

Restart Vite after changing `.env`.

## Included pages
- Login (POST `/auth/login`)
- Dashboard
- Flight list/search and fare filter (GET `/flights`, GET `/airports`)
- Create booking (POST `/bookings`)
- My bookings (GET `/bookings/my-history`)
- Cancel booking (PUT `/bookings/{id}/cancel`)
- Admin management for flights and airports (POST/DELETE endpoints)

## Important backend assumptions
- Login response contains a `token` field.
- JWT contains a `role` claim such as `USER` or `ADMIN`.
- Flight JSON uses `id`, `flightNumber`, `departureAirportId`, `arrivalAirportId`, `departureTime`, `arrivalTime`, `fare`, and `availableSeats`.
- Airport JSON uses `id`, `code`, `name`, and `city`.
- Booking creation body is `{ "passengerId": 1, "flightId": 2 }`.
- Booking cancel endpoint is `PUT /bookings/{id}/cancel`.

If your backend DTOs differ, adjust the relevant request/response mapping in `src/pages`.

## CORS
The backend SecurityConfig should allow `http://localhost:5173` and `OPTIONS` requests. Swagger/Postman success does not prove browser CORS is configured.

## Security note
Role display is decoded from the JWT for UI convenience only. Backend authorization is authoritative. Never allow public registration to assign ADMIN roles. JWTs are stored in localStorage for this demo; for a production app, consider a stronger session/token storage strategy.
