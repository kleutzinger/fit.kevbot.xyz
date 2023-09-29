# goal: track my workouts from my phone in the gym

## Definitions

- Machine: a workout (eg: bicep curl, lat pulldown)
- Workout: a single lift on a given machine (eg: bicep curl, 40 pounds, 10 reps)

## things to have

- [x] big buttons easy to press on phone
- [x] push data to sqlite ~or google sheet~
- [x] submit a workout
- [x] add new machines in ui
- [ ] remove machines
- [x] display historical data
  - [ ] display per-machine
- [x] support multiple users
- [ ] support decimal parts for weight
- [ ] undo last submit
- [ ] undo any submit
- [x] make it look nicer
- [ ] edit any field from admin
- [ ] delete rows from db
- [x] download db
- [x] remake into single db
- [x] download db as csv
- [ ] upload db as csv (advanced)
- [ ] add tests

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
