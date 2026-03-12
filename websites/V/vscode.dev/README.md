# Activity Parameters for Customisation

The exact parameter must be included for `details` or `state`. For example, to display the current file name the input should be `%file%`, including the `%`

| Parameter |                       Description                       |    Example    |
| :-------: | :-----------------------------------------------------: | :-----------: |
|   file    |           will display the current file name.           |  presence.ts  |
|  branch   | will display the current branch name. (remote URL only) |     main      |
|   error   |    will display the error current workspace folder.     |       0       |
| problems  |   will display the problems current workspace folder.   |       0       |
| workspace |        will display the current workspace name.         |  Activities   |
|   lang    |         will display the language current file.         |  typescript   |
| encoding  |               will display the encoding.                |     UTF-8     |
| selection |             will display the current line.              | Ln 20, Col 20 |

If not found, it will be replaced an empty space.
