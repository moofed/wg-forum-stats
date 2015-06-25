// ==UserScript==
// @name Wargaming.net Forums Player Stats
// @namespace http://moofed.org
// @description Displays statistics for players of Wargaming.net games.
// @version 0.3.6
// @grant none
// @downloadURL https://moofed.org/user.js/wg-forum-stats.user.js
// @match http://forum.worldofwarplanes.com/index.php?/topic/*
// @match http://forum.worldoftanks.com/index.php?/topic/*
// ==/UserScript==

var applicationID = '1a9527aa13c541208a58009172f7cff9';
var winRateColors = [[0.0, '#FE0E00'], [0.465, '#FE7903'], [0.485, '#F8F400'], [0.515, '#60FF00'], [0.565, '#02C9B3'], [0.645, '#D042F3'], [1.0, '#DEADBEEF']];

// select a list of matching elements, context is optional
function $(selector, context) {
  return (context || document).querySelectorAll(selector);
}

// select the first match only, context is optional
function $1(selector, context) {
  return (context || document).querySelector(selector);
}

function onlyUnique(value, index, self) {
  return self.indexOf(value) === index;
}

function round(value, decimals) {
  return Number(Math.round(value+'e'+decimals)+'e-'+decimals);
}

function getCORS(url, success) {
  var xhr = new XMLHttpRequest();
  xhr.open('GET', url);
  xhr.onload = success;
  xhr.send();
  return xhr;
}

function getWowpPlayerData(callback, accountList) {
  var url = "https://api.worldofwarplanes.com/wowp/account/info/" +
    "?application_id=" + applicationID +
    "&fields=statistics.battles,statistics.wins" +
    "&account_id=" + accountList;
  getCORS(url, function(request) {
    var response = request.currentTarget.response || request.target.responseTetxt;
    callback('Planes', JSON.parse(response));
  });
}

function getWotPlayerData(callback, accountList) {
  var url = "https://api.worldoftanks.com/wot/account/info/" +
    "?application_id=" + applicationID +
    "&fields=statistics.all.battles,statistics.all.wins" +
    "&account_id=" + accountList;
  getCORS(url, function(request) {
    var response = request.currentTarget.response || request.target.responseTetxt;
    callback('Tanks', JSON.parse(response));
  });
}

function buildAccountList() {
  var accountList = $("div.author_info")
  var accountIds = [];
  Array.prototype.forEach.call(accountList, function(item) {
    var profileURL = $1("a.name", item).getAttribute("href");
    var accountId = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
    accountIds.push(accountId);
  });
  return accountIds.join(',');
  //return accountIds.filter(onlyUnique).join(',');
  //return Array.prototype.filter.call(accountList, onlyUnique).join(",");
}

function displayStats(label, data) {
  var authorDivs = $("div.author_info");
  Array.prototype.forEach.call(authorDivs, function(item) {
    try {
      var profileURL = $1("a.name", item).getAttribute("href");
      var account_id = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
      var battlesElement = $1("div.user_details li.battles_count", item);
      var statsElement = battlesElement.cloneNode(true);
      var stats = data.data[account_id].statistics;
      if (stats.all != undefined) {
        // Workaround for WoT having multiple statistics types.
        stats = stats.all;
      }
      var wins = stats.wins;
      var battles = stats.battles;
      var winRate = wins / battles;
      var winRateText = round(winRate*100, 1) + '%';
      var winRateColor = getWinRateColor(winRate);
      statsElement.classList.remove('margin-top');
      $1("span.row_data", statsElement).textContent = winRateText;
      $1("span.row_title", statsElement).textContent = label + " wins";
      Array.prototype.forEach.call(statsElement.children, function(styleItem) {
        styleItem.style['text-shadow'] = '0px 0px 10px ' + winRateColor;
      });
      statsElement.setAttribute('title', battles + ' battles');
      battlesElement.parentElement.insertBefore(statsElement, battlesElement.nextSibling);
    } catch (e) {
      // Display nothing if stats not found.
      console.log(e);
    }});
}

function getWinRateColor(winRate) {
  var i = -1;
  var color = 'black';
  do {
    i += 1;
    color = winRateColors[i][1];
  } while (winRate >= winRateColors[i+1][0]);
  return color;
}

function run() {
  var accountList = buildAccountList();
  getWotPlayerData(displayStats, accountList)
  getWowpPlayerData(displayStats, accountList);
}

// in case the document is already rendered
if (document.readyState!='loading') run();
// modern browsers
  else if (document.addEventListener) document.addEventListener('DOMContentLoaded', run);
// IE <= 8
  else document.attachEvent('onreadystatechange', function(){
    if (document.readyState=='complete') run();
});