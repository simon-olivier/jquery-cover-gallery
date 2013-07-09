$(function () {
    var flickrAPI = "http://api.flickr.com/services/rest/";
    
    $("#coverGallery").coverGallery({
	height: function() {
	    return $(window).height();
	}
    })
    .on('afterExpand', function() {
	$(window).scrollTop($(this).offset().top);
    });

    $.getJSON(flickrAPI, {
	method: 'flickr.interestingness.getList',
	api_key: '843e2748294ffcc7eb67b586f68b3651',
	format: 'json',
	per_page: '100',
	nojsoncallback: '1'
    }).done(function (data) {
	var coverGallery = $('#flickr-cover-gallery'),
	    links = $('<div class="cover-gallery-links"></div>'),
	    url;
	$.each(data.photos.photo, function (i, item) {
	    url = 'http://farm' + item.farm + '.staticflickr.com/' + item.server + '/' 
		+ item.id + '_' + item.secret + '_b.jpg';
	    $('<a></a>')
		.attr('href', url)
		.attr('title', item.title)
	        .html(item.title)
                .appendTo(links);
	});
	coverGallery.html('').append(links).coverGallery({
	    height: function() {
		return $(window).height();
	    }
	})
	.on('afterExpand', function() {
	    $(window).scrollTop($(this).offset().top);
	});
    }).fail(function () {
	$('#flickr-cover-gallery').html('<span class="error">Failed to fetch Flickr data</span>');
    });
});
