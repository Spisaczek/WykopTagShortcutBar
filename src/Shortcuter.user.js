// ==UserScript==
// @name         Shortcuter
// @namespace    http://tampermonkey.net/
// @version      0.3
// @description  Dodaje pasek ze skrótami do ulubionych tagów (te można dodawać z poziomu strony tagu).
// @author       Kamil Spisak
// @match        http://www.wykop.pl/*
// @run-at       document-end
// @grant        GM_getValue
// @grant        GM_setValue
// @grant        GM_registerMenuCommand
// @require      http://code.jquery.com/jquery-latest.js
// ==/UserScript==

$(document).ready(onReady());

function onReady(){
    var sCutsArray = [];
    prepareBar();
    createAddShortcutButton();
    loadShortcutsFromStorage();
    prepareTrash();
}

//OnLoad Stuff
function prepareBar(){
    var bottomBar = $("<div></div>");
    bottomBar.attr('id', 'bottomBar');
    bottomBar.addClass('wrapper');
    bottomBar.css('margin', '5px auto 5px auto');

    var line = $("<ul></ul>");
    bottomBar.append(line);

    $('#nav').prepend(bottomBar);

    // Dodanie paddingu by baner nawigacji nie przysłaniał innych elementów strony (teraz jest większy niż normalnie)
    $('#site').css('padding-top', '79px');
}

function prepareTrash(){
    var trash = $("<a></a>").text('USUŃ');
    trash.attr('id', 'trash');
    trash.addClass('tag').addClass('create').addClass('create');
    trash.css('display', 'inline');
    trash.css('margin', '10px');
    trash.css('color', '#c0392b');    
    trash.on("dragover", function(event){ allowDrop(event); });
    trash.on("drop", function(event){ drop(event); });
    trash.hide();

    $('#bottomBar > ul').append(trash);
}

// Add shortcut
function createAddShortcutButton(){
    var btn = $("<a></a>").text('Dodaj do skrótów');
    btn.addClass('button');
    btn.click(addShortcutOnClick);

    $('.media-helpers-wrapper').prepend(btn);
}

function addShortcutOnClick(){
    var name = $('#input-tag').val();
    createShortcut(name);
    saveShortcut(name);
}


// Shortcuts manager
function createShortcut(name){
    var sCut = $("<li></li>");
    sCut.attr('id', name);
    sCut.addClass('tag').addClass('create').addClass('create');
    sCut.css('display', 'inline');
    sCut.css('margin', '10px');

    var a = $("<a></a>").text('#' + name);
    a.attr("id", name);
    a.attr("href", 'http://www.wykop.pl/tag/wpisy/' + name + '/');
    sCut.append(a);

    // Draggable
    sCut.attr('draggable', 'true');
    sCut.on('dragstart', function(event){ drag(event); });   
    sCut.on('dragend', function(event){ dragend(event); });
    sCut.on("dragover", function(event){ allowDrop(event); });
    sCut.on('drop', function(event){ dropSwitch(event); });

    // Dodanie skrótu do listy
    $('#bottomBar > ul').append(sCut);
}

// Storage stuff
function loadShortcutsFromStorage(){
    var sCutsList = GM_getValue("sCutList", "");
    console.log('Load after: ' + sCutsList);
    sCutsArray = sCutsList.split(",").filter(function(el) {return el.length !== 0;});
    if(sCutsArray.length > 0){
        sCutsArray.map( function(item) { createShortcut(item); } );
    }
}

function saveShortcut(name){
    sCutsArray.push(name);
    console.log('Save after: ' + sCutsArray);
    GM_setValue("sCutList", sCutsArray.join());
}

function deleteShortcut(name){
    console.log('Delete before (' + name + '): ' + sCutsArray);
    sCutsArray.splice(sCutsArray.indexOf(name), 1);
    console.log('Delete after: ' + sCutsArray);
    GM_setValue("sCutList", sCutsArray.join());
}

// Draggable

// Domyslna akcja
function allowDrop(event) {
    event.preventDefault();
}

function dragend(event) {
    log('Trash is hidding!');
    $('#trash').hide();
}

// Gdy chwycony
function drag(event) {
    $('#trash').show();
    log('Drag id:' + event.target.id);
    event.originalEvent.dataTransfer.setData("scut_id", event.target.id);
}

// Gdy upuszczony
function drop(event) {
    event.preventDefault();
    var id = event.originalEvent.dataTransfer.getData("scut_id");
    log('Drop id ' + id + ' on id: ' + event.target.id);
    if(event.target.id == 'trash'){
        deleteShortcut(id);
        $('#'+id).remove();
        $('#trash').hide();
    }
}

function dropSwitch(event){
    event.preventDefault();
    var id = event.originalEvent.dataTransfer.getData("scut_id");
    var element1 = $('#' + id);
    var element2 = $('#' + event.target.id);
    var copy = element2.clone();

    // Zamiana miejsc elementow na stronie
    log('Drop id ' + element1.attr('id') + ' ' + element1.prop("tagName") + ' on id: ' + element2.attr('id') + ' ' + element2.prop("tagName"));
    element2.replaceWith(element1.clone());
    element1.replaceWith(copy);

    // Zamiana kolejnosci na zapamietywanej liscie
    console.log('Switch save before: ' + sCutsArray);
    var index1 = sCutsArray.indexOf(element1.attr('id'));
    var index2 = sCutsArray.indexOf(element2.attr('id'));
    var tmp = sCutsArray[index2];
    console.log('Index1: ' + index1 + 'Index2: ' + index2 + 'Switch tmp: ' + tmp);
    sCutsArray[index2] = sCutsArray[index1];
    sCutsArray[index1] = tmp;
    console.log('Switch save after: ' + sCutsArray);
    GM_setValue("sCutList", sCutsArray.join());
}

// Utils

function log(text){
    console.log(text);
}







