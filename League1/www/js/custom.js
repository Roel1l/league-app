var champions;
var panel = '<div data-role="panel" data-theme="b" id="mypanel" data-position="left" data-display="push" class="custompanel"> <div data-role="header"> <h1><span class="panel"></h1> </div> <div data-role="main" class="ui-content"> <a href="homepage.html" class="ui-btn"><span class="homePage"></a> <a href="mychampions.html" class="ui-btn"><span class="myChampions"></a> <a href="allchampions.html" class="ui-btn"><span class="allChampions"></a>  <a href="profile.html" class="ui-btn"><span class="profile"></a><a href="settings.html" class="ui-btn"><span class="settings"></a></div> </div>';
var detailID;
var globalTheme = getTheme();

$(document).one('pagebeforecreate', function () {
	$.mobile.pageContainer.prepend(panel);
	$("#mypanel").panel().enhanceWithin();
});

$(document).ready(function () {
	console.log("ready fired");
});

$(document).on("mobileinit", function () {
	console.log("mobileinit fired");
	fillChampions();

	$.mobile.changeGlobalTheme = function (theme) {
		// These themes will be cleared, add more
		// swatch letters as needed.
		var themes = " a b c d e";

		// Updates the theme for all elements that match the
		// CSS selector with the specified theme class.
		function setTheme(cssSelector, themeClass, theme) {
			$(cssSelector)
			.removeClass(themes.split(" ").join(" " + themeClass + "-"))
			.addClass(themeClass + "-" + theme)
			.attr("data-theme", theme);
		}

		// Add more selectors/theme classes as needed.
		setTheme(".ui-mobile-viewport", "ui-overlay", theme);
		setTheme("[data-role='page']", "ui-body", theme);
		setTheme("[data-role='header']", "ui-bar", theme);
		setTheme("[data-role='listview'] > li", "ui-bar", theme);
		setTheme(".ui-btn", "ui-btn-up", theme);
		setTheme(".ui-btn", "ui-btn-hover", theme);
	};

});

$(document).on("pageshow", "#loginpage", function () {
    $.mobile.changePage("homepage.html");
});

$(document).on("pageshow", "#homepage", function () {
	$('.inapp').on('tap', function () {
		window.open('http://leagueoflegends.com', '_blank', 'location=yes');
	});
});

document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
    $(document).on("pageshow", function() {
        getLanguage();
    });
}

$(document).on("pagebeforechange", function () {
	$.mobile.changeGlobalTheme(globalTheme);
});	

$(document).on("pagebeforeshow", function () {
	$('.toast').hide();
});



$(document).on("pageinit", "#settings", function () {
	var i = localStorage.getItem("theme");
	if (i != undefined) {
		$('#themeselect').val(i).change();
	} else {
		$('#themeselect').val('standard');
	}

	$("#themeselect").change(function () {
		localStorage.setItem("theme", $('#themeselect').val());
		globalTheme = getTheme();
	});
	
	$('.option').on('tap', function(){
		refreshPage();
	});
	
	$(function(){
		$( "#settings" ).on( "swipeleft", swipeleftHandler );
 
		function swipeleftHandler( event ){
			$.mobile.changePage( "status.html", {
				transition: "slide"

			});
		}
	});

});

$(document).on("pageinit", "#status", function () {
	var status = localStorage.getItem("status");
	
	$('#stat').val(status);
	
	$('#stat').on('keyup', function(){
		localStorage.setItem("status", $(this).val());
	});
	
	$(function(){
		$( "#status" ).on( "swiperight", swiperightHandler );
 
		function swiperightHandler( event ){
			$.mobile.changePage( "settings.html", {
				transition: "slide",
				reverse: true
			});
		}
	});
});

$(document).on("pageinit", "#profile", function () {
	console.log("before pageshow profile");
	var picture = localStorage.getItem("profilepicture");
	if (picture != undefined) {
		$("#cameraPic").attr("src", picture);
	}

	$('#cameraPic').on('tap', function () {
		capturePhoto();
	});
		
	searchAllContacts();
});

$(document).on("pagebeforeshow", "#details", function () {
	$('.detailID').text(champions[detailID].name + " details");
	$('.attack').text(champions[detailID].info.attack);
	$('.defense').text(champions[detailID].info.defense);
	$('.magic').text(champions[detailID].info.magic);
	$('.difficulty').text(champions[detailID].info.difficulty);
});

$(document).on("pagebeforeshow", "#allchampions", function () {
	console.log("pagebeforeshow allchampions");
	loadAllChampionList(champions);

	$(".plus-sign").on("tap", function () {
		addChampToList($(this).attr('id'));
		$('.toast').fadeIn(500).delay(500).fadeOut(500);
		$(this).fadeOut(1000);
	});

	$(".info").on("tap", function () {
		detailID = $(this).attr("id").substring(4);
		$.mobile.pageContainer.pagecontainer("change", "championdetails.html", {
			transition : "slide",
			changeHash : true,
		});
	});

	$('.ui-icon-delete').on('tap', function () {
		loadAllChampionList(champions);
	});

});

$(document).on("pagebeforeshow", "#mychampions", function () {
	console.log("pagebeforeshow mychampions");
	loadMyChampionList();

	//make list sortable
	$("#sortable").sortable({
		'containment' : 'parent',
		'opacity' : 0.9,
	});
	$("#sortable").disableSelection();
	//<!-- Refresh list to the end of sort to have a correct display -->
	$("#sortable").bind("sortstop", function (event, ui) {
		$('#sortable').listview('refresh');
		rewriteChampList();
	});

	//delete champ from list
	$(".min-sign").on("tap", function () {
		$(this).css("color", "#FF0000");
		$('.toast').fadeIn(500).delay(500).fadeOut(500);
		removeChampFromList($(this).attr('id'));
		$("#li" + $(this).attr('id')).hide();
	});
});

//----------------------------------------------------Losse functies-----------------------------------------------------------------\\

function fillChampions() {
	var champFilled = JSON.parse(localStorage.getItem("champions"));
	var lastCheck = localStorage.getItem("TimesNotUpdated");

	if (champFilled != undefined && lastCheck < 5) {
		champions = champFilled;
		lastCheck++;
		localStorage.setItem("TimesNotUpdated", lastCheck);
	} else {
		$.ajax({
			url : 'http://ddragon.leagueoflegends.com/cdn/6.5.1/data/en_US/champion.json',
			success : function (result) {
				champions = result.data;
				localStorage.setItem("champions", JSON.stringify(result.data));
				localStorage.setItem("TimesNotUpdated", 0);
			},
			error : function (request, status, errorThrown) {
				console.log("Ajax call error! Request: " + request + " status: " + status + " errorThrown: " + errorThrown);
			}
		});
	}

	var myChampionList = JSON.parse(localStorage.getItem("myChampionList"));
	if (myChampionList === null) { //If champlist does not exist yet
		localStorage.setItem("myChampionList", JSON.stringify([]));
		myChampionList = JSON.parse(localStorage.getItem("myChampionList"));
	}
}

function rewriteChampList() {
	var array = [];
	$('.mychamplist li').each(function () {
		array.push($(this).attr("id").slice(2));
	});
	localStorage.setItem("myChampionList", JSON.stringify(array));
}

function addChampToList(champID) {
	var myChampionList = JSON.parse(localStorage.getItem("myChampionList"));
	if (myChampionList === null) { //If champlist does not exist yet
		localStorage.setItem("myChampionList", JSON.stringify([]));
		myChampionList = JSON.parse(localStorage.getItem("myChampionList"));
	}

	if (myChampionList.indexOf(champID) == -1) {
		myChampionList.push(champID);
		localStorage.setItem("myChampionList", JSON.stringify(myChampionList));
	}
}

function removeChampFromList(champID) {
	var myChampionList = JSON.parse(localStorage.getItem("myChampionList"));

	for (var i = myChampionList.length - 1; i >= 0; i--) {
		if (myChampionList[i] === champID) {
			myChampionList.splice(i, 1);
		}

		localStorage.setItem("myChampionList", JSON.stringify(myChampionList));
	}
}

function loadAllChampionList(listToLoad) {
	$('.chmplist').empty();
	var bgimageUrl = "img/";
	var myChampionList = JSON.parse(localStorage.getItem("myChampionList"));

	if (listToLoad != undefined) {
		for (var c in listToLoad) {
			var name = listToLoad[c].name;
			var id = listToLoad[c].id;
			var bgposition = "-" + listToLoad[c].image.x + "px -" + listToLoad[c].image.y + "px ";
			var imageSprite = listToLoad[c].image.sprite;
			var inMyChampList = '';

			if (myChampionList.indexOf(id) == -1) {
				inMyChampList = '<div class="ui-btn ui-btn-inline plus-sign" id="' + id + '"><i class="fa fa-plus fa-3x"></i></div>';
			}

			$(".chmplist").append('<li class="champli">' + name + '<img class="champs img' + id + '"></img>' + inMyChampList + '<div id="info' + id + '"class="ui-btn ui-btn-inline info"><i class="fa fa-info fa-3x"></i></div></li>');
			$(".img" + id).css("background-image", "url(" + bgimageUrl + imageSprite + ")");
			$(".img" + id).css("background-position", bgposition);
		}
		$('.chmplist').listview('refresh');
	}
}

function loadMyChampionList() {
	$('.mychamplist').empty();
	var bgimageUrl = "img/";
	var myChampionList = JSON.parse(localStorage.getItem("myChampionList"));

	if (champions != undefined) {
		for (var c in myChampionList) {

			var name = champions[myChampionList[c]].name;
			var id = champions[myChampionList[c]].id;
			var bgposition = "-" + champions[myChampionList[c]].image.x + "px -" + champions[myChampionList[c]].image.y + "px ";
			var imageSprite = champions[myChampionList[c]].image.sprite;

			if (myChampionList.indexOf(id) != -1) {
				$(".mychamplist").append('<li class="champli" id="li' + id + '">' + name + '<img class="champs img' + id + '"></img><div class="min-sign ui-btn ui-btn-inline" id="' + id + '"><i class="fa fa-minus fa-3x"></i></div></li>');
				$(".img" + id).css("background-image", "url(" + bgimageUrl + imageSprite + ")");
				$(".img" + id).css("background-position", bgposition);
			}
		}
		$('.mychamplist').listview('refresh');
	}
}

function getTheme() {
	var i = localStorage.getItem("theme");
	if (i == 'special') {
		return 'c'
	} else {
		return 'a'
	}
}

function refreshPage() {
	jQuery.mobile.changePage(window.location.href, {
		allowSamePageTransition : true,
		transition : 'none',
		reloadPage : true
	});
}

//----------------------------------------------------Native functies-----------------------------------------------------------------\\

function capturePhoto() {
	navigator.camera.getPicture(uploadPhoto, onError, {
		sourceType : 1,
		quality : 60
	});
}

function uploadPhoto(data) {
	localStorage.setItem("profilepicture", data);
	$("#cameraPic").attr("src", data);
}

function searchAllContacts() {
	$("#emptyloader").append('<div class="loader">Loading...</div>');
	navigator.contacts.find([navigator.contacts.fieldType.displayName], onSuccess, onError);
}

function onSuccess(contacts) {
	for (var i = 0; i < contacts.length; i++) {
		if (contacts[i].displayName != undefined) {

			$(".contactlist").append('<li class="champli">' + contacts[i].displayName + '<a class = "ui-btn" href="sms:' + contacts[i].phoneNumbers[0].value + '?body=doe mee potta" ><span class="invite"></a></li>');

		}
	}
	$('.contactlist').listview('refresh');
	$('.loader').remove();
}

function onError(contactError) {
	alert('Foto maken geannuleerd!');
}

//----------------------------------------------------Taal functies-----------------------------------------------------------------\\

function getLanguage() {     
    navigator.globalization.getPreferredLanguage(onLanguageSucces, onLanguageError);
}

function onLanguageSucces(language)
{
    switch (language.value) 
    {
    case "nl-NL":
        setDutch();           
        break;
    default :
        setEnglish();
        break;
    }
}

function onLanguageError()
{
    alert('Error getting language');
}

function setDutch()
{
    //all Pages
    $(".panel").html("Paneel");
    $(".homePage").html("Homepagina");
    $(".myChampions").text("Mijn kampioenen");
    $(".allChampions").html("Alle kampioenen");
    $(".championDetails").html("Kampioen details");
    $(".profile").html("Profiel");
    $(".settings").html("Instellingen");
    $(".footer").html("Voeter");            
    //Index
    $(".welcome").html("Welkom");
    $(".officialLeagueOfLegendsSite").html("Officiele League of Legends website");
    //MyChampions
    $(".championRemoved").html("Kampioen verwijderd");
    //AllChampions
    $(".championAdded").html("Kampioen toegevoegd");
    //ChampionDetails
    $(".attackPower").html("Aanvalskracht");
    $(".magicPower").html("Magie");
    $(".defensePower").html("Verdediging");
    $(".difficultyLevel").html("Moeilijkheidsgraad");
    //Settings
    $(".settingsWillActivateWhenChangingPage").html("Instelling worden aangepast bij het veranderen van de pagina");
    $(".applicationTheme").html("Applicatie thema");
    //profile
    $(".invite").html("Uitnodigen");
}

function setEnglish()
{
    //all Pages
    $(".panel").html("Panel");
    $(".homePage").html("Homepage");
    $(".myChampions").text("My Champions");
    $(".allChampions").html("All Champions");
    $(".championDetails").html("Champion Details");
    $(".profile").html("Profile");
    $(".settings").html("Settings");
    $(".footer").html("Footer");            
    //Index
    $(".welcome").html("Welcome");
    $(".officialLeagueOfLegendsSite").html("Official League of Legends Site");
    //MyChampions
    $(".championRemoved").html("Champion Removed");
    //AllChampions
    $(".championAdded").html("Champion Added");
    //ChampionDetails
    $(".attackPower").html("Attack");
    $(".magicPower").html("Magic");
    $(".defensePower").html("Defense");
    $(".difficultyLevel").html("Difficulty");
    //Settings
    $(".settingsWillActivateWhenChangingPage").html("Settings Will Activate When Changing the Page");
    $(".applicationTheme").html("Application theme");
    // $(".standard").html("standard");
    // $(".special").html("special");
    //profile
    $(".invite").html("Invite");
}