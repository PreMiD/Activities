var __webpack_exports__ = {};
const presence = new Presence({
    clientId: "1260572178068406282",
}), browsingTimestamp = Math.floor(Date.now() / 1000);
let title, search;
presence.on("UpdateData", async () => {
    const presenceData = {
        largeImageKey: "https://cdn.kaneproductions.co.uk/art/PlanetXO/shortlogo.png",
    };
    let DocumentURL = document.URL;
    let real = DocumentURL.replace(/\/[^\/]*$/, "");
    if (document.location.hostname === "planetxo.uk") {
        presenceData.startTimestamp = browsingTimestamp;
        switch (real) {
            case "https://planetxo.uk": {
                presenceData.details = "Viewing the map";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/xoradio": {
                presenceData.details = "Viewing XO Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/planetxo": {
                presenceData.details = "Viewing the PlanetXO Global Panel";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/admin": {
                presenceData.details = "Viewing the PlanetXO System Administrator Panel";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/blastradio": {
                presenceData.details = "Viewing Blast Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/qtfm": {
                presenceData.details = "Viewing QTFM";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/lushradio": {
                presenceData.details = "Viewing Lush Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/everyradio": {
                presenceData.details = "Viewing Every Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel": {
                presenceData.details = "Viewing PlanetXO Panel";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/xoradio": {
                presenceData.details = "Viewing the Panel for XO Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/blastradio": {
                presenceData.details = "Viewing the Panel for Blast Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/qtfm": {
                presenceData.details = "Viewing the Panel for QTFM";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/lushradio": {
                presenceData.details = "Viewing the Panel for Lush Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/everyradio": {
                presenceData.details = "Viewing the Panel for Every Radio";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            case "https://planetxo.uk/panel/panel": {
                presenceData.details = "Viewing the Panel for PlanetXO Panel";
                presenceData.buttons = [
                    {
                        label: "Home",
                        url: "https://planetxo.uk",
                    },
                ];
                break;
            }
            default:
                if (document.location.hostname == "planetxo.uk") {
                    presenceData.details = "Viewing PlanetXO";
                    presenceData.buttons = [
                        {
                            label: "Home",
                            url: "https://planetxo.uk",
                        },
                    ];
                }
        }
    }
    if (document.location.hostname === "panel.planetxo.uk") {
        presenceData.details = "Viewing the Panel for PlanetXO";
        presenceData.startTimestamp = browsingTimestamp;
        presenceData.buttons = [
            {
                label: "Home",
                url: "https://planetxo.uk",
            },
        ];
    }
    if (presenceData.details) {
        presence.setActivity(presenceData);
    }
    else {
        presence.setActivity();
    }
    ;
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUM1QixRQUFRLEVBQUUscUJBQXFCO0NBQy9CLENBQUMsRUFDRixpQkFBaUIsR0FBRyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxHQUFHLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUVuRCxJQUFJLEtBQWtCLEVBQUUsTUFBd0IsQ0FBQztBQUVqRCxRQUFRLENBQUMsRUFBRSxDQUFDLFlBQVksRUFBRSxLQUFLLElBQUksRUFBRTtJQUNwQyxNQUFNLFlBQVksR0FBaUI7UUFDbEMsYUFBYSxFQUFFLDhEQUE4RDtLQUM3RSxDQUFDO0lBRUYsSUFBSSxXQUFXLEdBQUcsUUFBUSxDQUFDLEdBQUcsQ0FBQztJQUMvQixJQUFJLElBQUksR0FBRyxXQUFXLENBQUMsT0FBTyxDQUFDLFdBQVcsRUFBRSxFQUFFLENBQUMsQ0FBQztJQUNoRCxJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxLQUFLLGFBQWEsRUFBRTtRQUNqRCxZQUFZLENBQUMsY0FBYyxHQUFHLGlCQUFpQixDQUFDO1FBQ2hELFFBQVEsSUFBSSxFQUFFO1lBQ2IsS0FBSyxxQkFBcUIsQ0FBQyxDQUFDO2dCQUMzQixZQUFZLENBQUMsT0FBTyxHQUFHLGlCQUFpQixDQUFDO2dCQUN6QyxZQUFZLENBQUMsT0FBTyxHQUFHO29CQUN0Qjt3QkFDQyxLQUFLLEVBQUUsTUFBTTt3QkFDYixHQUFHLEVBQUUscUJBQXFCO3FCQUMxQjtpQkFDRCxDQUFDO2dCQUNGLE1BQU07YUFDTjtZQUNELEtBQUssNkJBQTZCLENBQUMsQ0FBQztnQkFDbkMsWUFBWSxDQUFDLE9BQU8sR0FBRyxrQkFBa0IsQ0FBQztnQkFDMUMsWUFBWSxDQUFDLE9BQU8sR0FBRztvQkFDdEI7d0JBQ0MsS0FBSyxFQUFFLE1B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

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxxQkFBcUI7QUFDckI7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EscUJBQXFCO0FBQ3JCO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHFCQUFxQjtBQUNyQjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLHlCQUF5QjtBQUN6QjtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsYUFBYTtBQUNiO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBLENBQUM7QUFDRCwyQ0FBMkMsdWhLIiwic291cmNlcyI6WyJ3ZWJwYWNrOi8vcHJlc2VuY2VzLy4vd2Vic2l0ZXMvUC9QbGFuZXRYTy9wcmVzZW5jZS50cyJdLCJzb3VyY2VzQ29udGVudCI6WyJjb25zdCBwcmVzZW5jZSA9IG5ldyBQcmVzZW5jZSh7XG4gICAgY2xpZW50SWQ6IFwiMTI2MDU3MjE3ODA2ODQwNjI4MlwiLFxufSksIGJyb3dzaW5nVGltZXN0YW1wID0gTWF0aC5mbG9vcihEYXRlLm5vdygpIC8gMTAwMCk7XG5sZXQgdGl0bGUsIHNlYXJjaDtcbnByZXNlbmNlLm9uKFwiVXBkYXRlRGF0YVwiLCBhc3luYyAoKSA9PiB7XG4gICAgY29uc3QgcHJlc2VuY2VEYXRhID0ge1xuICAgICAgICBsYXJnZUltYWdlS2V5OiBcImh0dHBzOi8vY2RuLmthbmVwcm9kdWN0aW9ucy5jby51ay9hcnQvUGxhbmV0WE8vc2hvcnRsb2dvLnBuZ1wiLFxuICAgIH07XG4gICAgbGV0IERvY3VtZW50VVJMID0gZG9jdW1lbnQuVVJMO1xuICAgIGxldCByZWFsID0gRG9jdW1lbnRVUkwucmVwbGFjZSgvXFwvW15cXC9dKiQvLCBcIlwiKTtcbiAgICBpZiAoZG9jdW1lbnQubG9jYXRpb24uaG9zdG5hbWUgPT09IFwicGxhbmV0eG8udWtcIikge1xuICAgICAgICBwcmVzZW5jZURhdGEuc3RhcnRUaW1lc3RhbXAgPSBicm93c2luZ1RpbWVzdGFtcDtcbiAgICAgICAgc3dpdGNoIChyZWFsKSB7XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgdGhlIG1hcFwiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay94b3JhZGlvXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBYTyBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbC9wbGFuZXR4b1wiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgdGhlIFBsYW5ldFhPIEdsb2JhbCBQYW5lbFwiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbC9hZG1pblwiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgdGhlIFBsYW5ldFhPIFN5c3RlYW0gQWRtaW5pc3RyYXRvciBQYW5lbFwiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9ibGFzdHJhZGlvXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBCbGFzdCBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9xdGZtXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBRVEZNXCI7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmJ1dHRvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3BsYW5ldHhvLnVrXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJodHRwczovL3BsYW5ldHhvLnVrL2x1c2hyYWRpb1wiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgTHVzaCBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9ldmVyeXJhZGlvXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBFdmVyeSBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbFwiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgUGxhbmV0WE8gUGFuZWxcIjtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuYnV0dG9ucyA9IFtcbiAgICAgICAgICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgICAgICAgICAgbGFiZWw6IFwiSG9tZVwiLFxuICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vcGxhbmV0eG8udWtcIixcbiAgICAgICAgICAgICAgICAgICAgfSxcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY2FzZSBcImh0dHBzOi8vcGxhbmV0eG8udWsvcGFuZWwveG9yYWRpb1wiOiB7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgdGhlIFBhbmVsIGZvciBYTyBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbC9ibGFzdHJhZGlvXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyB0aGUgUGFuZWwgZm9yIEJsYXN0IFJhZGlvXCI7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmJ1dHRvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3BsYW5ldHhvLnVrXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJodHRwczovL3BsYW5ldHhvLnVrL3BhbmVsL3F0Zm1cIjoge1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5kZXRhaWxzID0gXCJWaWV3aW5nIHRoZSBQYW5lbCBmb3IgUVRGTVwiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbC9sdXNocmFkaW9cIjoge1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5kZXRhaWxzID0gXCJWaWV3aW5nIHRoZSBQYW5lbCBmb3IgTHVzaCBSYWRpb1wiO1xuICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBjYXNlIFwiaHR0cHM6Ly9wbGFuZXR4by51ay9wYW5lbC9ldmVyeXJhZGlvXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyB0aGUgUGFuZWwgZm9yIEV2ZXJ5IFJhZGlvXCI7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmJ1dHRvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3BsYW5ldHhvLnVrXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGNhc2UgXCJodHRwczovL3BsYW5ldHhvLnVrL3BhbmVsL3BhbmVsXCI6IHtcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyB0aGUgUGFuZWwgZm9yIFBsYW5ldFhPIFBhbmVsXCI7XG4gICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmJ1dHRvbnMgPSBbXG4gICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIHVybDogXCJodHRwczovL3BsYW5ldHhvLnVrXCIsXG4gICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgXTtcbiAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgaWYgKGRvY3VtZW50LmxvY2F0aW9uLmhvc3RuYW1lID09IFwicGxhbmV0eG8udWtcIikge1xuICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBQbGFuZXRYT1wiO1xuICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuYnV0dG9ucyA9IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBsYWJlbDogXCJIb21lXCIsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdXJsOiBcImh0dHBzOi8vcGxhbmV0eG8udWtcIixcbiAgICAgICAgICAgICAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAgICAgICAgIF07XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuICAgIGlmIChkb2N1bWVudC5sb2NhdGlvbi5ob3N0bmFtZSA9PT0gXCJwYW5lbC5wbGFuZXR4by51a1wiKSB7XG4gICAgICAgIHByZXNlbmNlRGF0YS5kZXRhaWxzID0gXCJWaWV3aW5nIHRoZSBQYW5lbCBmb3IgUGxhbmV0WE9cIjtcbiAgICAgICAgcHJlc2VuY2VEYXRhLnN0YXJ0VGltZXN0YW1wID0gYnJvd3NpbmdUaW1lc3RhbXA7XG4gICAgICAgIHByZXNlbmNlRGF0YS5idXR0b25zID0gW1xuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIGxhYmVsOiBcIkhvbWVcIixcbiAgICAgICAgICAgICAgICB1cmw6IFwiaHR0cHM6Ly9wbGFuZXR4by51a1wiLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgXTtcbiAgICB9XG4gICAgaWYgKHByZXNlbmNlRGF0YS5kZXRhaWxzKSB7XG4gICAgICAgIHByZXNlbmNlLnNldEFjdGl2aXR5KHByZXNlbmNlRGF0YSk7XG4gICAgfVxuICAgIGVsc2Uge1xuICAgICAgICBwcmVzZW5jZS5zZXRBY3Rpdml0eSgpO1xuICAgIH1cbiAgICA7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNISmxjMlZ1WTJVdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk5d2NtVnpaVzVqWlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hOUVVGTkxGRkJRVkVzUjBGQlJ5eEpRVUZKTEZGQlFWRXNRMEZCUXp0SlFVTTFRaXhSUVVGUkxFVkJRVVVzY1VKQlFYRkNPME5CUXk5Q0xFTkJRVU1zUlVGRFJpeHBRa0ZCYVVJc1IwRkJSeXhKUVVGSkxFTkJRVU1zUzBGQlN5eERRVUZETEVsQlFVa3NRMEZCUXl4SFFVRkhMRVZCUVVVc1IwRkJSeXhKUVVGSkxFTkJRVU1zUTBGQlF6dEJRVVZ1UkN4SlFVRkpMRXRCUVd0Q0xFVkJRVVVzVFVGQmQwSXNRMEZCUXp0QlFVVnFSQ3hSUVVGUkxFTkJRVU1zUlVGQlJTeERRVUZETEZsQlFWa3NSVUZCUlN4TFFVRkxMRWxCUVVrc1JVRkJSVHRKUVVOd1F5eE5RVUZOTEZsQlFWa3NSMEZCYVVJN1VVRkRiRU1zWVVGQllTeEZRVUZGTERoRVFVRTRSRHRMUVVNM1JTeERRVUZETzBsQlJVWXNTVUZCU1N4WFFVRlhMRWRCUVVjc1VVRkJVU3hEUVVGRExFZEJRVWNzUTBGQlF6dEpRVU12UWl4SlFVRkpMRWxCUVVrc1IwRkJSeXhYUVVGWExFTkJRVU1zVDBGQlR5eERRVUZETEZkQlFWY3NSVUZCUlN4RlFVRkZMRU5CUVVNc1EwRkJRenRKUVVOb1JDeEpRVUZKTEZGQlFWRXNRMEZCUXl4UlFVRlJMRU5CUVVNc1VVRkJVU3hMUVVGTExHRkJRV0VzUlVGQlJUdFJRVU5xUkN4WlFVRlpMRU5CUVVNc1kwRkJZeXhIUVVGSExHbENRVUZwUWl4RFFVRkRPMUZCUTJoRUxGRkJRVkVzU1VGQlNTeEZRVUZGTzFsQlEySXNTMEZCU3l4eFFrRkJjVUlzUTBGQlF5eERRVUZETzJkQ1FVTXpRaXhaUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITEdsQ1FVRnBRaXhEUVVGRE8yZENRVU42UXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhIUVVGSE8yOUNRVU4wUWp0M1FrRkRReXhMUVVGTExFVkJRVVVzVFVGQlRUdDNRa0ZEWWl4SFFVRkhMRVZCUVVVc2NVSkJRWEZDTzNGQ1FVTXhRanRwUWtGRFJDeERRVUZETzJkQ1FVTkdMRTFCUVUwN1lVRkRUanRaUVVORUxFdEJRVXNzTmtKQlFUWkNMRU5CUVVNc1EwRkJRenRuUWtGRGJrTXNXVUZCV1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhyUWtGQmEwSXNRMEZCUXp0blFrRkRNVU1zV1VGQldTeERRVUZETEU5QlFVOHNSMEZCUnp0dlFrRkRkRUk3ZDBKQlEwTXNTMEZCU3l4RlFVRkZMRTFCUVUwN2QwSkJRMklzUjBGQlJ5eEZRVUZGTEhGQ1FVRnhRanR4UWtGRE1VSTdhVUpCUTBRc1EwRkJRenRuUWtGRFJpeE5RVUZOTzJGQlEwNDdXVUZEUkN4TFFVRkxMRzlEUVVGdlF5eERRVUZETEVOQlFVTTdaMEpCUXpGRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVY3NiVU5CUVcxRExFTkJRVU03WjBKQlF6TkVMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWM3YjBKQlEzUkNPM2RDUVVORExFdEJRVXNzUlVGQlJTeE5RVUZOTzNkQ1FVTmlMRWRCUVVjc1JVRkJSU3h4UWtGQmNVSTdjVUpCUXpGQ08ybENRVU5FTEVOQlFVTTdaMEpCUTBZc1RVRkJUVHRoUVVOT08xbEJRMFFzUzBGQlN5eHBRMEZCYVVNc1EwRkJReXhEUVVGRE8yZENRVU4yUXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhIUVVGSExHdEVRVUZyUkN4RFFVRkRPMmRDUVVNeFJTeFpRVUZaTEVOQlFVTXNUMEZCVHl4SFFVRkhPMjlDUVVOMFFqdDNRa0ZEUXl4TFFVRkxMRVZCUVVVc1RVRkJUVHQzUWtGRFlpeEhRVUZITEVWQlFVVXNjVUpCUVhGQ08zRkNRVU14UWp0cFFrRkRSQ3hEUVVGRE8yZENRVU5HTEUxQlFVMDdZVUZEVGp0WlFVTkVMRXRCUVVzc1owTkJRV2RETEVOQlFVTXNRMEZCUXp0blFrRkRkRU1zV1VGQldTeERRVUZETEU5QlFVOHNSMEZCUnl4eFFrRkJjVUlzUTBGQlF6dG5Ra0ZETjBNc1dVRkJXU3hEUVVGRExFOUJRVThzUjBGQlJ6dHZRa0ZEZEVJN2QwSkJRME1zUzBGQlN5eEZRVUZGTEUxQlFVMDdkMEpCUTJJc1IwRkJSeXhGUVVGRkxIRkNRVUZ4UWp0eFFrRkRNVUk3YVVKQlEwUXNRMEZCUXp0blFrRkRSaXhOUVVGTk8yRkJRMDQ3V1VGRFJDeExRVUZMTERCQ1FVRXdRaXhEUVVGRExFTkJRVU03WjBKQlEyaERMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWNzWTBGQll5eERRVUZETzJkQ1FVTjBReXhaUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITzI5Q1FVTjBRanQzUWtGRFF5eExRVUZMTEVWQlFVVXNUVUZCVFR0M1FrRkRZaXhIUVVGSExFVkJRVVVzY1VKQlFYRkNPM0ZDUVVNeFFqdHBRa0ZEUkN4RFFVRkRPMmRDUVVOR0xFMUJRVTA3WVVGRFRqdFpRVU5FTEV0QlFVc3NLMEpCUVN0Q0xFTkJRVU1zUTBGQlF6dG5Ra0ZEY2tNc1dVRkJXU3hEUVVGRExFOUJRVThzUjBGQlJ5eHZRa0ZCYjBJc1EwRkJRenRuUWtGRE5VTXNXVUZCV1N4RFFVRkRMRTlCUVU4c1IwRkJSenR2UWtGRGRFSTdkMEpCUTBNc1MwRkJTeXhGUVVGRkxFMUJRVTA3ZDBKQlEySXNSMEZCUnl4RlFVRkZMSEZDUVVGeFFqdHhRa0ZETVVJN2FVSkJRMFFzUTBGQlF6dG5Ra0ZEUml4TlFVRk5PMkZCUTA0N1dVRkRSQ3hMUVVGTExHZERRVUZuUXl4RFFVRkRMRU5CUVVNN1owSkJRM1JETEZsQlFWa3NRMEZCUXl4UFFVRlBMRWRCUVVjc2NVSkJRWEZDTEVOQlFVTTdaMEpCUXpkRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVYzdiMEpCUTNSQ08zZENRVU5ETEV0QlFVc3NSVUZCUlN4TlFVRk5PM2RDUVVOaUxFZEJRVWNzUlVGQlJTeHhRa0ZCY1VJN2NVSkJRekZDTzJsQ1FVTkVMRU5CUVVNN1owSkJRMFlzVFVGQlRUdGhRVU5PTzFsQlEwUXNTMEZCU3l3eVFrRkJNa0lzUTBGQlF5eERRVUZETzJkQ1FVTnFReXhaUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITEhkQ1FVRjNRaXhEUVVGRE8yZENRVU5vUkN4WlFVRlpMRU5CUVVNc1QwRkJUeXhIUVVGSE8yOUNRVU4wUWp0M1FrRkRReXhMUVVGTExFVkJRVVVzVFVGQlRUdDNRa0ZEWWl4SFFVRkhMRVZCUVVVc2NVSkJRWEZDTzNGQ1FVTXhRanRwUWtGRFJDeERRVUZETzJkQ1FVTkdMRTFCUVUwN1lVRkRUanRaUVVORUxFdEJRVXNzYlVOQlFXMURMRU5CUVVNc1EwRkJRenRuUWtGRGVrTXNXVUZCV1N4RFFVRkRMRTlCUVU4c1IwRkJSeXhuUTBGQlowTXNRMEZCUXp0blFrRkRlRVFzV1VGQldTeERRVUZETEU5QlFVOHNSMEZCUnp0dlFrRkRkRUk3ZDBKQlEwTXNTMEZCU3l4RlFVRkZMRTFCUVUwN2QwSkJRMklzUjBGQlJ5eEZRVUZGTEhGQ1FVRnhRanR4UWtGRE1VSTdhVUpCUTBRc1EwRkJRenRuUWtGRFJpeE5RVUZOTzJGQlEwNDdXVUZEUkN4TFFVRkxMSE5EUVVGelF5eERRVUZETEVOQlFVTTdaMEpCUXpWRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVY3NiVU5CUVcxRExFTkJRVU03WjBKQlF6TkVMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWM3YjBKQlEzUkNPM2RDUVVORExFdEJRVXNzUlVGQlJTeE5RVUZOTzNkQ1FVTmlMRWRCUVVjc1JVRkJSU3h4UWtGQmNVSTdjVUpCUXpGQ08ybENRVU5FTEVOQlFVTTdaMEpCUTBZc1RVRkJUVHRoUVVOT08xbEJRMFFzUzBGQlN5eG5RMEZCWjBNc1EwRkJReXhEUVVGRE8yZENRVU4wUXl4WlFVRlpMRU5CUVVNc1QwRkJUeXhIUVVGSExEUkNRVUUwUWl4RFFVRkRPMmRDUVVOd1JDeFpRVUZaTEVOQlFVTXNUMEZCVHl4SFFVRkhPMjlDUVVOMFFqdDNRa0ZEUXl4TFFVRkxMRVZCUVVVc1RVRkJUVHQzUWtGRFlpeEhRVUZITEVWQlFVVXNjVUpCUVhGQ08zRkNRVU14UWp0cFFrRkRSQ3hEUVVGRE8yZENRVU5HTEUxQlFVMDdZVUZEVGp0WlFVTkVMRXRCUVVzc2NVTkJRWEZETEVOQlFVTXNRMEZCUXp0blFrRkRNME1zV1VGQldTeERRVUZETEU5QlFVOHNSMEZCUnl4clEwRkJhME1zUTBGQlF6dG5Ra0ZETVVRc1dVRkJXU3hEUVVGRExFOUJRVThzUjBGQlJ6dHZRa0ZEZEVJN2QwSkJRME1zUzBGQlN5eEZRVUZGTEUxQlFVMDdkMEpCUTJJc1IwRkJSeXhGUVVGRkxIRkNRVUZ4UWp0eFFrRkRNVUk3YVVKQlEwUXNRMEZCUXp0blFrRkRSaXhOUVVGTk8yRkJRMDQ3V1VGRFJDeExRVUZMTEhORFFVRnpReXhEUVVGRExFTkJRVU03WjBKQlF6VkRMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWNzYlVOQlFXMURMRU5CUVVNN1owSkJRek5FTEZsQlFWa3NRMEZCUXl4UFFVRlBMRWRCUVVjN2IwSkJRM1JDTzNkQ1FVTkRMRXRCUVVzc1JVRkJSU3hOUVVGTk8zZENRVU5pTEVkQlFVY3NSVUZCUlN4eFFrRkJjVUk3Y1VKQlF6RkNPMmxDUVVORUxFTkJRVU03WjBKQlEwWXNUVUZCVFR0aFFVTk9PMWxCUTBRc1MwRkJTeXhwUTBGQmFVTXNRMEZCUXl4RFFVRkRPMmRDUVVOMlF5eFpRVUZaTEVOQlFVTXNUMEZCVHl4SFFVRkhMSE5EUVVGelF5eERRVUZETzJkQ1FVTTVSQ3haUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITzI5Q1FVTjBRanQzUWtGRFF5eExRVUZMTEVWQlFVVXNUVUZCVFR0M1FrRkRZaXhIUVVGSExFVkJRVVVzY1VKQlFYRkNPM0ZDUVVNeFFqdHBRa0ZEUkN4RFFVRkRPMmRDUVVOR0xFMUJRVTA3WVVGRFRqdFpRVU5FTzJkQ1FVTkRMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVsQlFVa3NZVUZCWVN4RlFVRkZPMjlDUVVOb1JDeFpRVUZaTEVOQlFVTXNUMEZCVHl4SFFVRkhMR3RDUVVGclFpeERRVUZETzI5Q1FVTXhReXhaUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITzNkQ1FVTjBRanMwUWtGRFF5eExRVUZMTEVWQlFVVXNUVUZCVFRzMFFrRkRZaXhIUVVGSExFVkJRVVVzY1VKQlFYRkNPM2xDUVVNeFFqdHhRa0ZEUkN4RFFVRkRPMmxDUVVOR08xTkJRMFk3UzBGRFJEdEpRVU5FTEVsQlFVa3NVVUZCVVN4RFFVRkRMRkZCUVZFc1EwRkJReXhSUVVGUkxFdEJRVXNzYlVKQlFXMUNMRVZCUVVVN1VVRkRka1FzV1VGQldTeERRVUZETEU5QlFVOHNSMEZCUnl4blEwRkJaME1zUTBGQlF6dFJRVU40UkN4WlFVRlpMRU5CUVVNc1kwRkJZeXhIUVVGSExHbENRVUZwUWl4RFFVRkRPMUZCUTJoRUxGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVYzdXVUZEZEVJN1owSkJRME1zUzBGQlN5eEZRVUZGTEUxQlFVMDdaMEpCUTJJc1IwRkJSeXhGUVVGRkxIRkNRVUZ4UWp0aFFVTXhRanRUUVVORUxFTkJRVU03UzBGRFJqdEpRVU5FTEVsQlFVa3NXVUZCV1N4RFFVRkRMRTlCUVU4c1JVRkJSVHRSUVVGRExGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1MwRkRPVVE3VTBGQlNUdFJRVUZETEZGQlFWRXNRMEZCUXl4WFFVRlhMRVZCUVVVc1EwRkJRenRMUVVGRE8wbEJRVUVzUTBGQlF6dEJRVU12UWl4RFFVRkRMRU5CUVVNc1EwRkJReUo5Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
