var unirest = require("unirest");

var req = unirest("GET", "https://movies-tvshows-data-imdb.p.rapidapi.com/");

req.query({
	"page": "1",
	"type": "get-trending-movies"
});

req.headers({
	"x-rapidapi-key": "637c138e40msh48030b2dde09449p1d0171jsnbee4371a1087",
	"x-rapidapi-host": "movies-tvshows-data-imdb.p.rapidapi.com",
	"useQueryString": true
});


req.end(function (res) {
	if (res.error) throw new Error(res.error);

	console.log(res.body);
});