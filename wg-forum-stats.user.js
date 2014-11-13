// ==UserScript==
// @name Wargaming.net Forums Player Stats
// @namespace http://moofed.org
// @description Displays statistics for players of Wargaming.net games.
// @version 0.0.1
// @updateURL https://moofed.org/user.js/wg-forum-stats.user.js
// @grant unsafeWindow
// @require http://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js
// @match http://forum.worldofwarplanes.com/index.php?/topic/*
// ==/UserScript==

this.jQuery = jQuery.noConflict(true);
var applicationID = '1a9527aa13c541208a58009172f7cff9';

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
  return jQuery("span.author").map( function(i, e) {
    var profileURL = jQuery(e).find("a.name").attr("href");
    var account_id = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
    return account_id;
  }).get().join(",");
}

function displayWowpStats(data) {
  jQuery("span.author").each( function() {
    var profileURL = jQuery(this).find("a.name").attr("href");
    var account_id = profileURL.match(/^https?:\/\/.*\w+-(\d+)\/$/)[1];
    var battlesElement = jQuery(this).parents("div.post_block").find("div.user_details").find("li.battles_count");
    var statsElement = battlesElement.clone();
    var stats = data.data[account_id].statistics
    var wins = stats.wins;
    var battles = stats.battles;
    var winRate = wins / battles;
    var winRateText = Math.round(winRate*100) + '%';
    statsElement.find("span.row_data").text(winRateText);
    statsElement.find("span.row_title").text("Wins");
    battlesElement.after(statsElement);
  });
}

jQuery( document ).ready(function() {
  var accountList = buildAccountList();
  getWowpPlayerData(displayWowpStats, accountList);
});