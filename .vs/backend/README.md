# Backend — Менеджер заявок на доступ до лабораторії

## Запуск

```bash
npm install
npm run dev
```

Сервер запускається на `http://localhost:3000`

## Сутності

- **Users** — користувачі системи
- **AccessRequests** — заявки на доступ до лабораторії
- **Approvals** — рішення по заявках

## Маршрути

| Метод | URL | Опис |
|-------|-----|------|
| GET | /api/users | Список користувачів |
| GET | /api/users/:id | Користувач за ID |
| POST | /api/users | Створити користувача |
| PUT | /api/users/:id | Оновити користувача |
| DELETE | /api/users/:id | Видалити користувача |
| GET | /api/access-requests | Список заявок |
| GET | /api/access-requests/:id | Заявка за ID |
| POST | /api/access-requests | Створити заявку |
| PUT | /api/access-requests/:id | Оновити заявку |
| DELETE | /api/access-requests/:id | Видалити заявку |
| GET | /api/approvals | Список рішень |
| GET | /api/approvals/:id | Рішення за ID |
| POST | /api/approvals | Створити рішення |
| PUT | /api/approvals/:id | Оновити рішення |
| DELETE | /api/approvals/:id | Видалити рішення |

## Query параметри

| Параметр | Опис | Приклад |
|----------|------|---------|
| page | Номер сторінки | ?page=1 |
| pageSize | Розмір сторінки | ?pageSize=10 |
| sortBy | Поле сортування | ?sortBy=date |
| order | Напрямок сортування | ?order=desc |
| status | Фільтр по статусу (заявки) | ?status=Pending |
| accessType | Фільтр по типу доступу | ?accessType=Read |
| decision | Фільтр по рішенню | ?decision=Approved |

## Приклади curl

### Users

#### Створити користувача
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ivan Petrenko\",\"email\":\"ivan@example.com\"}"
```

#### Отримати всіх користувачів
```bash
curl http://localhost:3000/api/users
```

#### Отримати користувача за ID
```bash
curl http://localhost:3000/api/users/1
```

#### Оновити користувача
```bash
curl -X PUT http://localhost:3000/api/users/1 \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Ivan Updated\",\"email\":\"ivan.new@example.com\"}"
```

#### Видалити користувача
```bash
curl -X DELETE http://localhost:3000/api/users/1
```

### AccessRequests

#### Створити заявку
```bash
curl -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"date\":\"2026-05-27T10:00:00Z\",\"accessType\":\"Read\",\"comments\":\"Need access for lab work\"}"
```

#### Отримати всі заявки з фільтром
```bash
curl "http://localhost:3000/api/access-requests?status=Pending&sortBy=date&order=desc"
```

#### Оновити статус заявки
```bash
curl -X PUT http://localhost:3000/api/access-requests/1 \
  -H "Content-Type: application/json" \
  -d "{\"status\":\"Approved\"}"
```

#### Видалити заявку
```bash
curl -X DELETE http://localhost:3000/api/access-requests/1
```

### Approvals

#### Створити рішення
```bash
curl -X POST http://localhost:3000/api/approvals \
  -H "Content-Type: application/json" \
  -d "{\"accessRequestId\":1,\"approverId\":1,\"decision\":\"Approved\",\"notes\":\"All good\"}"
```

#### Отримати рішення з фільтром
```bash
curl "http://localhost:3000/api/approvals?decision=Approved"
```

#### Видалити рішення
```bash
curl -X DELETE http://localhost:3000/api/approvals/1
```

## Валідація

### Приклад помилки валідації (400)
```bash
curl -X POST http://localhost:3000/api/access-requests \
  -H "Content-Type: application/json" \
  -d "{\"userId\":1,\"date\":\"not-a-date\",\"accessType\":\"InvalidType\",\"comments\":\"hi\"}"
```

Відповідь:
```json
{
  "error": {
    "message": "Validation error",
    "details": [
      "date must be a valid ISO string",
      "accessType must be one of: Read, Write, Admin",
      "comments must be at least 3 characters"
    ]
  }
}
```

### Приклад 404
```bash
curl http://localhost:3000/api/users/999
```

Відповідь:
```json
{
  "error": {
    "message": "User not found",
    "details": []
  }
}
```