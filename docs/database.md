# Database Structure

Entity relation diagram of the current PostgreSQL schema, generated from the Drizzle schemas in `database/src/schemas/` and `database/src/relations.ts`.

```mermaid
erDiagram
    user {
        text id PK
        text name
        text email UK
        boolean email_verified
        text image
        timestamp created_at
        timestamp updated_at
        text username UK
        text display_username
    }

    session {
        text id PK
        text user_id FK
        timestamp expires_at
        text token UK
        text ip_address
        text user_agent
        timestamp created_at
        timestamp updated_at
    }

    account {
        text id PK
        text user_id FK
        text account_id
        text provider_id
        text access_token
        text refresh_token
        text id_token
        timestamp access_token_expires_at
        timestamp refresh_token_expires_at
        text scope
        text password
        timestamp created_at
        timestamp updated_at
    }

    verification {
        text id PK
        text identifier
        text value
        timestamp expires_at
        timestamp created_at
        timestamp updated_at
    }

    body_part {
        uuid id PK
        text name
        text slug UK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    muscle {
        uuid id PK
        uuid body_part_id FK
        text name
        text slug UK
        text graph_slug
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    equipment {
        uuid id PK
        text name
        text slug UK
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    exercise {
        uuid id PK
        text dataset_id UK
        uuid body_part_id FK "nullable"
        uuid equipment_id FK
        text name
        text[] instructions
        text image_path
        text gif_path
        text attribution
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    muscle_exercise {
        uuid id PK
        uuid exercise_id FK
        uuid muscle_id FK
        muscle_role role "primary | secondary"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    routine {
        uuid id PK
        text user_id FK
        varchar name
        varchar description "nullable"
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    routine_exercise {
        uuid id PK
        uuid routine_id FK
        uuid exercise_id FK
        integer position
        timestamp created_at
        timestamp updated_at
        timestamp deleted_at
    }

    user ||--o{ session : "has (cascade delete)"
    user ||--o{ account : "has (cascade delete)"
    user ||--o{ routine : "owns"
    body_part ||--o{ muscle : "contains (restrict delete)"
    body_part |o--o{ exercise : "groups (restrict delete)"
    equipment ||--o{ exercise : "used by (restrict delete)"
    exercise ||--o{ muscle_exercise : "works (cascade delete)"
    muscle ||--o{ muscle_exercise : "worked by (restrict delete)"
    routine ||--o{ routine_exercise : "contains (cascade delete)"
    exercise ||--o{ routine_exercise : "used in (restrict delete)"
```

## Notes

- `user`, `session`, `account` and `verification` are the auth tables (better-auth). `verification` has no foreign keys.
- `body_part`, `muscle`, `equipment`, `exercise`, `muscle_exercise`, `routine` and `routine_exercise` are soft-deleted via `deleted_at`.
- `muscle.graph_slug` is stored as text but constrained in Zod to the region ids used by `react-muscle-highlighter`.
- `exercise` rows are imported from the exercises dataset by the seeder. `dataset_id` is the dataset's four-digit id and the seeder's upsert key. `image_path` and `gif_path` are relative to the media root served by nginx under `/media/`.
- `exercise.body_part_id` is nullable: cardio exercises have no body region.
- `muscle_exercise` links exercises to the muscles they work. One row per (exercise, muscle) pair, enforced by a unique index; `role` is `primary` or `secondary`.
- `routine` belongs to a `user`. Ownership is checked in the queries (`user_id` + `deleted_at IS NULL`); deletes are soft.
- `routine_exercise` links a routine to its exercises. One row per exercise slot, ordered by `position` within the routine. The same exercise may appear more than once (e.g. supersets), so there is no unique index on `(routine_id, exercise_id)`, and `position` is not unique either so reorders don't trip a constraint. Sets/reps are not stored here.
- Indexes: `session.user_id`, `account.user_id`, `verification.identifier`, `muscle.body_part_id`, `exercise.body_part_id`, `exercise.equipment_id`, `muscle_exercise.(exercise_id, muscle_id)` (unique), `muscle_exercise.muscle_id`, `routine.user_id`, `routine_exercise.routine_id`, `routine_exercise.exercise_id`.
