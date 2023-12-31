# goal: track my workouts from my phone in the gym

## Website is live at

https://fit.kevbot.xyz

![example image of ui](./public/ui-example.png)

## How to run this project

Dev mode:

- `cp .env-example .env`
- `npm install`
- `npm run init-db`
- `npm run dev`

Production

- set up env vars...
- `npm install`
- `npm run init-db`
- `npm run build`
- `npm run start`

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
- Machine Editing
  - [ ] add units
    - https://www.npmjs.com/package/convert-units
    - [ ] weight units in db (as text on machines)
    - [ ] distance units (as text on machines)
    - [ ] make zod enums
- [ ] fix "machine" language on display
- [x] show machine_name properly throughout
- [x] start actually using it in the gym
- [x] select machine in main page
- [x] add machine bring back!!!
- [x] filter to relevant columns in history table
- [x] navbar
- [x] make it more single-pagey
- [x] alphabetical sort on machine selection
  - [ ] non-alphabetical sort on machines
- [x] https://htmx.org/extensions/response-targets/
- refactor workout template
  - [x] make a single full-workout-form endpoint
  - [x] table and table.limit as params
  - [x] it gets you a table and a form
  - [x] highlight the entry in the table that we are editing
  - [x] maybe I also want a way to get just the talbe?
  - [x] re-work the workout-submit-and-table partial?. basically, instead of a partial, just make an endpoint?
- [x] save workout sequences to the db (TEXT machine_id_list "12,34,53")
- [x] new table sequences (workout sequences)
- [ ] fix auth0 using dev keys
- [ ] make homepage 1 (or 2) db / network queries
- [x] fix /signup page!
- [x] toast messages (error handling)
- [ ] after submitting, it's hard to tell what machine you just submitted. think about making either it snap to last submitted or lock to one machine at a time and press left/right arrows to go next

## Graphs

- [x] add alpinejs for some stuff
- [ ] actually use alpinejs
- [x] machine.column to display

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
│                                 │
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

https://htmx.org/docs/#request-operations
