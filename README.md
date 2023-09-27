# goal: track my workouts from my phone in the gym

## Definitions

- Machine: a workout (eg: bicep curl, lat pulldown)
- Workout: a single lift on a given machine (eg: bicep curl, 40 pounds, 10 reps)

## things to have

- [x] big buttons easy to press on phone
- [x] push data to sqlite ~or google sheet~
- [x] submit a workout
- [x] add new machines in ui
- [ ] display historical data
- [x] support multiple users
- [ ] support decimal parts for weight
- [ ] undo last submit
- [ ] make it look nicer
- [ ] undo any submit
- [x] download db

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
