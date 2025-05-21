# Calendar Page with React Big Calendar

This page implements a calendar view using React Big Calendar to display events with titles and images.

## Installation Instructions

To add the calendar functionality to your project, you need to install the following dependencies:

```bash
npm install react-big-calendar date-fns
```

or if you're using yarn:

```bash
yarn add react-big-calendar date-fns
```

or with pnpm:

```bash
pnpm add react-big-calendar date-fns
```

## Usage

The calendar is already set up to display events with images and titles. To connect it to your actual data:

1. Replace the sample events with your API call in the `useEffect` hook
2. Make sure your data follows the `CalendarEvent` interface:
   ```typescript
   interface CalendarEvent {
     title: string;
     imageUrl: string;
     start: Date;
     end: Date;
   }
   ```
3. If your API returns dates as strings, convert them to Date objects:
   ```javascript
   const eventsFromApi = apiData.map(item => ({
     title: item.title,
     imageUrl: item.imageUrl,
     start: new Date(item.date),
     end: new Date(item.date),
   }));
   setEvents(eventsFromApi);
   ```

## Customization

You can customize the calendar by:

- Changing the `eventPropGetter` function to style events differently
- Modifying the `Event` component to change how events are displayed
- Adding event handlers like `onSelectEvent` to handle clicks on events
- Changing the default view with the `defaultView` prop

## Additional Features

To add more features to the calendar:

- Event creation: Add a form to create new events
- Event editing: Handle clicks on events to edit them
- Calendar navigation: Add buttons to navigate between months/weeks
- Filtering: Add filters to show specific types of events 