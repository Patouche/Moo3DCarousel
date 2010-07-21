Moo3DCarousel
========
Create a 3D Carousel easily

![Screenshot](http://github.com/Patouche/Moo3DCarousel/raw/master/logo.png)

How to use
----------

### HTML
	<img src="photos/1.jpg" alt="" title="" height="100" width="150">
	<img src="photos/2.jpg" alt="" title="" height="100" width="150">
	<img src="photos/3.jpg" alt="" title="" height="100" width="150">
	<img src="photos/4.jpg" alt="" title="" height="100" width="150">
	<img src="photos/5.jpg" alt="" title="" height="100" width="150">
	<div id="carousel"></div>

### JavaScript

	// Create a new Moo3DCarousel instance
	var moo3DCarousel3 = new Moo3DCarousel('carousel');
	
	// Add the image to the carousel
	$$('img').each( function(el) {
		moo3DCarousel3.addElement(el);
	});

### Demo & Documentation

[Demo](http://www.farkess.com/~patouche/tuto-mootools/carrousel-3d/)
[Documentation](http://www.farkess.com/~patouche/tuto-mootools/carrousel-3d/doc.html)


