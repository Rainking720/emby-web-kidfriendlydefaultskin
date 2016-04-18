define(['layoutManager'], function (layoutManager) {

    function processMovement(e, touchEnabled, elem, cardImageContainer, layers, totalLayers, shine) {

        var d = document,
            de = d.documentElement,
            bd = d.body,
            htm = d.documentElement;

        var bdst = bd.scrollTop || htm.scrollTop,
			bdsl = bd.scrollLeft,
			pageX = (touchEnabled) ? e.touches[0].pageX : e.pageX,
			pageY = (touchEnabled) ? e.touches[0].pageY : e.pageY,
			offsets = elem.getBoundingClientRect(),
			w = elem.clientWidth || elem.offsetWidth || elem.scrollWidth, // width
			h = elem.clientHeight || elem.offsetHeight || elem.scrollHeight, // height
			wMultiple = 320 / w,
			offsetX = 0.52 - (pageX - offsets.left - bdsl) / w, //cursor position X
			offsetY = 0.52 - (pageY - offsets.top - bdst) / h, //cursor position Y
			dy = (pageY - offsets.top - bdst) - h / 2, //@h/2 = center of container
			dx = (pageX - offsets.left - bdsl) - w / 2, //@w/2 = center of container
			yRotate = (offsetX - dx) * (0.07 * wMultiple), //rotation for container Y
			xRotate = (dy - offsetY) * (0.1 * wMultiple), //rotation for container X
			imgCSS = 'rotateX(' + xRotate + 'deg) rotateY(' + yRotate + 'deg)', //img transform
			arad = Math.atan2(dy, dx), //angle between cursor and center of container in RAD
			angle = arad * 180 / Math.PI - 90; //convert rad in degrees

        //get angle between 0-360
        if (angle < 0) {
            angle = angle + 360;
        }

        //container transform
        if (cardImageContainer.classList.contains('over')) {
            imgCSS += ' scale3d(1.07,1.07,1.07)';
        }
        cardImageContainer.style.transform = imgCSS;

        //gradient angle and opacity for shine
        //shine.style.background = 'linear-gradient(' + angle + 'deg, rgba(255,255,255,' + (pageY - offsets.top - bdst) / h * 0.4 + ') 0%,rgba(255,255,255,0) 80%)';
        //shine.style.transform = 'translateX(' + (offsetX * totalLayers) - 0.1 + 'px) translateY(' + (offsetY * totalLayers) - 0.1 + 'px)';

        ////parallax for each layer
        //var revNum = totalLayers;
        //for (var ly = 0; ly < totalLayers; ly++) {
        //    layers[ly].style.transform = 'translateX(' + (offsetX * revNum) * ((ly * 2.5) / wMultiple) + 'px) translateY(' + (offsetY * totalLayers) * ((ly * 2.5) / wMultiple) + 'px)';
        //    revNum--;
        //}
    }

    function processEnter(e, card, cardImageContainer) {
        cardImageContainer.classList.add('over');
    }

    function processExit(e, card, cardImageContainer, layers, totalLayers, shine) {

        cardImageContainer.classList.remove('over');
        cardImageContainer.style.transform = '';
        //shine.style.cssText = '';

        //for (var ly = 0; ly < totalLayers; ly++) {
        //    layers[ly].style.transform = '';
        //}

    }

    function createSingle1(thisImg) {

        var layerElems = thisImg.querySelectorAll('.atvImg-layer'),
                   totalLayerElems = layerElems.length;

        if (totalLayerElems <= 0) {
            return;
        }

        while (thisImg.firstChild) {
            thisImg.removeChild(thisImg.firstChild);
        }

        var containerHTML = d.createElement('div'),
			shineHTML = d.createElement('div'),
			layersHTML = d.createElement('div'),
			layers = [];

        thisImg.id = 'atvImg__' + l;
        containerHTML.className = 'atvImg-container';
        shineHTML.className = 'atvImg-shine';
        layersHTML.className = 'atvImg-layers';

        for (var i = 0; i < totalLayerElems; i++) {
            var layer = d.createElement('div'),
				imgSrc = layerElems[i].getAttribute('data-img');

            layer.className = 'atvImg-rendered-layer';
            layer.setAttribute('data-layer', i);
            layer.style.backgroundImage = 'url(' + imgSrc + ')';
            layersHTML.appendChild(layer);

            layers.push(layer);
        }

        //containerHTML.appendChild(shadowHTML);
        containerHTML.appendChild(layersHTML);
        containerHTML.appendChild(shineHTML);
        thisImg.appendChild(containerHTML);

        var w = thisImg.clientWidth || thisImg.offsetWidth || thisImg.scrollWidth;
        thisImg.style.transform = 'perspective(' + w * 3 + 'px)';

        if (layoutManager.mobile) {
            win.preventScroll = false;

            (function (_thisImg, _layers, _totalLayers, _shine) {
                thisImg.addEventListener('touchmove', function (e) {
                    if (win.preventScroll) {
                        e.preventDefault();
                    }
                    processMovement(e, true, _thisImg, _layers, _totalLayers, _shine);
                });
                thisImg.addEventListener('touchstart', function (e) {
                    win.preventScroll = true;
                    processEnter(e, _thisImg);
                });
                thisImg.addEventListener('touchend', function (e) {
                    win.preventScroll = false;
                    processExit(e, _thisImg, _layers, _totalLayers, _shine);
                });
            })(thisImg, layers, totalLayerElems, shineHTML);
        } else {
            (function (_thisImg, _layers, _totalLayers, _shine) {
                thisImg.addEventListener('mousemove', function (e) {
                    processMovement(e, false, _thisImg, _layers, _totalLayers, _shine);
                });
                thisImg.addEventListener('mouseenter', function (e) {
                    processEnter(e, _thisImg);
                });
                thisImg.addEventListener('mouseleave', function (e) {
                    processExit(e, _thisImg, _layers, _totalLayers, _shine);
                });
            })(thisImg, layers, totalLayerElems, shineHTML);
        }
    }

    function createSingle(card) {

        var w = card.clientWidth || card.offsetWidth || card.scrollWidth;
        card.style.transform = 'perspective(' + w * 3 + 'px)';

        var cardImageContainer;

        if (layoutManager.mobile) {
            win.preventScroll = false;

            (function (_thisImg, _layers, _totalLayers, _shine) {
                thisImg.addEventListener('touchmove', function (e) {
                    if (win.preventScroll) {
                        e.preventDefault();
                    }
                    processMovement(e, true, _thisImg, _layers, _totalLayers, _shine);
                });
                thisImg.addEventListener('touchstart', function (e) {
                    win.preventScroll = true;
                    processEnter(e, _thisImg);
                });
                thisImg.addEventListener('touchend', function (e) {
                    win.preventScroll = false;
                    processExit(e, _thisImg, _layers, _totalLayers, _shine);
                });
            })(thisImg, layers, totalLayerElems, shineHTML);
        } else {
            //cardImageContainer.addEventListener('mousemove', function (e) {
            //    processMovement(e, false, _thisImg, _layers, _totalLayers, _shine);
            //});
            card.addEventListener('mousemove', function (e) {
                cardImageContainer = cardImageContainer || card.querySelector('.cardImageContainer');
                processMovement(e, false, card, cardImageContainer);
            });
            card.addEventListener('mouseenter', function (e) {
                cardImageContainer = cardImageContainer || card.querySelector('.cardImageContainer');
                processEnter(e, card, cardImageContainer);
            });
            card.addEventListener('mouseleave', function (e) {
                cardImageContainer = cardImageContainer || card.querySelector('.cardImageContainer');
                processExit(e, card, cardImageContainer);
            });
        }
    }

    function create(container) {
        var cards = container.querySelectorAll('.card');

        for (var i = 0, length = cards.length; i < length; i++) {
            createSingle(cards[i]);
        }
    }

    return {
        create: create
    };
});