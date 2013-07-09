# JQuery Cover Gallery

Turns a cover picture (i.e. any pictures) into an image gallery.

## Demo
You can try JQuery Cover Gallery by downloading the project and clicking on the index.html file

## Requirements
[JQuery 1.8+](http://jquery.com/)

## Usage
Add a `div` element with the class `cover-gallery` in your HTML code. This element must contain another `div` element with the class `cover-gallery-links`. All links to be displayed by the cover gallery belongs in that last element :

```html
<div class="cover-gallery">
    <div class="cover-gallery-links">
        <a href="my/super/picture.jpg" title="foo">bar</a>
        <!-- Other links goes here -->
    </div> 
</div>
```
    
### Via Markups (data-API)
The cover gallery can be instanciated without the need of custom javascript. To turn an element into a cover gallery, add `data-provide="cover-gallery"` to it :

```html
<div class="cover-gallery" data-provide="cover-gallery">
    <div class="cover-gallery-links">
        <a href="my/super/picture.jpg" title="foo">Picture 1</a>
    </div>
</div>
```

You may choose the link defining the cover picture by using the data-API. To do so, add `data-cover="true"` to the required link : 

```html
<div class="cover-gallery" data-provide="cover-gallery">
    <div class="cover-gallery-links">
        <a href="my/super/picture.jpg" title="foo">Picture 1</a>
        <a href="my/cover/picture.jpg" title="is covering" data-cover="true">Picture 2</a>
        <a href="my/awesome/picture.jpg" title="is awesome">Picture 3</a>
    </div> 
</div>
```

### Via Javascript

Instanciate a cover gallery with an id `coverGallery` via javascript :

```javascript
$('#coverGallery').coverGallery(options);
```
### Options

You can customize a gallery with options that can be set either by using the data-API or javascript. Remember that you have to prepend `data-` to every option name if you are using the data-API

|Name|Type|Default value|Description|
|----|----|-------------|-----------|
|expand|Boolean|`false`|Specify if the cover gallery should be expanded at start up.|
|height|string, function|`"800px"`|Height of the cover gallery when expanded.|
|width|string, function|`-`|Width of the cover gallery when expanded.|
|coverMessage|string|`"Click to view gallery"`|Message displayed when the user is hover the shrinked cover gallery.|
|loadingMessage|string|`"Loading"`|Message displayed during the image loading animation.|
|preloadRange|number|`2`|Specify how many previous and next images should be pre-loaded.|
|selector|string|`"a"`|Selector to look for under `cover-gallery-links`.|
|link|string|`"href"`|Selector attribute containing the location of an image.|
|title|string|`"title"`|Selector attribute containing the title of an image.|
|cover|string|`-`|Location of the cover picture. This option overrides `data-cover="true"`.|
|displayImage|function|`function`|Function used to display an image. Default behavior is to render an image as big as possible.|

Examples:

* Using javascript
```javascript
    $("#coverGallery").coverGallery({
        height: function() {
            return $(window).height();
        },
        coverMessage: "Cliquez pour voir la galerie",
        loadingMessage: "Chargement",
        selector: "img",
        link: "data-href",
        title: "data-title"
    });
```

* Using data-API
```html
    <div class="cover-gallery" data-provide="cover-gallery" 
            data-height="500px" 
            data-cover-message="Cliquez pour voir la galerie"
            data-loading-message="Chargement"
            data-selector="img"
            data-link="data-href"
            data-title="data-title">
        <div class="cover-gallery-links">
            <img src="small/image.jpg" data-href="/big/image.jpg" data-title="My image"/>
        </div>
    </div>
```

### Methods

#### .cover-gallery(options)
Initializes the cover gallery

```javascript
$("#coverGallery").coverGallery();
```

#### .cover-gallery("expand")
Expand the cover gallery

```javascript
$("#coverGallery").coverGallery("expand");
```

#### .cover-gallery("shrink")
Shrink the cover gallery

```javascript
$("#coverGallery").coverGallery("shrink");
```

#### .cover-gallery("toggle")
Toggle the cover gallery

```javascript
$("#coverGallery").coverGallery("toggle");
```

### Events
JQuery Cover Gallery provides four events :

|Event|Description|
|-----|-----------|
|beforeExpand|Emitted immediatly when the instance method `expand` is called.|
|afterExpand|Emitted after the gallery has been expanded.|
|beforeShrink|Emitted immediatly when the instance method `shrink` is called.|
|afterShrink|Emitted after the gallery has been shrinked.|

Please note that events `beforeShrink` and `afterShrink` will be called after a cover gallery initialization unless the option `expanded` has been set to `true`. 

### No conflict
In case of namespace collision, it is possible to revert to the old plugin by using the `noConflict` method:

```javascript
var jqueryCoverGallery = $.fn.coverGallery.noConflict();
$.fn.jcgCoverGallery = jqueryCoverGallery;
```

## Todo

* Add hotkeys support
* Add gesture support
* Add tests
* Improve code
* Improve CSS3 transitions

## Contributions

Any contibutors are very welcomed.

## License

Released under the [MIT License](http://opensource.org/licenses/MIT).