'use strict';

/******************************************************************************
 * Handling navbar clicks and updating navbar
 */

/** Show main list of all stories when click site name */

function navAllStories(evt) {
	console.debug('navAllStories', evt);
	hidePageComponents();
	putStoriesOnPage();
}

$body.on('click', '#nav-all', navAllStories);

/** Show login/signup on click on "login" */

function navLoginClick(evt) {
	console.debug('navLoginClick', evt);
	hidePageComponents();
	$loginForm.show();
	$signupForm.show();
}

$navLogin.on('click', navLoginClick);

/** When a user first logins in, update the navbar to reflect that. */

function updateNavOnLogin() {
	console.debug('updateNavOnLogin');
	$('.main-nav-links').show();
	$navLogin.hide();
	$navLogOut.show();
	$navUserProfile.text(`${currentUser.username}`).show();
}

/** Show story submit form on click on "submit" */

function navSubmitStoryClick(evt) {
	console.debug('navSubmitClick', evt);
	$submitStoryForm.show();
}

$navSubmitStory.on('click', navSubmitStoryClick);

/** Show favorited stories list */

function navFavoriteStories(evt) {
	console.debug('navFavoriteStories', evt);
	hidePageComponents();
	putFavoriteStoriesOnPage();
}

$navFavorites.on('click', navFavoriteStories);

/** Show my stories list */

function myStoriesClick(evt) {
	console.debug('navMyStories', evt);
	hidePageComponents();
	putUserStoriesOnPage();
}

$navMyStories.on('click', myStoriesClick);

/** Click on logged in username to view profile */

function navUserProfile() {
	console.debug('navUserProfile');
	hidePageComponents();
	generateUserProfile();
}

$navUserProfile.on('click', navUserProfile);
