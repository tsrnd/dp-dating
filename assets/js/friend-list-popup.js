//this function can remove a array element.
Array.remove = function(array, from, to) {
    var rest = array.slice((to || from) + 1 || array.length);
    array.length = from < 0 ? array.length + from : from;
    return array.push.apply(array, rest);
};

//this variable represents the total number of popups can be displayed according to the viewport width
var totalFpopups = 0;

//arrays of popups ids
var Fpopups = [];

//this is used to close a popup
function hiddenFPopup(id) {
    popupHeight = $(`#${id}`).css('height');
    if (popupHeight == '32px') {
        $(`#${id}`).css('height', '400px');
    } else {
        $(`#${id}`).css('height', '32px');
    }
}

function registerFpopup(id) {
    for (var iii = 0; iii < Fpopups.length; iii++) {
        //already registered. Bring it to front.
        if (id == Fpopups[iii]) {
            Array.remove(Fpopups, iii);
            Fpopups.unshift(id);
            calculate_popups();
            return;
        }
    }
    var element = `
    <div class="popup-box-friend-list" id="${id}">
        <div class="popup-head-friend-list" id="btn-popup-head-friend-list" onclick="hiddenFPopup(${id});">
            <div class="popup-head-left-friend-list">Friend</div>
            <div class="popup-head-right-friend-list">
            </div>
            <div style="clear: both"></div>
        </div>
        <div class="popup-messages-friend-list">
        </div>
    </div>`;
    if (localStorage.authToken) {
        // getFriendChat();
    }
    $('body').append(element);
    Fpopups.unshift(id);
    calculateFpopups();
}

//displays the popups. Displays based on the maximum number of popups that can be displayed on the current viewport width
function displayFpopups() {
    var right = 0;

    var iii = 0;
    for (iii; iii < totalFpopups; iii++) {
        if (Fpopups[iii] != undefined) {
            var element = document.getElementById(Fpopups[iii]);
            element.style.right = right + 'px';
            right = right + 320;
            element.style.display = 'block';
        }
    }

    for (var jjj = iii; jjj < Fpopups.length; jjj++) {
        var element = document.getElementById(Fpopups[jjj]);
        element.style.display = 'none';
    }
}

//calculate the total number of popups suitable and then populate the toatal_popups variable.
function calculateFpopups() {
    var width = window.innerWidth;
    if (width < 540) {
        totalFpopups = 0;
    } else {
        width = width - 200;
        //320 is width of a single popup box
        totalFpopups = parseInt(width / 320);
    }

    displayFpopups();
}

//recalculate when window is loaded and also when window is resized.
window.addEventListener('resize', calculateFpopups);
window.addEventListener('load', calculateFpopups);
