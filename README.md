# goal: track my workouts from my phone in the gym

## Website is live at

https://tracker.kevbot.xyz

## How to run this project

- You'll have to set up an auth0 app first and set a new `auth0Config` in `src/index.js`
- `npm install`
- `npm run init-db`
- `npm run dev`

## Definitions

- Machine: what exercise/activity you are doing (eg: bicep curl, lat pulldown, pushup?)
- Workout: a single lift on a given machine (eg: bicep curl, 40 pounds, 10 reps)

## things to have

- [x] big buttons easy to press on phone
- [x] push data to sqlite ~or google sheet~
- [x] submit a workout
- [x] add new machines in ui
- [x] remove machines
- [ ] add a no-auth env var
- [x] display historical data
  - [ ] display per-machine
- [x] support multiple users
- [ ] support decimal parts for weight
- [x] use templating engine
- [x] support migrations
- [ ] undo last submit
- [x] undo any submit
- [ ] add kevbadge
- [ ] add to projects.json
- [x] private gh repo
- [x] public gh repo
- [x] make it look nicer
- [x] edit any field from edit page
- [x] add column to order machines by
- [x] auto update workout history onsubmit
- [ ] optionally only show current machine's history
- [x] delete workouts from db
- [x] download db
- [x] remake into single db
- [x] download db as csv
- [x] download json
- [x] !!!! collapse the edit page to also edit machines !!!! (or user!)
  - [x] column.key / column.visibility: readonly, hidden, editable
  - [x] items: \[dbobj...\]
  - [x] endpoint: str
  - [x] allow updates
  - [x] single updateDBItem
  - [ ] single deleteDBItem
  - [ ] single addDBItem?
- [ ] displayName for columns in UI
- [ ] upload db as csv (advanced)
- [ ] add tests
- [ ] start actually using it in the gym

## Rough UI

```
┌────────────────────────────────┐
│                                │
│                                │
│                                │
│        CurrentMachine          │
│           <select>             │
│                                │
│                                │
│  CurrentWeight     CurrentReps │
│     <input>          <input>   │
│                                │
│           <submit>             │
│                                │
│                                │
│       <historical data>        │
│                                │
│                                │
│                                │
│                                │
└────────────────────────────────┘
```
