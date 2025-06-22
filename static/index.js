const markAllArticles = (feedId, el, read) => {
	const basePath = window.BASE_PATH;
	const apiUrl = `${basePath}/api/feeds/${feedId}/${read ? "read" : "unread"}`;
	fetch(apiUrl, { method: "PUT" })
		.then((_data) => {
			el.parentNode.nextElementSibling.remove();
			el.parentNode.remove();
		})
		.catch((error) => {
			alert(error);
		});
};

const markOneArticle = (articleId, el, read) => {
	const basePath = window.BASE_PATH;
	const apiUrl = `${basePath}/api/articles/${articleId}/${read ? "read" : "unread"}`;
	fetch(apiUrl, { method: "PUT" })
		.then((_data) => {
			el.parentNode.remove();
		})
		.catch((error) => {
			alert(error);
		});
};

document.addEventListener("DOMContentLoaded", () => {
	document.querySelectorAll(".js-unread-feed").forEach((el) => {
		el.addEventListener("click", () => {
			markAllArticles(el.dataset.feedId, el, false);
		});
	});
	document.querySelectorAll(".js-unread-article").forEach((el) => {
		el.addEventListener("click", () => {
			markOneArticle(el.dataset.articleId, el, false);
		});
	});
	document.querySelectorAll(".js-read-feed").forEach((el) => {
		el.addEventListener("click", () => {
			markAllArticles(el.dataset.feedId, el, true);
		});
	});
	document.querySelectorAll(".js-read-article").forEach((el) => {
		el.addEventListener("click", () => {
			markOneArticle(el.dataset.articleId, el, true);
		});
	});
});
