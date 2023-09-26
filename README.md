# goal: track my workouts from my phone in the gym

## Definitions

- Machine: a workout (eg: bicep curl, lat pulldown)
- Workout: a single lift on a given machine (eg: bicep curl, 40 pounds, 10 reps)

## things to have

- [ ] big buttons easy to press on phone
- [x] push data to sqlite ~or google sheet~
- [x] submit a workout
- [ ] add new machines in ui
- [ ] display historical data

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
