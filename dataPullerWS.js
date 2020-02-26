var scoreboardDataWsUrl = "ws://localhost:10310";
var currentTimeDiv=null;
var resultsDataRow=null;
var resultsTable=null;
var resultsTableBody=null;
var dataUpdated="";
var raceName=null;
var runName=null;
var raceTime = null;
var bestLapName = null;
var bestLapTime = null;
var footerFlags = null;
var wsScoreboard = null;
function connectWs()
{
  wsScoreboard = new WebSocket(scoreboardDataWsUrl);
  wsScoreboard.onopen= function(e){
    var dataSet=["pos","num","short_class_name","pos_change","competitor_state","name",
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
    resultsDataRow = document.getElementById("dataRow").cloneNode();
    resultsDataRow.innerHTML = document.getElementById("dataRow").innerHTML;
    resultsTable = document.getElementById("resultsTable");
    if(resultsTable!=null)
    {
      resultsTable.deleteRow(1);
      resultsTableBody = resultsTable.getElementsByTagName('tbody')[0];
    }
    raceName = document.getElementById("race_name");
    runName  = document.getElementById("run_name");
    raceTime = document.getElementById("race_time");
    bestLapName = document.getElementById("best_lap_name");
    bestLapTime = document.getElementById("best_lap_time");
    footerFlags = document.getElementsByClassName("footerFlags");
    //pullData("reload");
    /*
    if(typeof initWeatherWidget !== "undefined")
    {
      initWeatherWidget();
    }*/
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
        raceName.innerHTML = refresh["eventName"];
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
    if(results!=null)
    {
      console.log(results);
      currentRowCount = resultsTableBody.rows.length-1;
      if(results.length==0)
      {
        while(resultsTableBody.rows.length>1)
        {
          resultsTable.deleteRow(1);
        }
        return;
      }
      var newRowCount = 0;
      for(i=0;i<results.length)
      {
        var pos = results[i]["pos"][0];
        if(pos!=null)
        {
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
          var newRow = resultsTableBody.insertRow(i+1);
          var cells = resultsDataRow.getElementsByTagName("td");
          cells[0].innerHTML = i+1;
          if((i+1)&0x01)
          {
              addClass(newRow,"oddRow");
          }
          else
          {
              removeClass(newRow,"oddRow");
          }
          newRow.innerHTML = resultsDataRow.innerHTML;
        }
      }
      if(results.length>0)
      {
        for(i=0;i<results.length;i++)
        {
          resultItem = results[i];
          okeys = Object.keys(resultItem);
          var pos = resultsItem["pos"][0];
          if(pos==null)
          {
            continue;
          }
          cells = resultsTableBody.rows[pos].getElementsByTagName("td");
          for(key in okeys)
          {
            el = cells[okeys[key]];
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
                        el.className = "";
                        if(ch<0)
                        {
                          el.className = "posWin";
                        }
                        if(ch>0)
                        {
                          el.className = "posLost";
                        }
                      }
                    }
                  }
                  if(resultItem["competitor_state"]!=null)
                  {
                    if(resultItem["competitor_state"][0]==1)
                    {
                      el.className = "competitorFinished"
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
  }
}
