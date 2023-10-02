# goal: track my workouts from my phone in the gym

## Website is live at

https://tracker.kevbot.xyz

## How to run this project

- `cp .env-example .env`
- `npm install`
- `npm run init-db`
- `npm run dev`

To run in production remove the `NO_AUTH` env var and set up your own `auth0Config` in `src/index.js`

## Definitions

- Machine: what exercise/activity you are doing (eg: bicep curl, lat pulldown, pushup?)
- Workout: a single lift on a given machine (eg: bicep curl, 40 pounds, 10 reps)

## things to have

- [x] big buttons easy to press on phone
- [x] push data to sqlite ~or google sheet~
- [x] submit a workout
- [x] add new machines in ui
- [x] remove machines
- [x] add a NO_AUTH env var
- [x] display historical data
  - [x] display per-machine
- [x] support multiple users
- [x] support decimal parts for all numeric fields
- [x] use templating engine
- [x] support migrations
- [ ] undo last submit
- [x] undo any submit
- [x] add kevbadge
- [x] add to projects.json
- [x] private gh repo
- [x] public gh repo
- [x] make it look nicer
- [x] edit any field from edit page !!!! (I broke the machine editing page)
- [ ] improve look of edit machine page
- [ ] explain why can't delete machine when workouts still present
- [x] add column to order machines by
- [x] auto update workout history onsubmit
- [x] always only show current machine's history
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
- [ ] upload db as csv (advanced)
- [ ] add tests
- [x] machine_id foreign key in workouts
- [ ] weight units in db (as text on machines)
- [ ] distance units (as text on machines)
- [ ] fix "machine" language on display
- [x] show machine_name properly throughout
- [ ] start actually using it in the gym
- [x] select machine in main page
- [x] add machine bring back!!!
- [x] filter to relevant columns in history table
- [x] navbar

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

## Learnings

- I should try to use drizzle next time
- CRUD is always(?) annoying
- sqlite works nicely
