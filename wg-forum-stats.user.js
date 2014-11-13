// ==UserScript==
// @name Wargaming.net Forums Player Stats
// @namespace http://moofed.org
// @description Displays statistics for players of Wargaming.net games.
// @version 0.0.11
// @downloadURL https://moofed.org/user.js/wg-forum-stats.user.js
// @grant none
// @require https://ajax.googleapis.com/ajax/libs/jquery/2.1.1/jquery.min.js
// @match http://forum.worldofwarplanes.com/index.php?/topic/*
// ==/UserScript==

this.jQuery = jQuery.noConflict(true);

var applicationID = '1a9527aa13c541208a58009172f7cff9';
var winRateColors = [[0.0, '#FE0E00'], [0.45, '#FE7903'], [0.49, '#F8F400'], [0.51, '#60FF00'], [0.55, '#02C9B3'], [1.01, '#D042F3']];

function jQueryArray() {
  (function(e){var t={};var n=function(e){for(var t=0;t<e.length;t++){if(!(e[t]instanceof Array)){throw new Error("Every argument must be an array!")}}};t.distinct=function(t){if(arguments.length!=1)throw new Error("There must be exactly 1 array argument!");n(arguments);var r=[];for(var i=0;i<t.length;i++){var s=t[i];if(e.inArray(s,r)===-1){r.push(s)}}return r};t.union=function(){if(arguments.length<2)throw new Error("There must be minimum 2 array arguments!");n(arguments);var t=this.distinct(arguments[0]);for(var r=1;r<arguments.length;r++){var i=arguments[r];for(var s=0;s<i.length;s++){var o=i[s];if(e.inArray(o,t)===-1){t.push(o)}}}return t};t.intersect=function(){if(arguments.length<2)throw new Error("There must be minimum 2 array arguments!");n(arguments);var t=[];var r=this.distinct(arguments[0]);if(r.length===0)return[];for(var i=0;i<r.length;i++){var s=r[i];var o=true;for(var u=1;u<arguments.length;u++){var a=arguments[u];if(a.length==0)return[];if(e.inArray(s,a)===-1){o=false;break}}if(o){t.push(s)}}return t};t.except=function(){if(arguments.length<2)throw new Error("There must be minimum 2 array arguments!");n(arguments);var t=[];var r=this.distinct(arguments[0]);var i=[];for(var s=1;s<arguments.length;s++){var o=arguments[s];i=i.concat(o)}for(var s=0;s<r.length;s++){var u=r[s];if(e.inArray(u,i)===-1){t.push(u)}}return t};e.arrayUtilities=t;e.distinct=t.distinct;e.union=t.union;e.intersect=t.intersect;e.except=t.except})(jQuery);
}

function getWowpPlayerData(callback, accountList) {
  jQuery.getJSON("https://api.worldofwarplanes.com/wowp/account/info/",
    {
      fields: 'statistics.battles,statistics.wins',
      application_id: applicationID,
      account_id: accountList
    },
    function(data) {
      callback(data);
    });
}

function buildAccountList() {
  var accountList = jQuery("div.author_info").map( function(i, e) {
    var profileURL = jQuery(e).find("a.name").attr("href");
    var account_id = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
    return account_id;
  }).get();
  return jQuery.distinct(accountList).join(",");
}

function displayWowpStats(data) {
  jQuery("div.author_info").each( function() {
    try {
      var profileURL = jQuery(this).find("a.name").attr("href");
      var account_id = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
      var battlesElement = jQuery(this).find("div.user_details").find("li.battles_count");
      var statsElement = battlesElement.clone();
      var stats = data.data[account_id].statistics;
      var wins = stats.wins;
      var battles = stats.battles;
      var winRate = wins / battles;
      var winRateText = Math.round(winRate*100) + '%';
      var winRateColor = getWinRateColor(winRate);
      statsElement.removeClass('margin-top');
      statsElement.find("span.row_data").text(winRateText);
      statsElement.find("span.row_title").text("wins");
      statsElement.children().css('text-shadow', '0px 0px 10px ' + winRateColor);
      battlesElement.after(statsElement);
    } catch (e) {
      // Display nothing if stats not found.
    }});
}

function getWinRateColor(winRate) {
  var i = -1;
  var color = 'black';
  do {
    i += 1;
    color = winRateColors[i][1];
  } while (winRate >= winRateColors[i][0]);
  return color;
}

jQuery( document ).ready(function() {
  jQueryArray();
  var accountList = buildAccountList();
  getWowpPlayerData(displayWowpStats, accountList);
});