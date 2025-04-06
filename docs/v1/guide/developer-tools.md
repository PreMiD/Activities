# Developer Tools

PreMiD includes powerful developer tools that integrate with Chrome's DevTools panel, making it easier to debug and develop activities.

## Prerequisites

Before you can use the PreMiD Developer Tools, you need to enable Activity Developer Mode in the extension:

1. Open the PreMiD extension by clicking on its icon in your browser's toolbar
2. Go to the Settings tab
3. Scroll down to the "Developer" section
4. Enable the "Activity Developer Mode" toggle

## Accessing the Developer Tools

Once Activity Developer Mode is enabled, you can access the PreMiD Developer Tools:

1. Open Chrome DevTools by pressing `F12` or right-clicking on a page and selecting "Inspect"
2. Look for the "PreMiD" tab in the DevTools panel
   - If you don't see it, click on the `>>` overflow menu and select "PreMiD"

![PreMiD DevTools Panel](https://placehold.co/800x500)

## Features

The PreMiD Developer Tools provide essential features to help you develop and debug your activities:

### Shown Activity

The "Shown Activity" section displays the current activity data being sent to Discord, including:

- The current `PresenceData` being sent to Discord
- Details and state information
- Timestamps and their formatted display values
- Button information
- Activity type and status

![Shown Activity Section](https://placehold.co/800x400?text=Shown+Activity+Section)

This is useful for verifying that your activity is generating the correct data and seeing exactly what will be displayed in Discord.

### Function Callstack

The "Function Callstack" section shows a log of function calls and events from your activity, including:

- PreMiD-specific events and function calls
- Data being passed between components
- Timestamps for each event

![Function Callstack Section](https://placehold.co/800x400?text=Function+Callstack+Section)

This log helps you understand the flow of data and the sequence of events in your activity, making it easier to debug issues.

### Log Controls

The Developer Tools include controls for managing the log display:

- Pause/Resume: Stop or start the logging of new events
- Search: Filter logs using regular expressions
- Log Limit: Control how many logs to keep in memory

![Log Controls](https://placehold.co/800x400?text=Log+Controls)

These controls help you focus on specific events and manage the amount of information displayed.

## Using the Developer Tools

### Debugging Presence Data

To debug issues with your activity's presence data:

1. Open the PreMiD DevTools panel
2. Look at the "Shown Activity" section
3. Check if the presence data matches what you expect
4. If not, examine the Function Callstack to see what's happening
5. Make changes to your activity code
6. Refresh the page or wait for the automatic reload

### Filtering Logs

To focus on specific events or function calls:

1. Use the search input at the bottom of the panel
2. Enter a regular expression to filter the logs
3. Only logs matching the pattern will be displayed

For example, entering `UpdateData` will show only logs related to the UpdateData event.

### Managing Log Volume

If you're getting too many logs:

1. Use the pause button to temporarily stop new logs from appearing
2. Adjust the log limit to control how many logs are kept in memory
3. Use the search filter to focus on relevant logs

This is particularly useful when debugging activities on websites with a lot of activity.

## Tips and Tricks

### Identifying Common Issues

The Developer Tools can help you identify common issues with your activity:

1. **Missing presence data**: If the Shown Activity section is empty, your activity might not be setting any presence data.
2. **Incorrect timestamps**: Check the formatted timestamps to ensure they're displaying as expected.
3. **Event timing issues**: Look at the timestamps in the Function Callstack to identify potential timing problems.

### Using Browser Console with DevTools

For more advanced debugging, you can use the browser's built-in console alongside the PreMiD DevTools:

1. Open the browser's console (usually in the "Console" tab of DevTools)
2. Look for messages with the "[PreMiD]" prefix
3. Use these messages to identify issues that might not appear in the PreMiD DevTools panel

This combination gives you a more complete picture of what's happening with your activity.

## Best Practices

When using the Developer Tools:

1. **Keep the DevTools open** while developing to catch errors in real-time
2. **Use console.log sparingly** in production code, but freely during development
3. **Check the Network Monitor** when troubleshooting connection issues
4. **Profile performance** for activities that handle complex websites or media
5. **Test with different settings** to ensure your activity works in all configurations

## Next Steps

Now that you're familiar with the Developer Tools, you can:

- Learn about [Best Practices](/v1/guide/best-practices) for creating high-quality activities
- Explore [Advanced Topics](/v1/guide/slideshows) like slideshows and iframes
- Understand how to [Publish Your Activity](/v1/guide/best-practices) to the PreMiD store
