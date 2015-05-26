// Copyright (c) 2014 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.
/**
 * Get the current URL.
 *
 * @param {function(string)} callback - called when the URL of the current tab
 *   is found.
 **/
function getCurrentTabUrl(callback) {
    var queryInfo = {
        active: true,
        currentWindow: true
    };

    chrome.tabs.query(queryInfo, function(tabs) {
        var tab = tabs[0];
        var url = tab.url;
        console.assert(typeof url == 'string', 'tab.url should be a string');
        callback(url);
    });
}

function status(statusText, dangerous) {
    if(typeof dangerous != 'undefined' && dangerous) {
        document.getElementById('alert').className = 'alert danger';
    }
    document.getElementById('status').textContent = statusText;
}

function getUsername(url) {
    url = url.replace('http://www.spigotmc.org/members/', '');
    return url.substring(0, url.lastIndexOf('.'));
}

function checkProfile(url, callback, error) {
    var username = getUsername(url);
    var req = new XMLHttpRequest();
    req.open('GET', 'https://api.github.com/repos/fireflies/blacklist/contents/users/' + username + '.yml');
    req.responseType = 'json';
    req.onload = function() {
        if(req.status === 200) {
            callback(username);
        } else {
            error(username, true);
        }
    };
    req.onerror = function() {
        error(username, false);
    };
    req.send();
}
document.addEventListener('DOMContentLoaded', function() {
    getCurrentTabUrl(function(url) {
        if(url.indexOf('www.spigotmc.org/members/') == -1) {
            status('Not a Spigot profile', true);
            return;
        }

        status('Looking up user..');
        checkProfile(url, function(username) {
            status('Be careful dealing with ' + username + '!', true);
        }, function(username, success) {
            if(success) {
                status(username + ' is clean!');
            } else {
                status('Unable to connect to repository :(', true);
            }
        });
    });
});