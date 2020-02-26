var weatherUrl = weatherDataUrl;
function formatTemperature(val)
{
  tval = Math.round(val);
  if(tval>0)
  {
    tval = "+"+tval;
  }
  tval = tval+"°";
  return tval;
}
function formatTime(val)
{
  // Create a new JavaScript Date object based on the timestamp
  // multiplied by 1000 so that the argument is in milliseconds, not seconds.
  var date = new Date(val*1000);
  // Hours part from the timestamp
  var hours = date.getHours();
  // Minutes part from the timestamp
  var minutes = "0" + date.getMinutes();
  // Seconds part from the timestamp
  var seconds = "0" + date.getSeconds();

  // Will display time in 10:30:23 format
  var formattedTime = hours + ':' + minutes.substr(-2) ;
  return formattedTime;
}
function reloadWeather(json)
{
  if(json["currently"]!=null)
  {
    tVal = document.getElementById("currentTemperature");
    if(tVal!=null)
    {
      tVal.innerText = formatTemperature(json["currently"]["temperature"]);
    }
    tVal = document.getElementById("currentDescription");
    if(tVal!=null)
    {
      tVal.innerText = json["currently"]["summary"];
    }
    tVal = document.getElementById("currentIcon");
    if(tVal!=null)
    {
      tVal.className = "forecastIcon "+json["currently"]["icon"];
    }
  }
  if(json["hourly"]!=null)
  {
    for(i=0;i<json["hourly"]["data"].length;i++)
    {
      dataPoint = json["hourly"]["data"][i];
      var fTime = new Date(dataPoint["time"]*1000);
      var ct = new Date();
      if(fTime.getHours()>ct.getHours())
      {
        var b=i;
        for(i=b;i<b+3 && i<json["hourly"]["data"].length;i++)
        {
          dataPoint = json["hourly"]["data"][i];
          tVal = document.getElementById("forecastTemperature"+(i-b));
          if(tVal!=null)
          {
            tVal.innerText = formatTemperature(dataPoint["temperature"]);
          }
          tVal = document.getElementById("forecastDescription"+(i-b));
          if(tVal!=null)
          {
            tVal.innerText = dataPoint["summary"];
          }
          tVal = document.getElementById("forecastIcon"+(i-b));
          if(tVal!=null)
          {
            tVal.className = "forecastIcon "+dataPoint["icon"];
          }
          tVal = document.getElementById("forecastTime"+(i-b));
          if(tVal!=null)
          {
            tVal.innerText = formatTime(dataPoint["time"]);
          }
        }
        break;
      }
    }
  }
}
var lastWeatherReload=0;
function checkWeatherReload()
{
  loadWeatherForecast();
}
var jsonForecast;
function refreshForecast()
{
  reloadWeather(jsonForecast);
}
function initWeatherWidget()
{
  loadWeatherForecast();
  setInterval(checkWeatherReload,5*60*1000);
  setInterval(refreshForecast,5000);
}
function loadWeatherForecast()
{
//  url = proxy+weatherUrl+"&_=" + new Date().getTime();
  var url = weatherUrl+"?_="+new Date().getTime();
  var XHR = ("onload" in new XMLHttpRequest()) ? XMLHttpRequest : XDomainRequest;

  var httpReq = new XHR();
//  httpReq = new XMLHttpRequest();

  httpReq.onreadystatechange=function(){
    if(httpReq.readyState==4)
    {
      if(httpReq.status==200 )
      {
        //dataUpdated = httpReq.responseText;
        //if(dataUpdated!="")
        if(httpReq.responseText!=="")
        {
          jsonForecast = JSON.parse(httpReq.responseText);
          reloadWeather(jsonForecast);
        }
      }
      else {
        setTimeout(loadWeatherForecast,5000);
      }
    }
  }
  httpReq.open("GET",url,true);
  httpReq.timeout = 15000;
  httpReq.send();
}
