var __webpack_exports__ = {};
const presence = new Presence({
    clientId: "1338891034310213683"
});
presence.on("UpdateData", async () => {
    const presenceData = {
        largeImageKey: "https://81dojo.com/dojo/images/avatars/study_black.jpg"
    };
    switch (document.location.hostname) {
        case "81dojo.com":
            if (document.location.pathname == "/")
                presenceData.details = "Viewing home page";
            else if (document.location.pathname.includes("/client/")) {
                if (parseFloat(document.getElementById("layerLogin").style.opacity) > 0)
                    presenceData.details = "Logging in to client";
                else {
                    let server = document.getElementById("header-serverName").innerText.slice(0, -3);
                    let username = document.getElementById("header-playerName").innerText.slice(0, -3);
                    if (document.getElementById("layerLobby").style.display == "block")
                        presenceData.details = "In " + server + " lobby";
                    else {
                        let playerElements = document.querySelectorAll("[id='player-info-name']");
                        let playerElementIndex = 0;
                        const players = [];
                        const ratings = [];
                        for (let i = 0; i < playerElements.length; i++) {
                            players.push(playerElements[i].innerHTML);
                            ratings.push(playerElements[i].parentElement.children.item(4).innerHTML.slice(3, 7));
                        }
                        if (username in players) {
                            for (let i = 0; i < playerElements.length; i++) {
                                if (playerElements[i].innerHTML == username)
                                    playerElementIndex = i;
                            }
                            const opponentName = players[1 - players.indexOf(username)];
                            const opponentRate = playerElements[1 - playerElementIndex].parentNode.children.item(4).innerHTML.slice(3, 7);
                            if (playerElements[0].classList.contains("name-winner"))
                                presenceData.details = "In post-game analysis";
                            else {
                                presenceData.details = "In a game";
                            }
                            presenceData.state = "vs. " + opponentName + "(" + opponentRate + ")";
                        }
                        else {
                            presenceData.details = "Spectating";
                            presenceData.state = players[0] + " (" + ratings[0] + ") vs. " + players[1] + " (" + ratings[1] + ")";
                        }
                    }
                }
            }
            break;
        case "system.81dojo.com":
            presenceData.details = "Viewing WebSystem";
    }
    presence.setActivity(presenceData);
});
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9wcmVzZW5jZS50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxNQUFNLFFBQVEsR0FBRyxJQUFJLFFBQVEsQ0FBQztJQUM1QixRQUFRLEVBQUUscUJBQXFCO0NBQy9CLENBQUMsQ0FBQTtBQUtILFFBQVEsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLEtBQUssSUFBSSxFQUFFO0lBQ3BDLE1BQU0sWUFBWSxHQUFpQjtRQUNsQyxhQUFhLEVBQUUsd0RBQXdEO0tBQ3ZFLENBQUM7SUFDRixRQUFRLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxFQUFDO1FBQ2xDLEtBQUssWUFBWTtZQUNoQixJQUFJLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxJQUFJLEdBQUc7Z0JBQ3BDLFlBQVksQ0FBQyxPQUFPLEdBQUcsbUJBQW1CLENBQUM7aUJBQ3ZDLElBQUksUUFBUSxDQUFDLFFBQVEsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLFVBQVUsQ0FBQyxFQUFDO2dCQUN4RCxJQUFJLFVBQVUsQ0FBQyxRQUFRLENBQUMsY0FBYyxDQUFDLFlBQVksQ0FBQyxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDO29CQUN0RSxZQUFZLENBQUMsT0FBTyxHQUFHLHNCQUFzQixDQUFDO3FCQUMzQztvQkFDSCxJQUFJLE1BQU0sR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLG1CQUFtQixDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTtvQkFDL0UsSUFBSSxRQUFRLEdBQUcsUUFBUSxDQUFDLGNBQWMsQ0FBQyxtQkFBbUIsQ0FBQyxDQUFDLFNBQVMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxFQUFDLENBQUMsQ0FBQyxDQUFDLENBQUE7b0JBQ2pGLElBQUksUUFBUSxDQUFDLGNBQWMsQ0FBQyxZQUFZLENBQUMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLE9BQU87d0JBQ2pFLFlBQVksQ0FBQyxPQUFPLEdBQUcsS0FBSyxHQUFHLE1BQU0sR0FBRyxRQUFRLENBQUE7eUJBQzdDO3dCQUNILElBQUksY0FBYyxHQUFHLFFBQVEsQ0FBQyxnQkFBZ0IsQ0FBQyx5QkFBeUIsQ0FBQyxDQUFBO3dCQUN6RSxJQUFJLGtCQUFrQixHQUFHLENBQUMsQ0FBQzt3QkFDM0IsTUFBTSxPQUFPLEdBQUcsRUFBRSxDQUFDO3dCQUNuQixNQUFNLE9BQU8sR0FBRyxFQUFFLENBQUM7d0JBQ25CLEtBQUssSUFBSSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUMsR0FBRyxjQUFjLENBQUMsTUFBTSxFQUFFLENBQUMsRUFBRSxFQUFDOzRCQUM5QyxPQUFPLENBQUMsSUFBSSxDQUFDLGNBQWMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsQ0FBQTs0QkFDekMsT0FBTyxDQUFDLElBQUksQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsYUFBYSxDQUFDLFFBQVEsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLEtBQUssQ0FBQyxDQUFDLEVBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQTt5QkFDbkY7d0JBQ0QsSUFBSSxRQUFRLElBQUksT0FBTyxFQUFDOzRCQUN2QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsY0FBYyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBQztnQ0FDOUMsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxJQUFJLFFBQVE7b0NBQzFDLGtCQUFrQixHQUFHLENBQUMsQ0FBQzs2QkFDeEI7NEJBQ0QsTUFBTSxZQUFZLEdBQUcsT0FBTyxDQUFDLENBQUMsR0FBQyxPQUFPLENBQUMsT0FBTyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUE7NEJBQ3pELE1BQU0sWUFBWSxHQUFHLGNBQWMsQ0FBQyxDQUFDLEdBQUMsa0JBQWtCLENBQUMsQ0FBQyxVQUFVLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxTQUFTLENBQUMsS0FBSyxDQUFDLENBQUMsRUFBQyxDQUFDLENBQUMsQ0FBQTs0QkFDMUcsSUFBSSxjQUFjLENBQUMsQ0FBQyxDQUFDLENBQUMsU0FBUyxDQUFDLFFBQVEsQ0FBQyxhQUFhLENBQUM7Z0NBQ3RELFlBQVksQ0FBQyxPQUFPLEdBQUcsdUJBQXVCLENBQUE7aUNBQzNDO2dDQUNILFlBQVksQ0FBQyxPQUFPLEdBQUcsV0FBVyxDQUFBOzZCQUNsQzs0QkFDRCxZQUFZLENBQUMsS0FBSyxHQUFHLE1BQU0sR0FBRyxZQUFZLEdBQUcsR0FBRyxHQUFHLFlBQVksR0FBRyxHQUFHLENBQUE7eUJBQ3JFOzZCQUNHOzRCQUNILFlBQVksQ0FBQyxPQUFPLEdBQUcsWUFBWSxDQUFBOzRCQUNuQyxZQUFZLENBQUMsS0FBSyxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxHQUFHLFFBQVEsR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLEdBQUcsSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsR0FBRyxHQUFHLENBQUE7eUJBQ3JHO3FCQUNEO2lCQUNEO2FBQ0Q7WUFDRCxNQUFLO1FBQ04sS0FBSyxtQkFBbUI7WUFDdkIsWUFBWSxDQUFDLE9BQU8sR0FBRyxtQkFBbUIsQ0FBQztLQUU1QztJQUNELFFBQVEsQ0FBQyxXQUFXLENBQUMsWUFBWSxDQUFDLENBQUM7QUFDcEMsQ0FBQyxDQUFDLENBQUMifQ==

//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJlc2VuY2UuanMiLCJtYXBwaW5ncyI6IjtBQUFBO0FBQ0E7QUFDQSxDQUFDO0FBQ0Q7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0Esd0NBQXdDLDJCQUEyQjtBQUNuRTtBQUNBO0FBQ0E7QUFDQTtBQUNBLDRDQUE0QywyQkFBMkI7QUFDdkU7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsQ0FBQztBQUNELDJDQUEyQywydUciLCJzb3VyY2VzIjpbIndlYnBhY2s6Ly9wcmVzZW5jZXMvLi93ZWJzaXRlcy8wLTkvODFEb2pvL3ByZXNlbmNlLnRzIl0sInNvdXJjZXNDb250ZW50IjpbImNvbnN0IHByZXNlbmNlID0gbmV3IFByZXNlbmNlKHtcbiAgICBjbGllbnRJZDogXCIxMzM4ODkxMDM0MzEwMjEzNjgzXCJcbn0pO1xucHJlc2VuY2Uub24oXCJVcGRhdGVEYXRhXCIsIGFzeW5jICgpID0+IHtcbiAgICBjb25zdCBwcmVzZW5jZURhdGEgPSB7XG4gICAgICAgIGxhcmdlSW1hZ2VLZXk6IFwiaHR0cHM6Ly84MWRvam8uY29tL2Rvam8vaW1hZ2VzL2F2YXRhcnMvc3R1ZHlfYmxhY2suanBnXCJcbiAgICB9O1xuICAgIHN3aXRjaCAoZG9jdW1lbnQubG9jYXRpb24uaG9zdG5hbWUpIHtcbiAgICAgICAgY2FzZSBcIjgxZG9qby5jb21cIjpcbiAgICAgICAgICAgIGlmIChkb2N1bWVudC5sb2NhdGlvbi5wYXRobmFtZSA9PSBcIi9cIilcbiAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiVmlld2luZyBob21lIHBhZ2VcIjtcbiAgICAgICAgICAgIGVsc2UgaWYgKGRvY3VtZW50LmxvY2F0aW9uLnBhdGhuYW1lLmluY2x1ZGVzKFwiL2NsaWVudC9cIikpIHtcbiAgICAgICAgICAgICAgICBpZiAocGFyc2VGbG9hdChkb2N1bWVudC5nZXRFbGVtZW50QnlJZChcImxheWVyTG9naW5cIikuc3R5bGUub3BhY2l0eSkgPiAwKVxuICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiTG9nZ2luZyBpbiB0byBjbGllbnRcIjtcbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHNlcnZlciA9IGRvY3VtZW50LmdldEVsZW1lbnRCeUlkKFwiaGVhZGVyLXNlcnZlck5hbWVcIikuaW5uZXJUZXh0LnNsaWNlKDAsIC0zKTtcbiAgICAgICAgICAgICAgICAgICAgbGV0IHVzZXJuYW1lID0gZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJoZWFkZXItcGxheWVyTmFtZVwiKS5pbm5lclRleHQuc2xpY2UoMCwgLTMpO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZG9jdW1lbnQuZ2V0RWxlbWVudEJ5SWQoXCJsYXllckxvYmJ5XCIpLnN0eWxlLmRpc3BsYXkgPT0gXCJibG9ja1wiKVxuICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIkluIFwiICsgc2VydmVyICsgXCIgbG9iYnlcIjtcbiAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGxheWVyRWxlbWVudHMgPSBkb2N1bWVudC5xdWVyeVNlbGVjdG9yQWxsKFwiW2lkPSdwbGF5ZXItaW5mby1uYW1lJ11cIik7XG4gICAgICAgICAgICAgICAgICAgICAgICBsZXQgcGxheWVyRWxlbWVudEluZGV4ID0gMDtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHBsYXllcnMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IHJhdGluZ3MgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVyRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwbGF5ZXJzLnB1c2gocGxheWVyRWxlbWVudHNbaV0uaW5uZXJIVE1MKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByYXRpbmdzLnB1c2gocGxheWVyRWxlbWVudHNbaV0ucGFyZW50RWxlbWVudC5jaGlsZHJlbi5pdGVtKDQpLmlubmVySFRNTC5zbGljZSgzLCA3KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAodXNlcm5hbWUgaW4gcGxheWVycykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcGxheWVyRWxlbWVudHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckVsZW1lbnRzW2ldLmlubmVySFRNTCA9PSB1c2VybmFtZSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHBsYXllckVsZW1lbnRJbmRleCA9IGk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wcG9uZW50TmFtZSA9IHBsYXllcnNbMSAtIHBsYXllcnMuaW5kZXhPZih1c2VybmFtZSldO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbnN0IG9wcG9uZW50UmF0ZSA9IHBsYXllckVsZW1lbnRzWzEgLSBwbGF5ZXJFbGVtZW50SW5kZXhdLnBhcmVudE5vZGUuY2hpbGRyZW4uaXRlbSg0KS5pbm5lckhUTUwuc2xpY2UoMywgNyk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHBsYXllckVsZW1lbnRzWzBdLmNsYXNzTGlzdC5jb250YWlucyhcIm5hbWUtd2lubmVyXCIpKVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuZGV0YWlscyA9IFwiSW4gcG9zdC1nYW1lIGFuYWx5c2lzXCI7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByZXNlbmNlRGF0YS5kZXRhaWxzID0gXCJJbiBhIGdhbWVcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLnN0YXRlID0gXCJ2cy4gXCIgKyBvcHBvbmVudE5hbWUgKyBcIihcIiArIG9wcG9uZW50UmF0ZSArIFwiKVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlNwZWN0YXRpbmdcIjtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwcmVzZW5jZURhdGEuc3RhdGUgPSBwbGF5ZXJzWzBdICsgXCIgKFwiICsgcmF0aW5nc1swXSArIFwiKSB2cy4gXCIgKyBwbGF5ZXJzWzFdICsgXCIgKFwiICsgcmF0aW5nc1sxXSArIFwiKVwiO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgXCJzeXN0ZW0uODFkb2pvLmNvbVwiOlxuICAgICAgICAgICAgcHJlc2VuY2VEYXRhLmRldGFpbHMgPSBcIlZpZXdpbmcgV2ViU3lzdGVtXCI7XG4gICAgfVxuICAgIHByZXNlbmNlLnNldEFjdGl2aXR5KHByZXNlbmNlRGF0YSk7XG59KTtcbi8vIyBzb3VyY2VNYXBwaW5nVVJMPWRhdGE6YXBwbGljYXRpb24vanNvbjtiYXNlNjQsZXlKMlpYSnphVzl1SWpvekxDSm1hV3hsSWpvaWNISmxjMlZ1WTJVdWFuTWlMQ0p6YjNWeVkyVlNiMjkwSWpvaUlpd2ljMjkxY21ObGN5STZXeUl1TGk5d2NtVnpaVzVqWlM1MGN5SmRMQ0p1WVcxbGN5STZXMTBzSW0xaGNIQnBibWR6SWpvaVFVRkJRU3hOUVVGTkxGRkJRVkVzUjBGQlJ5eEpRVUZKTEZGQlFWRXNRMEZCUXp0SlFVTTFRaXhSUVVGUkxFVkJRVVVzY1VKQlFYRkNPME5CUXk5Q0xFTkJRVU1zUTBGQlFUdEJRVXRJTEZGQlFWRXNRMEZCUXl4RlFVRkZMRU5CUVVNc1dVRkJXU3hGUVVGRkxFdEJRVXNzU1VGQlNTeEZRVUZGTzBsQlEzQkRMRTFCUVUwc1dVRkJXU3hIUVVGcFFqdFJRVU5zUXl4aFFVRmhMRVZCUVVVc2QwUkJRWGRFTzB0QlEzWkZMRU5CUVVNN1NVRkRSaXhSUVVGUkxGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RlFVRkRPMUZCUTJ4RExFdEJRVXNzV1VGQldUdFpRVU5vUWl4SlFVRkpMRkZCUVZFc1EwRkJReXhSUVVGUkxFTkJRVU1zVVVGQlVTeEpRVUZKTEVkQlFVYzdaMEpCUTNCRExGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVY3NiVUpCUVcxQ0xFTkJRVU03YVVKQlEzWkRMRWxCUVVrc1VVRkJVU3hEUVVGRExGRkJRVkVzUTBGQlF5eFJRVUZSTEVOQlFVTXNVVUZCVVN4RFFVRkRMRlZCUVZVc1EwRkJReXhGUVVGRE8yZENRVU40UkN4SlFVRkpMRlZCUVZVc1EwRkJReXhSUVVGUkxFTkJRVU1zWTBGQll5eERRVUZETEZsQlFWa3NRMEZCUXl4RFFVRkRMRXRCUVVzc1EwRkJReXhQUVVGUExFTkJRVU1zUjBGQlJ5eERRVUZETzI5Q1FVTjBSU3haUVVGWkxFTkJRVU1zVDBGQlR5eEhRVUZITEhOQ1FVRnpRaXhEUVVGRE8zRkNRVU16UXp0dlFrRkRTQ3hKUVVGSkxFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVTXNZMEZCWXl4RFFVRkRMRzFDUVVGdFFpeERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRXRCUVVzc1EwRkJReXhEUVVGRExFVkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNRMEZCUVR0dlFrRkRMMFVzU1VGQlNTeFJRVUZSTEVkQlFVY3NVVUZCVVN4RFFVRkRMR05CUVdNc1EwRkJReXh0UWtGQmJVSXNRMEZCUXl4RFFVRkRMRk5CUVZNc1EwRkJReXhMUVVGTExFTkJRVU1zUTBGQlF5eEZRVUZETEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVFN2IwSkJRMnBHTEVsQlFVa3NVVUZCVVN4RFFVRkRMR05CUVdNc1EwRkJReXhaUVVGWkxFTkJRVU1zUTBGQlF5eExRVUZMTEVOQlFVTXNUMEZCVHl4SlFVRkpMRTlCUVU4N2QwSkJRMnBGTEZsQlFWa3NRMEZCUXl4UFFVRlBMRWRCUVVjc1MwRkJTeXhIUVVGSExFMUJRVTBzUjBGQlJ5eFJRVUZSTEVOQlFVRTdlVUpCUXpkRE8zZENRVU5JTEVsQlFVa3NZMEZCWXl4SFFVRkhMRkZCUVZFc1EwRkJReXhuUWtGQlowSXNRMEZCUXl4NVFrRkJlVUlzUTBGQlF5eERRVUZCTzNkQ1FVTjZSU3hKUVVGSkxHdENRVUZyUWl4SFFVRkhMRU5CUVVNc1EwRkJRenQzUWtGRE0wSXNUVUZCVFN4UFFVRlBMRWRCUVVjc1JVRkJSU3hEUVVGRE8zZENRVU51UWl4TlFVRk5MRTlCUVU4c1IwRkJSeXhGUVVGRkxFTkJRVU03ZDBKQlEyNUNMRXRCUVVzc1NVRkJTU3hEUVVGRExFZEJRVWNzUTBGQlF5eEZRVUZGTEVOQlFVTXNSMEZCUnl4alFVRmpMRU5CUVVNc1RVRkJUU3hGUVVGRkxFTkJRVU1zUlVGQlJTeEZRVUZET3pSQ1FVTTVReXhQUVVGUExFTkJRVU1zU1VGQlNTeERRVUZETEdOQlFXTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJReXhUUVVGVExFTkJRVU1zUTBGQlFUczBRa0ZEZWtNc1QwRkJUeXhEUVVGRExFbEJRVWtzUTBGQlF5eGpRVUZqTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1lVRkJZU3hEUVVGRExGRkJRVkVzUTBGQlF5eEpRVUZKTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhEUVVGRExFdEJRVXNzUTBGQlF5eERRVUZETEVWQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1EwRkJRVHQ1UWtGRGJrWTdkMEpCUTBRc1NVRkJTU3hSUVVGUkxFbEJRVWtzVDBGQlR5eEZRVUZET3pSQ1FVTjJRaXhMUVVGTExFbEJRVWtzUTBGQlF5eEhRVUZITEVOQlFVTXNSVUZCUlN4RFFVRkRMRWRCUVVjc1kwRkJZeXhEUVVGRExFMUJRVTBzUlVGQlJTeERRVUZETEVWQlFVVXNSVUZCUXp0blEwRkRPVU1zU1VGQlNTeGpRVUZqTEVOQlFVTXNRMEZCUXl4RFFVRkRMRU5CUVVNc1UwRkJVeXhKUVVGSkxGRkJRVkU3YjBOQlF6RkRMR3RDUVVGclFpeEhRVUZITEVOQlFVTXNRMEZCUXpzMlFrRkRlRUk3TkVKQlEwUXNUVUZCVFN4WlFVRlpMRWRCUVVjc1QwRkJUeXhEUVVGRExFTkJRVU1zUjBGQlF5eFBRVUZQTEVOQlFVTXNUMEZCVHl4RFFVRkRMRkZCUVZFc1EwRkJReXhEUVVGRExFTkJRVUU3TkVKQlEzcEVMRTFCUVUwc1dVRkJXU3hIUVVGSExHTkJRV01zUTBGQlF5eERRVUZETEVkQlFVTXNhMEpCUVd0Q0xFTkJRVU1zUTBGQlF5eFZRVUZWTEVOQlFVTXNVVUZCVVN4RFFVRkRMRWxCUVVrc1EwRkJReXhEUVVGRExFTkJRVU1zUTBGQlF5eFRRVUZUTEVOQlFVTXNTMEZCU3l4RFFVRkRMRU5CUVVNc1JVRkJReXhEUVVGRExFTkJRVU1zUTBGQlFUczBRa0ZETVVjc1NVRkJTU3hqUVVGakxFTkJRVU1zUTBGQlF5eERRVUZETEVOQlFVTXNVMEZCVXl4RFFVRkRMRkZCUVZFc1EwRkJReXhoUVVGaExFTkJRVU03WjBOQlEzUkVMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWNzZFVKQlFYVkNMRU5CUVVFN2FVTkJRek5ETzJkRFFVTklMRmxCUVZrc1EwRkJReXhQUVVGUExFZEJRVWNzVjBGQlZ5eERRVUZCT3paQ1FVTnNRenMwUWtGRFJDeFpRVUZaTEVOQlFVTXNTMEZCU3l4SFFVRkhMRTFCUVUwc1IwRkJSeXhaUVVGWkxFZEJRVWNzUjBGQlJ5eEhRVUZITEZsQlFWa3NSMEZCUnl4SFFVRkhMRU5CUVVFN2VVSkJRM0pGT3paQ1FVTkhPelJDUVVOSUxGbEJRVmtzUTBGQlF5eFBRVUZQTEVkQlFVY3NXVUZCV1N4RFFVRkJPelJDUVVOdVF5eFpRVUZaTEVOQlFVTXNTMEZCU3l4SFFVRkhMRTlCUVU4c1EwRkJReXhEUVVGRExFTkJRVU1zUjBGQlJ5eEpRVUZKTEVkQlFVY3NUMEZCVHl4RFFVRkRMRU5CUVVNc1EwRkJReXhIUVVGSExGRkJRVkVzUjBGQlJ5eFBRVUZQTEVOQlFVTXNRMEZCUXl4RFFVRkRMRWRCUVVjc1NVRkJTU3hIUVVGSExFOUJRVThzUTBGQlF5eERRVUZETEVOQlFVTXNSMEZCUnl4SFFVRkhMRU5CUVVFN2VVSkJRM0pITzNGQ1FVTkVPMmxDUVVORU8yRkJRMFE3V1VGRFJDeE5RVUZMTzFGQlEwNHNTMEZCU3l4dFFrRkJiVUk3V1VGRGRrSXNXVUZCV1N4RFFVRkRMRTlCUVU4c1IwRkJSeXh0UWtGQmJVSXNRMEZCUXp0TFFVVTFRenRKUVVORUxGRkJRVkVzUTBGQlF5eFhRVUZYTEVOQlFVTXNXVUZCV1N4RFFVRkRMRU5CUVVNN1FVRkRjRU1zUTBGQlF5eERRVUZETEVOQlFVTWlmUT09Il0sIm5hbWVzIjpbXSwic291cmNlUm9vdCI6IiJ9
