/* Changing Tabs */
function openTab(evt, tabName) {
    var i, x, tablinks;
    x = document.getElementsByClassName("app-page");
    for (i = 0; i < x.length; i++) {
        x[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < x.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active-red", "");
    }
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active-red";
}

/* Function for Requesting AJAX */
function requestApi(apiUrl, localName) {
    /* Saving requests*/    
    var url = apiUrl;
    var xmlhttp = window.XMLHttpRequest
        ? new XMLHttpRequest()
        : new ActiveXObject("Microsoft.XMLHTTP");

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            var jsondata = JSON.parse(xmlhttp.responseText);
            var footData  = JSON.stringify(jsondata);    

            localStorage.setItem(localName, footData);
        }
    }

    xmlhttp.open('GET', url);
    xmlhttp.setRequestHeader("X-Auth-Token", "383412449bc94f34bccb709be3b40dd3");
    xmlhttp.send();
}

/* This function is responsible for accessing the API database and creating the list of Teams at the Premier League */
function getTeamsList(){ 
    /* Requesting API and Storing JSON into Local Storage */
    var url = 'https://api.football-data.org/v2/competitions/2021/teams/';
    var localName = 'PremierTeams'
    requestApi(url, localName);

    var premierTeams = JSON.parse(localStorage.getItem(localName)).teams;  
    
    /* Creates a Form Select element to allow choosing the Team to display the information */
    var output = '';
    output = '<div id="choose-team-div">';    
    output += '<form>';
    output +='<select id="team_select" onchange="teamSelect()" >';
    output += '<option value="choose">Choose Game</option>';
    for (var i=0; i < premierTeams.length; i++){
        output += '<option value="'+i+'">'+ premierTeams[i].name+'</option>';
    }
    output += '</select>';
    output += '</form>';
    output += '</div>';
    
    document.getElementById("teams-list").innerHTML=output;
    buttonONbuttonOff();
}

/* Takes the name of the team from the selection chosen in order to be used to display its info */
function teamSelect(){
	var selectBox = document.getElementById("team_select");
	var teamIndex = selectBox.options[selectBox.selectedIndex].value;
	getTeamInfo(teamIndex);
}

/* This function is responsible for accessing the API database and then displaying the basict information of the selected Team - badge, name, founded date, etc. */
function getTeamInfo(i){
    /* Requesting API and Storing JSON into Local Storage */
    var url = 'https://api.football-data.org/v2/competitions/2021/teams/';
    var localName = 'PremierTeams'
    requestApi(url, localName);

    var premierTeams = JSON.parse(localStorage.getItem(localName)).teams;  

    var teamId = premierTeams[i].id;
    
    /* Create a div to hold all the info of the Selected team */
    var output = '';    
    output += "<h2>" + premierTeams[i].name + "</h2>";    
    output += '<figure class="my-team-image"><img src="' + premierTeams[i].crestUrl + '" alt="' + premierTeams[i].name + ' Thumb"></figure>';
    output += '<div id="team-data">';
    output += "<p><strong>Founded:</strong> " + premierTeams[i].founded + "</p>";
    output += "<p><strong>Stadium:</strong> " + premierTeams[i].venue + "</p>";
    output += '<p><strong>Website:</strong> <a href="' + premierTeams[i].website + '" target="_blank">' + premierTeams[i].website + '</a></p>'; 
    // output += "<p><strong>Website</strong> " + premierTeams[i].website + "</p>";    
    output += '</div>';        

    document.getElementById("team-info").innerHTML=output;

    var showSquadTable = document.querySelector("#show-squad-table");

    showSquadTable.setAttribute("class", "");

    showSquadTable.classList.add(teamId);        
    
    buttonONbuttonOff();
    runTeamPlayersBeforeShow();
    
    document.getElementById("team-squad").innerHTML = " ";
}

/* Hides or Shows Team Information button */
function buttonONbuttonOff() {
    var showSquadTable = document.querySelector("#show-squad-table");
    var teamInfoDiv = document.querySelector("#team-info");
    // var cleanSquadButton = teamInfoDiv.innerHTML.trim();
    if (teamInfoDiv.hasChildNodes()) {
        showSquadTable.style.display = "block";
    } else {
        showSquadTable.style.display = "none";
    }
}

/* This is actually a "work-around" I needed to create. When I was calling for the players of the team, somehow the API was bringing the players of the previous Team, not the current one. So I needed to create this function to fecth the players list before running the function to display the players list. There must be a best alternative, but at least this one works perfectly well. */
function runTeamPlayersBeforeShow() {
    /* This trick to know witch team should be used to display the players gave a lot of trouble. Because I needed to make the application figure out witch team was being displayerd, since the API was using different JSON files for the team's simple info and for the players */
    var teamId = document.querySelector("#show-squad-table").classList[0];

    /* Requesting API and Storing JSON into Local Storage */
    var url = 'https://api.football-data.org/v2/teams/' + teamId + '/' ;    
    var localName = 'teamInformation'
    requestApi(url, localName);
    
    var teamInfo = JSON.parse(localStorage.getItem('teamInformation')).squad;
}

/* This function then creates a table with all of the players of the team */
function getTeamPlayers(){
    var teamId = document.querySelector("#show-squad-table").classList[0];
    /* Requesting API and Storing JSON into Local Storage */
    var url = 'https://api.football-data.org/v2/teams/' + teamId + '/' ;
    var localName = 'teamInformation'
    requestApi(url, localName);

    var teamInfo = JSON.parse(localStorage.getItem('teamInformation')).squad;

    /* Create a div to hold all the info of the players of the selected team */
    var output = '';
    output += '<section class="animate-from-left">';
    output += '<h3>Team Squad</h3>'
    output += '<table id="table-squad"><thead><tr><th>Player Name</th><th>Position</th><th>Nationality</th><th>Shirt Number</th></tr></thead><tbody>';
    for (var i=0; i < teamInfo.length; i++){
        var playerShirt = teamInfo[i].shirtNumber;
        if( playerShirt === null ) {
            playerShirt = "N/A"
        } else {
            playerShirt = teamInfo[i].shirtNumber;
        }

        /* This was one of my favorite tricks. I wanted to show a flag instead of the words telling the country of the player. But the API only brought the name of the country, no flag included. Then I found a pack of icons for flags and instead of using a huge Switch statement, I simply made sure all the names of the images were lowercase and simple than I converted the name from the API to match the url I needed. 3 or 4 flags weren't available and I needed to work them manually, but the rest (over a hundred) worked directly from the package of icons because of this trick */
        var playerNationality = teamInfo[i].nationality;
        var playerNationalityURL = playerNationality.replace(/\s+/g, '-').toLowerCase();

        output += '<tr><td>' + teamInfo[i].name + '</td>';
        output += '<td>' + teamInfo[i].position + '</td>';
        output += '<td>' + '<figure class="player-nationality-image"><img src="img/country-flags/' + playerNationalityURL + '.svg" alt="' + playerNationality + '"></figure>'; + '</td>';
        output += '<td>' + playerShirt + '</td></tr>';
    }    
    output += '</tbody></table>';

    document.getElementById("team-squad").innerHTML=output;

}

/* This function controls the animation for the Badge to slide to the side and show the information */
function slideShieldOn() {
    const myTeamImage = document.querySelector(".my-team-image");
    myTeamImage.style.marginLeft = "-40%";

    const teamDataDiv = document.querySelector("#team-data");
    teamDataDiv.classList.add("animate-team-data");
}

/* Transition that brings the badge back to its position and to hide the information of the team */
function slideShieldOut() {
    const myTeamImage = document.querySelector(".my-team-image");
    myTeamImage.style.marginLeft = "0";

    const teamDataDiv = document.querySelector("#team-data");    
    teamDataDiv.classList.remove("animate-team-data");    
    teamDataDiv.style.marginLeft = "-300px";
    teamDataDiv.style.opacity = "0";
    teamDataDiv.style.transition = "all 2s";    
}

/* This funtion is responsible for fecthing the API's information of the Standings. It then creates a table to show the stadings. */ 
function displayStandings() {
    /* Requesting API and Storing JSON into Local Storage */      
    var url = 'https://api.football-data.org/v2/competitions/2021/standings/';
    var localName = 'PremierStandings'
    requestApi(url, localName);    

    var standings_deserialized = JSON.parse(localStorage.getItem('PremierStandings'));

    var premierStandings = standings_deserialized.standings[0].table;    

    var output = ''; 
    output += '<h2>Premier League Standings</h2>'
    output += '<section>';
    output += '<table id="table-standings"><thead><tr><th>#</th><th></th><th>Club</th><th> P </th><th> W </th><th> D </th><th> L </th><th>Pts</th><th>GD</th></tr></thead><tbody>';
    for (var i=0; i < premierStandings.length; i++){
        output += '<tr><td>' + premierStandings[i].position + '</td>';
        output += '<td><figure class="figure-standings"><img src="' + premierStandings[i].team.crestUrl + '" alt="' + premierStandings[i].team.name + ' Thumb"></figure></td>';
        output += '<td>' + premierStandings[i].team.name +  '</td>';
        output += '<td>' + premierStandings[i].playedGames + '</td>';
        output += '<td>' + premierStandings[i].won + '</td>';
        output += '<td>' + premierStandings[i].draw + '</td>';
        output += '<td>' + premierStandings[i].lost + '</td>';
        output += '<td>' + premierStandings[i].points + '</td>';
        output += '<td>' + premierStandings[i].goalDifference + '</td></tr>';
    }    
    output += '</tbody></table>';
    output += '<p id="legends"><strong>P</strong> = Played, <strong>W</strong> = Won, <strong>D</strong> = Draw, <strong>L</strong> = Lost, <strong>Pts</strong> = Points</p>';
    output += '</section>';    

    document.getElementById("premier-standings").innerHTML=output;
}

/* This function figures out which Matchady is the current one  */

function figureMatchday() {
    /* Requesting API and Storing JSON into Local Storage */
    var url = 'https://api.football-data.org/v2/competitions/2021/matches';
    var localName = 'PremierMatches'
    requestApi(url, localName);
    
    var matchesList = JSON.parse(localStorage.getItem('PremierMatches')).matches;

    var currentMatchDayString = '';
    var currentMatchDay = '';

    for (var i=0; i < matchesList.length; i++){
        // Current date in YYYY/MM/DD format
        var today = new Date().toJSON().slice(0,10).replace(/-/g,'/');
        var tomorrow = new Date(new Date().setDate(new Date().getDate() + 1)).toJSON().slice(0,10).replace(/-/g,'/');
        var twoTomorrow = new Date(new Date().setDate(new Date().getDate() + 2)).toJSON().slice(0,10).replace(/-/g,'/');
        var threeTomorrow = new Date(new Date().setDate(new Date().getDate() + 3)).toJSON().slice(0,10).replace(/-/g,'/');
        var fourTomorrow = new Date(new Date().setDate(new Date().getDate() + 4)).toJSON().slice(0,10).replace(/-/g,'/');
        var fiveTomorrow = new Date(new Date().setDate(new Date().getDate() + 5)).toJSON().slice(0,10).replace(/-/g,'/');
        var sixTomorrow = new Date(new Date().setDate(new Date().getDate() + 6)).toJSON().slice(0,10).replace(/-/g,'/');
        var sevenTomorrow = new Date(new Date().setDate(new Date().getDate() + 7)).toJSON().slice(0,10).replace(/-/g,'/');

        // Date of the Games converted to local
        var utcDate = matchesList[i].utcDate;
        var localDate = new Date(utcDate).toJSON().slice(0,10).replace(/-/g,'/');

        switch (localDate) {
            case today:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case tomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case twoTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case threeTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case fourTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case fiveTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case sixTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
            case sevenTomorrow:
                currentMatchDayString += matchesList[i].matchday;
                break;
        }

        currentMatchDay = currentMatchDayString.substring(0,2);
    }

    var headingsMatchday = document.querySelector("#current-matchday");

    headingsMatchday.setAttribute("class", "");

    headingsMatchday.classList.add(currentMatchDay);

}

/* This funtion is responsible for fecthing the API's information of the Matches. It then creates a table to show the matches for a given week. */ 
function displayMatches() {
    /* Requesting API and Storing JSON into Local Storage */
    var currentMatchDay = document.querySelector("#current-matchday").classList[0];
    var url = 'https://api.football-data.org/v2/competitions/2021/matches?matchday=' + currentMatchDay;
    var localName = 'PremierMatchday'
    requestApi(url, localName);

    var premierMatches = JSON.parse(localStorage.getItem('PremierMatchday')); 

    var output = ''; 
    output += '<h2>Matchday ' + currentMatchDay + '</h2>'
    output += '<section>';

    var teams_deserialized = JSON.parse(localStorage.getItem('PremierTeams'));

    var premierTeams = teams_deserialized.teams;
    
    output += '<table id="table-matches"><thead><tr><th>Date/Time</th><th>Home</th><th></th><th></th><th>X</th><th></th><th></th><th>Away</th></tr></thead><tbody>';
    for (var i=0; i < premierMatches.matches.length; i++){
        // Convert the time to local time and separate time and day               
        var utcDate = premierMatches.matches[i].utcDate;
        var localDate = new Date(utcDate);
        var time = localDate.toLocaleString('en-US', { hour: 'numeric', minute: 'numeric', hour12: true });
        // var time = localDate.toLocaleTimeString().replace(/(.*)\D\d+/, '$1');

        var month = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
"Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][localDate.getMonth()];
        var strDate = month + ' ' + localDate.getDate();

        var awayId = premierMatches.matches[i].awayTeam.id;
        var homeId = premierMatches.matches[i].homeTeam.id;
        var awayURL = '';
        var homeURL = '';
        var awayScore = premierMatches.matches[i].score.fullTime.awayTeam;
        var homeScore = premierMatches.matches[i].score.fullTime.homeTeam;
        if (awayScore === null || homeScore === null) {
            awayScore = " ";
            homeScore = " ";
        }

        /* I also felt very good about the trick I created to show the icon/badge of the team of the Match, since this icon was not available in the JSON file of the matches and I didn't want to manually create all the icons for all the Teams. I also knew I already had the information in the JSON file for the Standings, so I just needed to communicate between the two.*/
        for(let i = 0; i < premierTeams.length; i++){
            if(premierTeams[i].id == awayId) {
                awayURL = premierTeams[i].crestUrl;
            } else if (premierTeams[i].id == homeId) {
                homeURL = premierTeams[i].crestUrl;
            }
        }        
        
        /* Substitute Complete Team name for a short version */
        var homeTeamName = shortenTeamName(premierMatches.matches[i].homeTeam.name);
        var awayTeamName = shortenTeamName(premierMatches.matches[i].awayTeam.name);

        output += '<tr><td>' + strDate + ' at ' + time + '</td>';
        output += '<td>' + homeTeamName + '</td>';
        output += '<td><figure class="figure-matches"><img src="' + homeURL + '" alt="' + premierTeams.name + ' Thumb"></figure></td>';
        output += '<td>' + homeScore + '</td>';
        output += '<td> X </td>';
        output += '<td>' + awayScore + '</td>';
        output += '<td><figure class="figure-matches"><img src="' + awayURL + '" alt="' + premierTeams.name + ' Thumb"></figure></td>';            
        output += '<td>' + awayTeamName + '</td></tr>';
    } 
    output += '</tbody></table>';
    output += '</section>'

    document.getElementById("current-matchday").innerHTML=output;
}


/* Create a function to allow user to click on badge and redirect to a page with information about the team*/ 



/* These event listeners are responsible for running the functions when the page first loads */
window.addEventListener('DOMContentLoaded', displayStandings, false);
window.addEventListener('DOMContentLoaded', figureMatchday, false);
window.addEventListener('DOMContentLoaded', displayMatches, false);
window.addEventListener('DOMContentLoaded', getTeamsList, false);


/* These event listneres control the animation of the badge in the Team Tab */
const teamInfoDiv = document.querySelector("#team-info");

teamInfoDiv.addEventListener('mouseover', slideShieldOn)
teamInfoDiv.addEventListener('mouseout', slideShieldOut)

/* Simple function to substitute the long version of a team name for a short one */
function shortenTeamName(teamName) {
    var completeTeamName = teamName;
    var shortTeamName = '';

    switch(completeTeamName) {
        case 'Liverpool FC':
            shortTeamName = 'Liverpool';
            break;
        case 'Leicester City FC':
            shortTeamName = 'Leicester';
            break;
        case 'Manchester City FC':
            shortTeamName = 'Manchester City';
            break;
        case 'Chelsea FC':
            shortTeamName = 'LiverChelseapool';
            break;
        case 'Manchester United FC':
            shortTeamName = 'Manchester United';
            break;
        case 'Tottenham Hotspur FC':
            shortTeamName = 'Tottenham Hotspur';
            break;
        case 'Wolverhampton Wanderers FC':
            shortTeamName = 'Wolverhampton';
            break;
        case 'Sheffield United FC':
            shortTeamName = 'Sheffield United';
            break;
        case 'Crystal Palace FC':
            shortTeamName = 'Crystal Palace';
            break;
        case 'Arsenal FC':
            shortTeamName = 'Arsenal';
            break;
        case 'Everton FC':
            shortTeamName = 'Everton';
            break;
        case 'Southampton FC':
            shortTeamName = 'Southampton';
            break;
        case 'Newcastle United FC':
            shortTeamName = 'Newcastle';
            break;
        case 'Brighton & Hove Albion FC':
            shortTeamName = 'Brighton';
            break;
        case 'Burnley FC':
            shortTeamName = 'Burnley';
            break;
        case 'West Ham United FC':
            shortTeamName = 'West Ham';
            break;
        case 'Aston Villa FC':
            shortTeamName = 'Aston Villa';
            break;
        case 'AFC Bournemouth':
            shortTeamName = 'Bournemouth';
            break;
        case 'Watford FC':
            shortTeamName = 'Watford';
            break;
        case 'Norwich City FC':
            shortTeamName = 'Norwich';
            break;        
    }

    return shortTeamName;
}