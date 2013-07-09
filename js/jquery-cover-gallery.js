/* =========================================================
 * jquery-cover-gallery v1
 * https://github.com/simon-olivier/jquery-cover-gallery
 * =========================================================
 *
 * Copyright (c) 2013 Simon Olivier
 * 
 * Licensed under the MIT License;
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 * ========================================================= */

/*jslint browser: true*/
/*global $, jQuery*/

(function ($) {

    "use strict";

    function supportTransitions() {
        var elem = document.body || document.Element,
            currStyle = elem.style;

        return currStyle.transition !== undefined || currStyle.WebkitTransition !== undefined ||
            currStyle.MozTransition !== undefined || currStyle.MsTransition !== undefined ||
            currStyle.OTransition !== undefined;
    }

    var CGTemplates = {
        expandUi: ['<a class="cover-gallery-close" href="#">×</a>',
                   '<a class="cover-gallery-prev" href="#"></a>',
                   '<a class="cover-gallery-next" href="#"></a>',
                   '<div class="cover-gallery-title"></div>',
                   '<div class="cover-gallery-images"></div>'],
        expandSelectors: 'a.cover-gallery-close, a.cover-gallery-prev, a.cover-gallery-next, ' +
            'div.cover-gallery-title, div.cover-gallery-images',
        shrinkUi: ['<div class="cover-gallery-cover"></div>'],
        shrinkSelectors: 'div.cover-gallery-cover',
        loadingUi: ['<div class="cover-gallery-loadback1"></div>',
                    '<div class="cover-gallery-loadback2"></div>',
                    '<div class="cover-gallery-loading"><span></span></div>'],
        loadingSelectors: 'div.cover-gallery-loadback1, div.cover-gallery-loadback2, div.cover-gallery-loading'
    },
        CoverGallery = function (element, options) {
            this.options = options;
            this.isTransitionsSupported = supportTransitions();
            this.isResponsive = typeof this.options.height === 'function' ||
                typeof this.options.width === 'function';

            this.$element = $(element);
            this.$element.css('overflow', 'hidden');
            this.$element.find('.cover-gallery-links').css('display', 'none');
        },
        old = $.fn.coverGallery;

    CoverGallery.prototype = {
        constructor: CoverGallery,
        expand: function () {
            var e = $.Event('beforeExpand');

            this.$element.trigger(e);

            if (this.isExpanded || e.isDefaultPrevented()) {
                return;
            }

            this.isExpanded = true;

            this.clearState(this.$element.find(CGTemplates.shrinkSelectors));

            this.$element.height((typeof this.options.height === 'function' ?
                    this.options.height.apply(this) : this.options.height));
            this.$element.width((typeof this.options.width === 'function' ?
                    this.options.width.apply(this) : this.options.width));

            if (this.isTransitionsSupported) {
                this.enforceTransition($.proxy(this.internalExpand, this));
            } else {
                this.internalExpand();
            }
            return false;
        },
        internalExpand: function () {
            this.$element.append(CGTemplates.expandUi);
            this.currentEvents = this.expandEvents();
            this.applyEvents();

            if (this.isResponsive) {
                $(window).on('resize.cover-gallery', $.proxy(this.resize, this));
            }

            this.$links = this.getImageLinks();
            this.index = this.index || 0;
            this.showImage();
            this.$element.trigger('afterExpand');
        },
        expandEvents: function () {
            return [[this.$element.find('a.cover-gallery-prev'),
                { 'click.cover-gallery': $.proxy(this.previous, this) }],
                [this.$element.find('a.cover-gallery-next'),
                    { 'click.cover-gallery': $.proxy(this.next, this) }],
                [this.$element.find('a.cover-gallery-close'),
                    { 'click.cover-gallery': $.proxy(this.shrink, this) }]];
        },
        applyEvents: function () {
            var i,
                $element,
                event;

            for (i = 0; i < this.currentEvents.length; i += 1) {
                $element = this.currentEvents[i][0];
                event = this.currentEvents[i][1];
                $element.on(event);
            }
        },
        removeEvents: function () {
            var i = 0,
                $element,
                event;

            for (i = 0; i < this.currentEvents.length; i += 1) {
                $element = this.currentEvents[i][0];
                event = this.currentEvents[i][1];
                $element.off(event);
            }
        },
        clearState: function ($el) {
            if (this.currentEvents) {
                this.removeEvents();
                this.currentEvents = null;
            }
            if ($el.length > 0) {
                $el.remove();
            }
        },
        enforceTransition: function (callback) {
            var that = this,
                timeout = window.setTimeout(function () {
                    that.$element.off('transitionend.cover-gallery');
                    callback();
                }, 200);

            this.$element.one('transitionend.cover-gallery', function () {
                window.clearTimeout(timeout);
                callback();
            });
        },
        shrink: function () {
            var e = $.Event('beforeShrink');

            this.$element.trigger(e);

            if (this.isExpanded === false || e.isDefaultPrevented()) {
                return;
            }

            this.isExpanded = false;

            this.cleanView();
            this.clearState(this.$element.find(CGTemplates.expandSelectors));

            if (this.isResponsive) {
                $(window).off('resize.cover-gallery', this.resize);
            }

            this.$element.css('height', '');
            this.$element.css('width', '');

            if (this.isTransitionsSupported) {
                this.enforceTransition($.proxy(this.internalShrink, this));
            } else {
                this.internalShrink();
            }

            return false;
        },
        internalShrink: function () {
            this.$element.append(CGTemplates.shrinkUi);
            this.$element.find('div.cover-gallery-cover')
                .css('background-image', 'url(' + this.getCoverUrl() + ')')
                .attr('data-message', this.options.coverMessage);
            this.currentEvents = this.shrinkEvents();
            this.applyEvents();
            this.$element.trigger('afterShrink');
        },
        shrinkEvents: function () {
            return [[this.$element, { 'click.cover-gallery' : $.proxy(this.expand, this) }]];
        },
        toggle: function () {
            if (this.isExpanded) {
                this.shrink();
            } else {
                this.expand();
            }
        },
        resize: function () {
            var $displayedImages = this.$element.find('div.cover-gallery-images img.in');

            if (typeof this.options.height === 'function') {
                this.$element.height(this.options.height.apply(this));
            }
            if (typeof this.options.width === 'function') {
                this.$element.width(this.options.width.apply(this));
            }

            if ($displayedImages.length > 0) {
                this.contentResize($displayedImages.remove()[0]);
            }
        },
        contentResize: function (img) {
            var that = this;

            window.clearTimeout(this.resizeTimeout);
            // executes after resize is finished for I.E. and Webkit browsers
            this.resizeTimeout = window.setTimeout(function () {
                that.options.displayImage.call(that, img);
            }, 150);
        },
        getImageLinks: function () {
            return this.$element.find('.cover-gallery-links ' + this.options.selector);
        },
        getCoverUrl: function () {
            var link = this.options.link,
                cover,
                $el;

            if (this.options.cover) {
                return this.options.cover;
            }

            this.$element.find('.cover-gallery-links ' + this.options.selector).each(function (i, el) {
                $el = $(el);

                if (i === 0 || $el.data('cover') === true) {
                    cover = $el.attr(link);
                }
            });
            return cover;
        },
        next: function () {
            this.$links = this.getImageLinks();

            if (!this.$links.length) {
                return;
            }

            this.index += 1;

            if (this.index > this.$links.length - 1) {
                this.index = 0;
            }
            this.showImage();

            return false;
        },
        previous: function () {
            if (!this.$links.length) {
                return;
            }

            this.index -= 1;

            if (this.index < 0) {
                this.index = this.$links.length - 1;
            }
            this.showImage();

            return false;
        },
        loadImage: function (callback) {
            if (!this.$links.length || !this.$links[this.index]) {
                return false;
            }

            return $('<img></img>')
                .on('error.cover-gallery', callback)
                .on('load.cover-gallery', function () {
                    callback(this); // this == image element
                })
                .attr('src', $(this.$links.get(this.index)).attr(this.options.link));
        },
        scale: function (img, destWidth, destHeight) {
            var scale = Math.min(destWidth / img.width, destHeight / img.height),
                width = Math.ceil(img.width * scale),
                height = Math.ceil(img.height * scale);

            img.width = width > 0 ? width : 0;
            img.height = height > 0 ? height : 0;

            return img;
        },
        showImage: function () {
            var that = this,
                currentImages = this.$element.find('div.cover-gallery-images img.in');

            this.cleanView();
            this.$element.find('div.cover-gallery-title.in').removeClass('in');

            if (currentImages.length) {
                if (this.isTransitionsSupported) {
                    currentImages.one('transitionend', function () {
                        currentImages.remove();
                        currentImages = null;
                    });
                    currentImages.removeClass('in');
                } else {
                    currentImages.remove();
                }
            }

            this.loadingTimeout = window.setTimeout(function () {
                that.$element.append(CGTemplates.loadingUi);
                that.$element.find('div.cover-gallery-loading span').html(that.options.loadingMessage);
            }, 150);

            this.loadingImage = this.loadImage(function (img) {
                window.clearTimeout(that.loadingTimeout);
                that.$element.find(CGTemplates.loadingSelectors).remove();

                if (img.type !== "error") {
                    that.options.displayImage.call(that, img);
                }
                $(img).addClass('in');
                that.loadingImage = null;
                that.displayTitle();
            });

            this.preloadImages();
        },
        cleanView: function () {
            var loading = $(CGTemplates.loadingSelectors);

            if (this.loadingImage) {
                this.$element.find(CGTemplates.loadingSelectors).remove();
                this.loadingImage.off('error.cover-gallery')
                    .off('load.cover-gallery');
                this.loadingImage = null;
            }
            window.clearTimeout(this.titleTimeout);
            window.clearTimeout(this.loadingTimeout);

            if (loading.length > 0) {
                loading.remove();
            }
        },
        displayTitle: function () {
            var $title = this.$element.find('div.cover-gallery-title'),
                title;

            if (this.$links.length && this.$links.get(this.index)) {
                title = $(this.$links.get(this.index)).attr(this.options.title);

                if (title) {
                    $title.html('<span>' + title + '</span>')
                        .css('margin-left', Math.ceil(-$title.width() / 2));

                    this.titleTimeout = window.setTimeout(function () {
                        $title.addClass('in');
                        $title = null;
                    }, 500);
                }
            }
        },
        preloadImages: function () {
            var i,
                preloadIndex,
                requestedIndexes = [];

            for (i = this.index - this.options.preloadRange; i < this.options.preloadRange + this.index + 1; i += 1) {
                if (i < 0) {
                    preloadIndex = this.$links.length + i;
                } else if (i >= this.$links.length) {
                    preloadIndex = this.$links.length - i;
                } else {
                    preloadIndex = i;
                }

                if (preloadIndex !== this.index && $.inArray(preloadIndex, requestedIndexes) === -1) {
                    $('<img></img>').attr('src', $(this.$links.get(preloadIndex)).attr(this.options.link));
                    requestedIndexes.push(preloadIndex);
                }
            }
        }
    };

    $.fn.coverGallery = function (options) {
        return this.each(function () {
            var $this = $(this),
                data = $this.data('cover-gallery'),
                settings = $.extend({}, $.fn.coverGallery.defaults, $this.data(), typeof options === 'object' && options);

            if (!data) {
                data = new CoverGallery(this, settings);
                $this.data('cover-gallery', data);
            }
            if (typeof options === 'string') {
                data[options]();
            } else if (settings.expand) {
                data.expand();
            } else {
                data.shrink();
            }
        });
    };

    $.fn.coverGallery.defaults = {
        expand: false,
        height: '800px',
        width: '',
        coverMessage: 'Click to view gallery',
        loadingMessage: 'Loading',
        preloadRange: 2,
        selector: 'a',
        link: 'href',
        title: 'title',
        cover: null,
        displayImage: function (img) {
            this.$element.find('div.cover-gallery-images')
                .append(this.scale(img, this.$element.width() - 20, this.$element.height() - 20));
            $(img).css({
                top: (this.$element.height() - img.height) * 0.5,
                left: (this.$element.width() - img.width) * 0.5
            });
        }
    };

    $.fn.coverGallery.constructor = CoverGallery;
    $.fn.coverGallery.CGTemplates = CGTemplates;

    $.fn.coverGallery.noConflict = function () {
        $.fn.coverGallery = old;
        return this;
    };

    $(function () {
        $('[data-provide="cover-gallery"]').coverGallery();
    });

    $(document).on('click.cover-gallery.data-api', '[data-toggle="cover-gallery"]', function (e) {
        var $this = $(this),
            $target = $($this.attr('data-target') || $this.attr('href'));

        e.preventDefault();

        $target.coverGallery('toggle');
    });

}(jQuery));
