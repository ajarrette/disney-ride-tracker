# Disney Ride Tracker

Keep a little more of the magic from every park day. Disney Ride Tracker brings attraction details, wait time information, and a personal ride diary together in one iOS app for Walt Disney World.

> **Explore the parks. Keep your ride story.**  
> Built for park days, revisited long after the fireworks.

## Overview

Browse attractions across Magic Kingdom, EPCOT, Disney's Hollywood Studios, and Disney's Animal Kingdom. Check current ride information, organize a personal list for the day, and save each experience to a diary with the details and memories you want to keep.

## Features

- **Explore all four parks** with attraction details, operating information, height requirements, accessibility notes, and current wait time details.
- **See wait time trends** with historical context and forecasts based on available ride history.
- **Make the ride list yours** by pinning, reordering, favoriting, or hiding attractions.
- **Log every ride** with its date and time, a manual wait time or running wait timer, a rating, notes, and Lightning Lane use.
- **Add photos and video** to ride entries and group visits into trips.
- **Revisit your ride diary** by date or trip, with summaries for rides, wait time, ratings, most-ridden attractions, Lightning Lane use, and parks explored.
- **Sign in with an email code** to keep your personal diary and preferences associated with your account.

## Screenshots

<!-- markdownlint-disable MD010 MD033 -->
<table width="100%">
 <tr>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/01%20-%20Home.png" width="100%" alt="Park ride list"><br>Park ride list</td>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/03%20-%20Ride%20Details%201.png" width="100%" alt="Ride details"><br>Ride details</td>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/03%20-%20Ride%20Details%202.png" width="100%" alt="Extended ride details"><br>Extended ride details</td>
 </tr>
 <tr>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/03a%20-%20Search%20for%20Ride.png" width="100%" alt="Find a ride"><br>Find a ride</td>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/03b%20-%20Log%20Ride.png" width="100%" alt="Log a ride"><br>Log a ride</td>
   <td align="center" width="33.33%"><img src="assets/images/screen-shots/04%20-%20Diary%20Summary.png" width="100%" alt="Diary summary"><br>Diary summary</td>
 </tr>
 <tr>
      <td align="center" width="33.33%"><img src="assets/images/screen-shots/04b%20-%20Diary%20List.png" width="100%" alt="Diary entries"><br>Diary entries</td>
      <td align="center" width="33.33%"><img src="assets/images/screen-shots/05%20-%20Diary%20Entry.png" width="100%" alt="A saved memory"><br>A saved memory</td>
      <td align="center" width="33.33%"><img src="assets/images/screen-shots/06%20-%20Ordered%20Pinned%20Lists.png" width="100%" alt="Pinned ride order"><br>Ordered pinned lists</td>
 </tr>
</table>
<!-- markdownlint-enable MD010 MD033 -->

## Technology Stack

- [Expo SDK 57](https://docs.expo.dev/versions/v57.0.0/) and [React Native 0.86](https://reactnative.dev/)
- React 19 and TypeScript 6
- [Expo Router](https://docs.expo.dev/router/introduction/) for file-based navigation
- [Supabase](https://supabase.com/) for email authentication, ride data, and personal ride records
- Expo SQLite key-value storage for local ride-catalog caching
- [ThemeParks.wiki](https://themeparks.wiki/) for park operating and wait time data

## Getting Started

### Requirements

- Node.js and npm
- macOS with Xcode for running the iOS app in the simulator or on a device
- A Supabase project configured with the migrations in `supabase/migrations`

### Install and configure

```bash
npm install
```

Add your Supabase project URL and anon key to a local `.env.local` file in the project root:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Apply the project migrations and enable email OTP sign-in in Supabase. Do not put a Supabase service-role key in the app's public environment variables.

### Run on iOS

```bash
npx expo start
```

Press `i` to open the iOS Simulator, or run the native iOS target directly:

```bash
npm run ios
```

## Project Commands

| Command            | Description                       |
| ------------------ | --------------------------------- |
| `npm run start`    | Start the Expo development server |
| `npm run ios`      | Build and run the iOS app         |
| `npm run lint`     | Run Expo's ESLint checks          |
| `npx tsc --noEmit` | Check TypeScript types            |

## Data and Affiliation

Ride availability, wait times, and operating information can change and depend on third-party data availability. Disney Ride Tracker is an independent fan project and is not affiliated with, endorsed by, or sponsored by The Walt Disney Company or its subsidiaries. Disney parks, attraction names, and related marks belong to their respective owners.
