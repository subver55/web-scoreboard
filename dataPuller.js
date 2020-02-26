var scoreboardDataUrl = "http://192.168.1.115:9180/pullData";
/*
var weatherApiKey="0570407c7e38fcc2ea85295dbc50222a";
var weatherUrl = "https://api.darksky.net/forecast/"+weatherApiKey+"/56.168980,37.516783?lang=ru&exclude=daily,alerts,flags,minutely&units=si";
var proxy = "https://cors-anywhere.herokuapp.com/";
var weatherDataUrl = proxy+weatherUrl;*/
var weatherDataUrl = "http://192.168.1.115:9180/pullWeather";
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
    pullData("reload");
    initWeatherWidget();
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

function pullData(param)
{

  urlReq = scoreboardDataUrl;
  if(param!=null)
  {
    urlReq += "?"+param+"&_=" + new Date().getTime();
  }
  else {
    urlReq += "?_=" + new Date().getTime();
  }
  httpReq = new XMLHttpRequest();

  httpReq.onreadystatechange=function(){
    if(httpReq.readyState==4)
    {
      if(httpReq.status==200 )
      {
        //dataUpdated = httpReq.responseText;
        //if(dataUpdated!="")
        if(httpReq.responseText!=="")
        {
          var json = JSON.parse(httpReq.responseText);
          reloadData(json);
        }
      }
      setTimeout(pullData,500);
    }
  }
  httpReq.open("GET",urlReq,true);
  httpReq.timeout = 2000;
  httpReq.withCredentials = true;

  httpReq.send();
}

function reloadData(json)
{
  refresh = json[0];
  update = json[1];
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
      currentRowCount = resultsTableBody.rows.length-1;
      if(currentRowCount>results.length)
      {
          for(i=0;i<currentRowCount-results.length;i++)
          {
            resultsTable.deleteRow(1);
          }
      }
      if(currentRowCount<results.length)
      {
        for(i=currentRowCount;i<results.length;i++)
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
          cells = resultsTableBody.rows[i+1].getElementsByTagName("td");
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
