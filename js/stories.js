'use strict';

// This is the global list of the stories, an instance of StoryList
let storyList;

/** Get and show stories when site first loads. */

async function getAndShowStoriesOnStart() {
	storyList = await StoryList.getStories();
	$storiesLoadingMsg.remove();

	putStoriesOnPage();
}

/**
 * A render method to render HTML for an individual Story instance
 * - story: an instance of Story
 *
 * Returns the markup for the story.
 */

function generateStoryMarkup(story, removeIcon = false) {
	// console.debug("generateStoryMarkup", story);

	const hostName = story.getHostName();

	// only show favorite icon if user is logged in
	const showLoggedInIcons = Boolean(currentUser);

	return $(`
  <li id="${story.storyId}">
	      ${removeIcon ? generateRemoveIcon() : ''}
        ${showLoggedInIcons ? generateFavoriteIcon(currentUser, story) : ''}
        <a href="${story.url}" target="a_blank" class="story-link">
          ${story.title}
        </a>
        <small class="story-hostname">(${hostName})</small>
        <small class="story-author">by ${story.author}</small>
        <small class="story-user">posted by ${story.username}</small>
      </li>
    `);
}

/** Generate favorite icon html */

function generateFavoriteIcon(user, story) {
	// check if story is favorited
	const isFavorite = user.isFavorite(story);
	// update star with fontawesome class
	const star = isFavorite ? 'fas' : 'far';

	// return markup with star icon
	return `
    <span class="favorite">
      <i class="${star} fa-star"></i>
    </span>`;
}

/** Generate remove icon html */

function generateRemoveIcon() {
	return `
    <span class="remove">
      <i class="fas fa-trash-alt"></i>
    </span>`;
}

/** Gets list of stories from server, generates their HTML, and puts on page. */

function putStoriesOnPage() {
	console.debug('putStoriesOnPage');

	$allStoriesList.empty();

	// loop through all of our stories and generate HTML for them
	for (let story of storyList.stories) {
		const $story = generateStoryMarkup(story);
		$allStoriesList.append($story);
	}

	$allStoriesList.show();
}

/** Gets list of favorite stories from currentUser, generates their HTML, and puts on page. */

function putFavoriteStoriesOnPage() {
	console.debug('putFavoriteStoriesOnPage');

	$favoriteStories.empty();

	if (currentUser.favorites.length === 0) {
		$favoriteStories.append('<h1>No Favorites added yet.</h1>');
	} else {
		// loop through currentUser favorited stories and generate HTML for them
		for (let story of currentUser.favorites) {
			const $story = generateStoryMarkup(story);
			$favoriteStories.append($story);
		}
	}

	$favoriteStories.show();
}

/** Gets list of currentUser's stories, generates their HTML, and puts on page. */

function putUserStoriesOnPage() {
	console.debug('putUserStoriesOnPage');

	$userStories.empty();

	if (currentUser.ownStories.length === 0) {
		$userStories.append('<h1>No stories have been submitted.</h1>');
	} else {
		// loop through currentUser favorited stories and generate HTML for them
		for (let story of currentUser.ownStories) {
			const $story = generateStoryMarkup(story, true);
			$userStories.append($story);
		}
	}

	$userStories.show();
}

/** Gets new story from user submit form, generates their HTML, and puts on page. */

async function submitNewStory(evt) {
	console.debug('addUserStory');
	evt.preventDefault();

	// grab new story story data
	const author = $('#create-author').val();
	const title = $('#create-title').val();
	const url = $('#create-url').val();
	const userStory = { author, title, url };

	// create new story
	const story = await storyList.addStory(currentUser, userStory);

	// push story to storyList object
	storyList.stories.push(story);

	// create html markup for story and prepend to story list UI
	const $story = generateStoryMarkup(story);
	$allStoriesList.prepend($story);
	$userStories.prepend(generateStoryMarkup(story, true));

	// hide the form and reset it
	$submitStoryForm.slideUp('slow');
	$submitStoryForm.trigger('reset');
}

$submitStoryForm.on('submit', submitNewStory);

/** Functionality for favorites list and starr/un-starr a story */

async function toggleFavorite(evt) {
	console.debug('toggleFavorite');
	const $target = $(evt.target);
	const $storyLi = $target.closest('li');
	const storyId = $storyLi.attr('id');
	const story = storyList.stories.find(s => s.storyId === storyId);

	// check if story favorited by fontawesome star classes
	if ($target.hasClass('fas')) {
		// is currently a favorite
		// remove favorite from user and toggle class to hollow star
		await currentUser.removeFavorite(story);
		$target.closest('i').toggleClass('fas far');
	} else {
		// add favorite from user and toggle class to solid star
		await currentUser.addFavorite(story);
		$target.closest('i').toggleClass('fas far');
	}
}

$storiesLists.on('click', '.favorite', toggleFavorite);

/** Functionality for removing user story */

async function deleteStory(evt) {
	console.debug('deleteStory');
	const $storyId = $(evt.target).closest('li').attr('id');

	// remove story from in memory story list
	await storyList.removeStory(currentUser, $storyId);

	// get user ownStory id for removal
	const deletedStoryIdx = currentUser.ownStories.find((s, idx) => {
		if (s.storyId === $storyId) return idx;
	});

	// remove story from currentUser ownStories array
	currentUser.ownStories.splice(deletedStoryIdx, 1);

	// re-generate story list
	storyList = await StoryList.getStories();

	// re-generate user stories
	putUserStoriesOnPage();
}

$userStories.on('click', '.remove', deleteStory);
