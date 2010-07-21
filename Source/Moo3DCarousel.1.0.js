/*
---
description: Provide a simple way to create 3D carousel.

license: MIT-style
copyright: Patrick Allain
authors: Patrick Allain

requires:
- core/1.2.4:: [Class.Extras, Element.Event, Element.Style, Element.Dimension, Fx.Morph]

provides: [Moo3DCarousel]

...
*/
var Moo3DCarousel = new Class({
    
	/**
	* @see http://mootools.net/docs/core/Class/Class.Extras#Options
	*/
	Implements: [Events, Options],
	
	/**
	 * Carousel options
	 * Les options du carrousel
	 * 
	 * @var Object JSON
	 */
	options: {
		// Le positionnement de l'overlay
		containerPosition: 'relative',
		
		// La marge que l'on dans l'overlay crée
		margin: 10,
		
		// L'offset du centre de l'elipse
		centerOffset: { x:0 , y:0 },
		
		// La longueur du demi-grand axe
		xRadius: 300,
		// La longueur du demi-petit axe
		yRadius: 50,
		
		// La durée de d'une rotation
		rotateDuration: 500,
		
		// Les options pour les transitions
		fx: { link: 'cancel' },
		
		// Ratio minimale que peut prendre une image
		ratioMin: 0.4,
		
		// Angle offset
		offsetAngle: 0,
		
		// On définit le départ pour la propriété z-index
		zIndex: 100,
		
		// Exposant pour la fonction modulant la position
		powerExponent: 0.85,
		
		// Ajoute l'événent mousewheel
		mouseWheel: true,
		
		// Si on veut faire un autorun
		autoRun: true,
		interval: 3000,
		
		// Stop le carrousel lorsque l'on le survole
		stopOver: true,
		
		// Sens trigo ou non
		trigo: true
	},
	
	/**
	 * The container element
	 * L'élément container
	 * 
	 * @var element
	 */
	_container: null,
	
	/**
	 * The carousel elements
	 * Les éléments constitutifs du Moo3DCarousel
	 * 
	 * @var	element
	 */
	_elements: [],
	
	/**
	 * Max size of a images
	 * La taille maximale que peut prendre une image
	 * 
	 * @var	Object JSON
	 */
	_sizeMax: {x:0, y:0},
	
	/**
	 * Index of the current image focused
	 * L'index de l'image mise en avant
	 * 
	 * @var int
	 */
	_currentIndex: 0,
	
	/**
	 * Elipse center
	 * Le centre de l'ellipse
	 * 
	 * @var	Object	JSON
	 */
	_center: {x:0, y:0},
	
	/**
	 * The events methods
	 * Les méthodes déclencher lors d'événements
	 * 
	 * @var	Object
	 */
	_evFunct: {},
	
	/**
	 * Timer
	 * 
	 * @var	timer
	 */
	_periodical: null,
	
	/**
	 * Autorun
	 * 
	 * @var	bool
	 */
	_autorun: false,
	
	/**
	 * Class constructor
	 * Le constructeur de la classe.
	 * 
	 * @param		element		parent
	 * @param 		Object JSON		options
	 */
	initialize: function(parent, options) {
		parent = document.id(parent);
		this.setOptions(options);
		
		// On crée un nouvel élément et on définit sa position puis on l'injecte dans l'élément parent
		this._container = new Element('div', { 'class': 'Moo3DCarouselOverlay'})
		.setStyles({
			'position': this.options.containerPosition,
			'z-index': this.options.zIndex
		}).inject(parent);
		
		// On crée notre objet contenant toutes les méthodes déclenchée lors d'un événement
		this._evFunct = {
			// Vous pourrez changer le signe en fonction de comment cela vous parait le plus naturel
			wheel: function(ev) { ev.stop(); this[(ev.wheel == 1) ? 'goNext': 'goPrevious'](); }.bind(this),
			winResize: function(ev) { this.init(); }.bind(this),
			mouseEnter: function(ev) { $clear(this._periodical); this.fireEvent('stop'); this._autorun = false; }.bind(this),
			mouseLeave: function(ev) {
				$clear(this._periodical);
				this._periodical = this.goNext.periodical(this.options.interval, this);
				this.fireEvent('start');
				this._autorun = true;
			}.bind(this)
		};
		
		// On ajoute l'événement sur l'overlay
		if ( this.options.mouseWheel )
			this._container.addEvent('mousewheel', this._evFunct.wheel );
		
		// On réinitialise lors du redimensionnement de la fenêtre
		window.addEvent('resize', this._evFunct.winResize );
		
		if (this.options.autoRun) {
			
			this._evFunct.mouseLeave();
			
			if ( this.options.stopOver) {			
				// On ajoute les événements dans le cas d'une rotation continue
				this._container.addEvents({
					'mouseenter' : this._evFunct.mouseEnter,
					'mouseleave' : this._evFunct.mouseLeave
				});
			}
		}
	},
	
	/**
	 * Add a element in the carousel
	 * Ajoute un élément au carrousel
	 * 
	 * @param		element		elem
	 * @param		Object JSON		size
	 * @return 		Moo3DCarousel
	 */
	addElement: function(elem, size) {
		// On récupère l'image et on l'ajoute au tableau
		elem = document.id(elem);
		
		// On injecte l'élément dans l'overlay.
		elem.inject(this._container);
		
		// On ajoute l'élément à la liste des éléments du tableaux
		this._elements.push(elem);
		
		// Dans une premier temps, on récupère l'élément image
		var imgEl = ( elem.get('tag') == 'img' ) ? elem : elem.getElement('img');
		
		// On définit la position de l'image en absolu
		imgEl.setStyle('position', 'absolute');
		
		// On définit l'objet size si celui-ci n'a pas été passez en argument.
		size = size || {};
		
		// Puis on récupère la taille de l'image.
		size.x = size.x || imgEl.getProperty('width').toInt() || el.getSize().x;
		size.y = size.y || imgEl.getProperty('height').toInt() || el.getSize().y;
		
		// On stocke cette taille sur l'élément.
		elem.store("Moo3DCarousel:size", size);
		
		// On recalcule la taille maximale
		this._sizeMax = {
			x: Math.max(size.x, this._sizeMax.x),
			y: Math.max(size.y, this._sizeMax.y)
		};
		
		// On ajoute l'objet permettant de faire des transitions sur l'image
		elem.store("Moo3DCarousel:fx", new Fx.Morph(imgEl, $extend({duration: this.options.rotateDuration}), this.options.fx) );
		
		// On réinitialise le carrousel afin de prendre en compte le nouvel élément
		this.init();
		
		return this;
	},
	
	/**
	 * Retrieve the carousel size
	 * Retourne la taille du carrousel
	 * 
	 * @return		Object JSON
	 */
	getSize: function() {
		return {
			x: this._sizeMax.x + 2 * ( this.options.margin + this.options.xRadius),
			y: this._sizeMax.y + 2 * ( this.options.margin + this.options.yRadius)
		};
	},
	
	/**
	 * Position images without transition
	 * Repositionne les images sans effectuer de transition
	 * 
	 * @return		Moo3DCarousel
	 */
	init: function(index) {
		
		this._currentIndex = index || this._currentIndex;
		
		// On re-calcule le centre de l'elipse
		this._center = {
			x: (this._container.getSize().x / 2) + this.options.centerOffset.x,
			y: this.options.centerOffset.y + this.options.yRadius
		};
		
		// On rédéfinit la taille de l'overlay afin que les images ne sorte pas du flux
		this._container.setStyle('height', this.getSize().y );
		
		var l = this._elements.length;
		
		// On replace tous les éléments
		for ( var i=0; i<l; i++ ) {
			var elem = this._elements[i];
			
			// On récupère l'élément image
			var imgEl = ( elem.get('tag') == 'img' ) ? elem : elem.getElement('img');
			
			// On calcule le décalage de l'image par rapport à l'élément mis en avant.
			var index = ( i + l - this._currentIndex ) % l;
			
			// On récupère l'angle de la position de l'image sur l'ellipse
			var teta  = this._getTeta( index );
			
			// On récupère le style que l'on doit appliquer sur l'image
			var styles = this._getStyles(elem, teta);
			
			// On applique le style sur l'image
			imgEl.setStyles(styles);
		}
		
		// Déclenche l'événement init
		this.fireEvent('init');
		
		return this;
	},
	
	/**
	 * Transform a index in an angle.
	 * Retourne l'angle à partir d'une position d'index
	 * 
	 * @param		int				index
	 * @return		float
	 */
	_getTeta: function(index) {
		index = index % this._elements.length;
		
		var teta = (index / this._elements.length) * 2 * Math.PI;
		
		teta = (teta + Math.PI) % (2 * Math.PI) - Math.PI;
		teta = ((teta > 0) ? 1 : -1) * Math.PI * Math.pow( Math.abs(teta) / Math.PI , this.options.powerExponent);
		
		return teta;
	},
	
	/**
	 * Fix the style to apply on a element from angle
	 * Calcul le style à appliquer sur un élément du carrousel
	 * en fonction de l'angle sous lequel il est vu
	 * 
	 * @param		element		elem
	 * @param		float			teta
	 * @return		Object JSON
	 */
	_getStyles: function(elem, teta) {
		// On calcule la rotation du carrousel
		var size   = elem.retrieve('Moo3DCarousel:size', elem.getSize() );
		
		// On calcule le coefficient pour le modulant de la taille et de la propriété z-index
		var sCoeff = (1-this.options.ratioMin) / 2;
		sCoeff = 1 +  sCoeff * (Math.cos(teta)-1) ;
		
		// On calcule la taille de l'image modulé par la fonction présenté
		var out = {
			width: (size.x * sCoeff).toInt(),
			height: (size.y * sCoeff).toInt()
		};
		
		// On ajoute la propriété z-index
		$extend( out , {
			'z-index': (this.options.zIndex + sCoeff * 2 * this._elements.length).toInt()
		});
		
		// On ajoute la position en décalant horizontalement l'image de la moitié sa largeur
		$extend( out, {
			left: (this._center.x + this.options.xRadius * Math.sin(teta + this.options.offsetAngle) - out.width/2).toInt(),
			top: (this._center.y + this.options.yRadius * Math.cos(teta + this.options.offsetAngle)).toInt()
		});
		
		return out;
	},
	
	/**
	 * Focus a element's carousel 
	 * Permet de mettre en avant une photo
	 * 
	 * @var			element|id		element
	 * @return 		Moo3DCarousel
	 */
	focus: function(elem) {
		elem = document.id(elem);
		var index = this._elements.indexOf(elem);
		if ( index != -1 ) {
			this.goTo(index);
		}
		return this;
	},
	
	/**
	 * Focus the previous element
	 * Permet d'accéder à l'élément précédent
	 * 
	 * @return		Moo3DCarousel
	 */
	goPrevious: function() {
		return this.goTo( this._currentIndex - (this.options.trigo ? -1 : 1) );
	},
	
	/**
	 * Focus the next element
	 * Permet d'accéder à l'élément suivant
	 * 
	 * @return		Moo3DCarousel
	 */
	goNext: function() {
		return this.goTo( this._currentIndex + (this.options.trigo ? -1 : 1) );
	},
	
	/**
	 * Focus a element from its index
	 * Permet d'accéder à un élément en fonction de son index
	 * 
	 * @param		int				index
	 * @return		Moo3DCarousel
	 */
	goTo: function(index) {
		
		this.init();
		
		// Nous refinissons notre l'index de l'image mise en avant
		this._currentIndex = index % this._elements.length;
		
		var l = this._elements.length;
		
		// On déplace tous les éléments avec des transitions
		for ( var i=0; i<l; i++ ) {
			var elem = this._elements[i];
			
			// On récupère l'élément de transition
			var fx = elem.retrieve("Moo3DCarousel:fx");
			
			// On calcule le décalage de l'image par rapport à l'élément mis en avant.
			var index = ( i + l - this._currentIndex ) % l;
			
			// On récupère l'angle de la position de l'image sur l'ellipse
			var teta  = this._getTeta( index );
			
			// On récupère le style que l'on doit appliquer sur l'image
			var styles = this._getStyles(elem, teta);
			
			// On applique la transition
			fx.start(styles);
		}
		
		// Si on a l'autorun, remet le compteur à zéro
		if ( this._autorun ) {
			$clear(this._periodical);
			this._periodical = this.goNext.periodical(this.options.interval, this);
		}
		
		// Déclenche l'événement rotateStart
		this.fireEvent('rotateStart', this);
		
		// Déclenche l'événement rotateEnd
		// prevent some side effect
		this.fireEvent('rotateEnd', this ,this.options.rotateDuration);
		
		return this;
	},
	
	/**
	 * Return the number of element into the carousel
	 * Retourne le nombre d'élément dans le carousel
	 * 
	 * @return	int
	 */
	count: function() {
		return this._elements.length;
	},
	
	/**
	 * 
	 * @return		element
	 */
	toElement: function() {
		return this._container;
	},
	
	getFocused: function() {
		var l =  this._elements.length;
		return this._elements[ ((this._currentIndex + l) % l) ];
	}
	
});


Element.implement({
	
	moo3DCarousel: function(options) {
		var children = this.getChildren(), moo3DCarousel = new Moo3DCarousel(this, options);
		children.each( function(el) {
			moo3DCarousel.addElement(el);
		});
		return this;
	}
	
	
});