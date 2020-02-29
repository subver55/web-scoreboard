var currentTimeDiv=null;
var resultsDataRow=null;
var resultsTable=null;

var dataUpdated="";
var raceName=null;
var runName=null;
var raceTime = null;
var bestLapName = null;
var bestLapTime = null;
var footerFlags = null;
var wsScoreboard = null;
var competitorStates = {};

function connectWs()
{
  wsScoreboard = new WebSocket(scoreboardDataWsUrl);
  wsScoreboard.onopen= function(e){
    var dataSet=["pos","num","short_class_name","competitor_state","name",
"best_lap_time","last_sector_1","last_sector_2","last_sector_3","last_lap_time_1","last_lap_time_2","last_lap_time_3",
"laps_count","diff","gap","best_sector_1","best_sector_2","best_sector_3","combined_best_lap_time"];
    wsScoreboard.send(JSON.stringify(dataSet));
  };
  wsScoreboard.onmessage =function(event){
    var json = JSON.parse(event.data);
    reloadData(json);
    if(!isEmpty(json["weather"]))
    {
      if(typeof reloadWeather!=="undefined")
      {
        reloadWeather(json["weather"]);
      }
    }
  };
  wsScoreboard.onclose = function(e){
    setTimeout(function(){
      connectWs();
    },2000);
  };

}
function bodyLoaded()
{
    currentTimeDiv = document.getElementById('current_time');
    setInterval(updateCurrentTime,1000);
    resultsTable = document.getElementById("resultsTable");
    resultsDataRow = resultsTable.querySelector("#dataRow");
    raceName = document.getElementById("race_name");
    runName  = document.getElementById("run_name");
    raceTime = document.getElementById("race_time");
    bestLapName = document.getElementById("total_best_lap_name");
    bestLapTime = document.getElementById("total_best_lap_time");
    footerFlags = document.getElementsByClassName("footerFlags");
    var rows = resultsTable.getElementsByClassName("dataRow");
    for(let row of rows)
    {
      row.remove();
    }
    setInterval(updateMarkers,50);
    connectWs();
}

function updateCurrentTime()
{
  var date = new Date();
  time = date.toLocaleTimeString();
  if(currentTimeDiv!=null)
  {
    currentTimeDiv.innerHTML = time;
  }
}
function addClass(el,classnm)
{
  if(el==null)
  {
    return;
  }
  arr = el.className.split(" ");
  if(arr.indexOf(classnm)==-1)
  {
    el.className+=" "+classnm;
  }
}
function removeClass(el,classnm)
{
   arr = el.className.split(" ");
   index = arr.indexOf(classnm);
   if(index>=0)
   {
     arr.splice(index,1);
   }
   el.className = arr.join(" ");
}
function hasClass(el,classnm)
{
  arr = el.className.split(" ");
  index = arr.indexOf(classnm);
  if(index>=0)
  {
    return true;
  }
  return false;
}

function formatRaceTime(val)
{
  hours= Math.floor(val/3600000);
  if(hours<10)
  {
    hours="0"+hours;
  }
  minutes=Math.floor((val%3600000)/60000);
  if(minutes<10)
  {
    minutes="0"+minutes;
  }
  seconds =Math.floor((val%60000)/1000);
  if(seconds<10)
  {
    seconds = "0"+seconds;
  }
  return hours+":"+minutes+":"+seconds;
}
function formatLapTime(val)
{
  if(isNaN(val))
  {
    return "";
  }
  if(val==0)
  {
    return "";
  }
  var s="";
  var hours="";
  var minutes="";
  var h=0;
  var m=0;
  var s=0;
  if(val>=3600000)
  {
    h =  Math.floor(val/3600000);
    hours = h+":"
  }
  if(val>=60000)
  {
    m = Math.floor((val%3600000)/60000);
    minutes=m+":";
    if(h>0 && m<10)
    {
      minutes = "0"+minutes;
    }
  }
  s = (val%60000)/1000;
  var seconds = parseFloat((val%60000)/1000).toFixed(3)+"";
  if(m>0 && s<10)
  {
    seconds="0"+seconds;
  }
  return hours+minutes+seconds;
}
function formatDiff(val)
{
  if(val<=-100000)
  {
    return (-val/100000)+" сект.";
  }
  if(val<0)
  {
    return -val+" кр.";
  }
  return formatLapTime(val);
}
function formatLaps(val)
{
  if(val>0)
  {
    return val;
  }
  return "";
}
function isEmpty(obj) {
    for(var prop in obj) {
        if(obj.hasOwnProperty(prop))
            return false;
    }

    return true;
}


function reloadData(json)
{
  refresh = json["refresh"];
  update = json["update"];
  if(!isEmpty(refresh))
  {
    if(raceName!=null)
    {
        var p = refresh["eventName"];
        if(p=="" || p==null)
        {
          raceName.innerHTML = p;
        }
        else
        {
          raceName.innerHTML = p+"&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp";
        }

    }
    if(runName!=null)
    {
      runName.innerHTML =  refresh["runName"];
    }
    if(raceTime!=null)
    {
      raceTime.innerHTML = formatRaceTime(refresh["elapsedTime"]);
    }
    if(footerFlags!=null)
    {
      for(i=0;i<footerFlags.length;i++)
      {
        footerFlags[i].className = "footerFlags";
        if(refresh["flagState"]==0)
        {
          addClass(footerFlags[i],"greenFlag");
        }
        if(refresh["flagState"]==1)
        {
          addClass(footerFlags[i],"yellowFlag");
        }
        else
        if(refresh["flagState"]==2)
        {
          addClass(footerFlags[i],"redFlag");
        }
        if(refresh["flagState"]==3)
        {
          addClass(footerFlags[i],"finishFlag");
        }
        if(refresh["flagState"]==4)
        {
          addClass(footerFlags[i],"warmupFlag");
        }
      }
    }
  }
  if(!isEmpty(update))
  {
    if(json["command"]=="clear")
    {
      var nodes = resultsTable.querySelectorAll(".dataRow");
      if(nodes!=null)
      {
        for(let node of nodes)
        {
          node.remove();
        }
      }
      competitorStates = {};
      return;
    }

    blTime = update["bestLapTime"];
    blName = update["bestLapName"];
    if(blName==null || blTime==0 || blTime==null)
    {
      blName="";
    }
    if(bestLapName!=null)
    {
      bestLapName.innerHTML = blName;
    }
    if(bestLapTime!=null)
    {
      bestLapTime.innerHTML =  formatLapTime(update["bestLapTime"]);
    }
    results = update["results"];
    updateResults(results)
  }
}
function updateResults(results)
{
  if(results!=null)
  {
    var currentRowCount = resultsTable.children.length-1;
    var newRowCount = 0;
    for(i=0;i<results.length;i++)
    {
      var pos = results[i]["pos"]
      if(pos!=null)
      {
        pos = pos[0];
        if(pos>newRowCount)
        {
          newRowCount = pos;
        }
      }
    }
    if(currentRowCount<newRowCount)
    {
      for(i=currentRowCount;i<newRowCount;i++)
      {

        var newRow = resultsDataRow.cloneNode(true);
        if((i+1)&0x01)
        {
            addClass(newRow,"oddRow");
        }
        else
        {
            removeClass(newRow,"oddRow");
        }
        resultsTable.appendChild(newRow);
      }
    }
    if(results.length>0)
    {
      for(let resultItem of results)
      {
        //resultItem = results[i];
        okeys = Object.keys(resultItem);
        var pos = resultItem["pos"][0];
        var competitorId = resultItem["competitor_id"];
        if(pos==null)
        {
          continue;
        }
        var row = resultsTable.querySelector(".compid"+competitorId);
        if(row==null)
        {
          row = resultsTable.children[pos];
          addClass(row,"compid"+competitorId);
        }
        else {
          var oldPos = -1;
          for(i=1;i<resultsTable.children.length;i++)
          {
            if(row==resultsTable.children[i])
            {
              oldPos = i;
              break;
            }
          }
          if(oldPos!=pos)
          {
            row.remove();
            resultsTable.insertBefore(row,resultsTable.children[pos]);
            for(i=1;i<resultsTable.children.length;i++)
            {
              var r = resultsTable.children[i];
              if((i%2) == 0)
              {
                removeClass(r,"oddRow");
              }
              else
              {
                  addClass(r,"oddRow");
              }
              var p = r.querySelector("#pos");
              if(p!=null)
              {
                p.innerHTML = i;
              }
            }
          }
        }

        for(key in okeys)
        {
          el = row.querySelector("#"+okeys[key]);
          if(el!=null)
          {
            val = resultItem[okeys[key]][0];
            attr = resultItem[okeys[key]][1];
            if(val!=null)
            {
              if(hasClass(el,"diff"))
              {
                el.innerHTML = formatDiff(val);
              }
              else if(hasClass(el,"lapTime"))
              {
                el.innerHTML = formatLapTime(val);
              }
              else if(hasClass(el,"laps"))
              {
                el.innerHTML = formatLaps(val);
              }
              else
              {
                if(okeys[key]=="pos")
                {
                  if(resultItem["pos_change"]!=null)
                  {
                    if(resultItem["pos_change"][0]!=null)
                    {
                      ch = resultItem["pos_change"][0];
                      el.className = "resultsCell";
                      if(ch>0)
                      {
                        addClass(el,"posWin");
                      }
                      if(ch<0)
                      {
                        addClass(el,"posLost");
                      }
                    }
                  }
                }
                if(resultItem["competitor_state"]!=null)
                {
                  if(resultItem["competitor_state"][0]==1)
                  {
                    el.className = "resultsCell competitorFinished"
                    var competitorState = competitorStates[competitorId];
                    if(competitorState!=null)
                    {
                      if(!competitorState.finished)
                      {
                        fadeOut(competitorState.marker);
                      }
                      competitorState.finished = true;
                    }
                  }
                }
                if(okeys[key]=="num")
                {
                  if(resultItem["short_class_name"]!=null)
                  {
                    if(resultItem["short_class_name"][0]!=null)
                    {
                      val = val+""+resultItem["short_class_name"][0];
                    }
                  }
                }
                el.innerHTML = val;
              }
            }
            else
            {
              el.innerHTML = "";
            }
            removeClass(el,"personalBest");
            removeClass(el,"totalBest");
            if(attr!=null)
            {
              addClass(el,attr);
            }
          }
        }
      }
    }
  }
  var lastPassings = update["lastPassings"];
  if(lastPassings!=null)
  {
    //console.log(lastPassings);
    lastPassings.forEach(passing => {
      var compId = passing["competitor_id"];
      if(compId!=null)
      {
        var row = resultsTable.querySelector(".compid"+compId);
        cells = row.children;
        var passingType = passing["pass_type"];
        if(passingType!=null)
        {
          el = cells[passingType];
          if(el!=null)
          {
            blink(el);
          }
          if(passingType=="last_lap_time_1")
          {
            var competitorState = competitorStates[compId];
            if(competitorState==null)
            {
              var m = row.querySelector(".marker");
              competitorState = {competitorId:compId,lastHit:Date.now(),lastLapTime:0,marker:m,finished:false};
              competitorStates[compId]=competitorState;
            }
            competitorState.lastLapTime = passing["lapTime"];
            if(competitorState.finished)
            {
              competitorState.lastLapTime = 0;
            }
            else {
              competitorState.marker.style.width="0%";
              rmFadeout(competitorState.marker);
            }
            competitorState.lastHit = Date.now();
          }
        }
        var posChange = passing["posChange"];
        if(posChange!=null)
        {
          el = cells["pos"];
          if(el!=null)
          {
            if(hasClass(el,"competitorFinished")==false)
            {
              el.className = "resultsCell";
              if(posChange>0)
              {
                addClass(el,"posWin");
              }
              else if(posChange<0)
              {
                addClass(el,"posLost");
              }
           }
          }
        }
      }
    });
  }
}

function rmBlink(p)
{
  p.classList.remove("blink");
}
function blink(p)
{
  p.classList.add("blink");
  setTimeout(rmBlink,1000,p);
}
function rmFadeout(p)
{
  p.classList.remove("fadeOut");
}
function fadeOut(p)
{
  p.classList.add("fadeOut");
}

function updateMarkers()
{
  var cts = Date.now();
  for(index in competitorStates)
  {
    var competitorState = competitorStates[index];
    if(competitorState.marker!=null)
    {
      var llt = competitorState.lastLapTime;
      if(llt>0)
      {
        var t = cts - competitorState.lastHit;
        var progress=0;
        if(llt>0)
        {
          if(t>llt)
          {
            fadeOut(competitorState.marker);
            t = llt;
          }
          progress = (t*100.0)/llt;
        }
        competitorState.marker.style.width = progress+"%";
      }
    }
  }
}
