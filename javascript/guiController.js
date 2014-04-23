var aboutShown = false;
var menuShown = false;

function toggleAboutMenu() {
    if(!aboutShown) {
        overlay = document.getElementById('overlay');
        overlay.innerHTML += '<div id="aboutContent">' +
            '<h3>About</h3>' +
            '<p>City Watch is an application that plots all the 911 calls made in Monroe County. When generating the heatmap the population density is considered. You can filter the results by clicking the menu button in the right corner.</p>' +
            '<h3>Developers</h3>' +
            '<p>Eric Lee</p>' +
            '<p>Liam Middlebrook</p>' +
            '<h3>Credits</h3>' +
            '<p>Menu by David Vickhoff from The Noun Project</p>' + 
            '<p>Castle by Chris Luders from The Noun Project</p>' +
            '</div>';
    }
    else {
        aboutPage = document.getElementById('aboutContent');
        aboutPage.style.animationName = 'aboutOut';
        aboutPage.style.webkitAnimationName = 'aboutOut';
        aboutPage.style.animationDuration = '1.5s';
        aboutPage.style.webkitAnimationDuration = '1.5s';
        
        aboutPage.addEventListener('webkitAnimationEnd', function() {
            aboutPage = document.getElementById('aboutContent');
            aboutPage.parentElement.removeChild(aboutPage);
        });
        aboutPage.addEventListener('animationend', function() {
            aboutPage = document.getElementById('aboutContent');
            aboutPage.parentElement.removeChild(aboutPage);  
        });
    }
    aboutShown = !aboutShown;
}

function fadeOut(el) {
    el.style.transition = 'opacity 1.5s ease';
    el.style.webkitTransition = 'opacity 1.5s ease';
    var fadeOutObject = el;
    var fadOutComplete = function(event) {
        fadeOutObject.style.display = 'none';
    }
    el.addEventListener('webkitTransitionEnd', fadOutComplete, false);
    el.addEventListener('transitionend', fadOutComplete, false);
    el.addEventListener('oTransitionEnd', fadOutComplete, false);
    el.style.opacity = '0';
}

function toggleMenu() {
    menuBox = document.getElementById('menuBox');
    contentPane = document.getElementById('content');
    if(!menuShown)
        contentPane.style.right = menuBox.offsetWidth + 'px';
    else
        contentPane.style.right = '0px'
    
    if(window.location.hash != '#markers')
        spinMenuImage();
        
    menuShown = !menuShown; 
}

function checkBoxClicked(el) {
    agency = el.name;
    selectedAgencies[agency] = el.checked;
    
    label = document.getElementById(agency + 'CheckboxLabel');
    if(!el.checked)
        label.style.borderColor = '#ddd';
    else
        label.style.borderColor = getColorForAgency(agency);
}

function applyMenuButtonClicked() {
    data = getFilteredData();
    refreshMapForHash(data);
}

function spinMenuImage() {
    menuImage = document.getElementById('headerMenuButton');
    
    if(!menuShown) {
        menuImage.style.animationName = 'counterSpin';
        menuImage.style.webkitAnimationName = 'counterSpin';
    }
    else {
        menuImage.style.animationName = 'clockSpin';
        menuImage.style.webkitAnimationName = 'clockSpin';
    }
    menuImage.style.webkitAnimationDuration = '1s';
    menuImage.style.animationDuration = '1s';
    
    menuImage.addEventListener('webkitAnimationEnd', function() {
       menuImage = document.getElementById('headerMenuButton');
       menuImage.style.webkitAnimationName = ''; 
    });
    menuImage.addEventListener('animationEnd', function() {
        menuImage = document.getElementById('headerMenuButton');
        menuImage.style.animationName = '';   
    });
}

function menuAddItems(items) {
    menuBox = document.getElementById('menuBox');
    
    appendHTML = '<form style="margin: 25px;">';
    for(i = 0; i < items.length; i++) {
        appendHTML += buildMenuCheckBox(items[i]);
        selectedAgencies[items[i]] = true;
    }
    appendHTML += '</form>';
    menuBox.innerHTML += appendHTML;
}

function buildMenuCheckBox(title) {
    return '<div class="menuCheckbox">' + 
        '<input type="checkbox" checked="checked" id="' + title + 'checkbox" value="1" name="' + title + '" onClick="checkBoxClicked(this)"/>' +
        '<label id="' + title + 'CheckboxLabel" style="border-color: ' + getColorForAgency(title) + '" for="' + title + 'checkbox"></label>' + 
        '<p>' + title + '</p>' +
        '</div>';
}

function getColorForAgency(agency) {
    switch(agency) {
        case 'Police':
            return '#0062E3';
        case 'Fire':
            return '#e83600';
        case 'Ambulance':
            return 'green';
        case 'Trafic':
            return '#facb04';
        default:
            return 'black';
    }
}