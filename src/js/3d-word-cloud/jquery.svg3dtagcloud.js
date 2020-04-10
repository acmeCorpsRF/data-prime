/*
Copyright (c) 2017 Niklas Knaack

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.  IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/

(function () {

    function SVG3DTagCloud(element, params) {

        let settings = {
            entries: [],
            width: 480,
            height: 480,
            radius: '70%',
            radiusMin: 75,
            bgDraw: true,
            bgColor: '#000',
            opacityOver: 1.00,
            opacityOut: 0.05,
            opacitySpeed: 6,
            fov: 800,
            speed: 2,
            fontFamily: 'Arial, sans-serif',
            fontSize: '15',
            fontColor: '#fff',
            linkClass: '',
            hover: false,
            click: false,
            fontWeight: 'normal',//bold
            fontStyle: 'normal',//italic
            fontStretch: 'normal',//wider, narrower, ultra-condensed, extra-condensed, condensed, semi-condensed, semi-expanded, expanded, extra-expanded, ultra-expanded
            fontToUpperCase: false,
            tooltipFontFamily: 'Arial, sans-serif',
            tooltipFontSize: '15',
            tooltipFontColor: '#fff',
            tooltipFontWeight: 'normal',//bold
            tooltipFontStyle: 'normal',//italic
            tooltipFontStretch: 'normal',//wider, narrower, ultra-condensed, extra-condensed, condensed, semi-condensed, semi-expanded, expanded, extra-expanded, ultra-expanded
            tooltipFontToUpperCase: false,
            tooltipTextAnchor: 'left',
            tooltipPosition: '',
            tooltipDiffX: 0,
            tooltipDiffY: 10,
            animatingSpeed: 0.01,
            animatingRadiusLimit: 1.3,
            formatter: function (label) {
                return label.tooltipLabel
            },
            onClick: function (entry, event) {
                console.log(entry);
            }
        };

        if (params !== undefined)
            for (let prop in params)
                if (params.hasOwnProperty(prop) && settings.hasOwnProperty(prop))
                    settings[prop] = params[prop];

        if (!settings.entries.length) return false;

        let entryHolder = [];
        let tooltip;
        let radius;
        let diameter;
        let mouseReact = true;
        let mousePos = {x: 0, y: 0};
        let center2D;
        let center3D = {x: 0, y: 0, z: 0};
        let speed = {x: 0, y: 0};
        let position = {sx: 0, cx: 0, sy: 0, cy: 0};
        let MATHPI180 = Math.PI / 180;
        let svg;
        let svgNS = 'http://www.w3.org/2000/svg';
        let bg;
        let animFrameId;
        let radius_factor = 1;

        function destroy() {
            window.cancelAnimFrame(animFrameId);
            window.removeEventListener('resize', resizeHandler);
            if (bg) {
                svg.removeChild(bg);
            }
            if (svg) {
                element.removeChild(svg);
                svg.removeEventListener('mousemove', mouseMoveHandler);
                svg.remove();
            }
        }

        function init() {
            svg = document.createElementNS(svgNS, 'svg');
            svg.addEventListener('mousemove', mouseMoveHandler);
            element.appendChild(svg);
            if (settings.bgDraw) {
                bg = document.createElementNS(svgNS, 'rect');
                bg.setAttribute('x', 0);
                bg.setAttribute('y', 0);
                bg.setAttribute('fill', settings.bgColor);
                svg.appendChild(bg);
            }

            addEntries();
            reInit();
            animloop();
            window.addEventListener('resize', resizeHandler);
        }

        function reInit() {
            let windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            let windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            let svgWidth = windowWidth;
            let svgHeight = windowHeight;
            if (settings.width.toString().indexOf('%') > 0 || settings.height.toString().indexOf('%') > 0) {
                svgWidth = Math.round(element.offsetWidth / 100 * parseInt(settings.width));
                svgHeight = Math.round(svgWidth / 100 * parseInt(settings.height));
            } else {
                svgWidth = parseInt(settings.width);
                svgHeight = parseInt(settings.height);
            }
            if (windowWidth <= svgWidth)
                svgWidth = windowWidth;
            if (windowHeight <= svgHeight)
                svgHeight = windowHeight;
            center2D = {x: svgWidth / 2, y: svgHeight / 2};
            speed.x = settings.speed / center2D.x;
            speed.y = settings.speed / center2D.y;
            if (svgWidth >= svgHeight)
                diameter = svgHeight / 100 * parseInt(settings.radius);
            else
                diameter = svgWidth / 100 * parseInt(settings.radius);
            if (diameter < 1)
                diameter = 1;
            radius = diameter / 2;
            if (radius < settings.radiusMin) {
                radius = settings.radiusMin;
                diameter = radius * 2;
            }
            svg.setAttribute('width', svgWidth);
            svg.setAttribute('height', svgHeight);
            if (settings.bgDraw) {
                bg.setAttribute('width', svgWidth);
                bg.setAttribute('height', svgHeight);
            }
            setEntryPositions(radius * radius_factor);
        }

        function setEntryPositions(radius) {
            for (let i = 0, l = entryHolder.length; i < l; i++) {
                setEntryPosition(entryHolder[i], radius);
            }
        }

        function setEntryPosition(entry, radius) {
            let dx = entry.vectorPosition.x - center3D.x;
            let dy = entry.vectorPosition.y - center3D.y;
            let dz = entry.vectorPosition.z - center3D.z;
            let length = Math.sqrt(dx * dx + dy * dy + dz * dz);
            entry.vectorPosition.x /= length;
            entry.vectorPosition.y /= length;
            entry.vectorPosition.z /= length;
            entry.vectorPosition.x *= radius;
            entry.vectorPosition.y *= radius;
            entry.vectorPosition.z *= radius;
        }

        function addEntry(index, entryObj, x, y, z) {
            let entry = {};
            if (typeof entryObj.label != 'undefined') {
                entry.dot = document.createElementNS(svgNS, 'rect');
                entry.dot.setAttribute('width', 7);
                entry.dot.setAttribute('height', 7);
                entry.dot.setAttribute('stroke', '#000000');
                entry.dot.setAttribute('fill', '#ffffff');
                entry.dot.setAttribute('stroke-width', 1);
                entry.dot.setAttribute('rx', 50);
                entry.dot.setAttribute('ry', 50);
                entry.substrate = document.createElementNS(svgNS, 'rect');
                entry.substrate.setAttribute('width', entryObj.label.length * 10);
                entry.substrate.setAttribute('height', 25);
                entry.substrate.setAttribute('stroke', '#000000');
                entry.substrate.setAttribute('fill', '#ffffff');
                entry.substrate.setAttribute('stroke-width', 1);
                entry.substrate.setAttribute('rx', 15);
                entry.substrate.setAttribute('ry', 15);
                entry.element = document.createElementNS(svgNS, 'text');
                entry.element.setAttribute('x', 0);
                entry.element.setAttribute('y', 0);
                if (typeof entryObj.fontColor != 'undefined') {
                    entry.element.setAttribute('fill', entryObj.fontColor);
                } else {
                    entry.element.setAttribute('fill', settings.fontColor);
                }
                entry.element.setAttribute('font-family', settings.fontFamily);
                entry.element.setAttribute('font-size', entryObj.fontSize ? entryObj.fontSize : settings.fontSize);
                entry.element.setAttribute('font-weight', settings.fontWeight);
                entry.element.setAttribute('font-style', settings.fontStyle);
                entry.element.setAttribute('font-stretch', settings.fontStretch);
                entry.element.setAttribute('text-anchor', 'left');
                entry.element.textContent = settings.fontToUpperCase ? entryObj.label.toUpperCase() : entryObj.label;
            } else if (typeof entryObj.image != 'undefined') {
                entry.element = document.createElementNS(svgNS, 'image');
                entry.element.setAttribute('x', 0);
                entry.element.setAttribute('y', 0);
                entry.element.setAttribute('width', entryObj.width);
                entry.element.setAttribute('height', entryObj.height);
                entry.element.setAttribute('id', 'image_' + index);
                entry.element.setAttributeNS('http://www.w3.org/1999/xlink', 'href', entryObj.image);
                entry.diffX = entryObj.width / 2;
                entry.diffY = entryObj.height / 2;
            }
            entry.link = document.createElementNS(svgNS, 'a');
            entry.link.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', entryObj.url);
            entry.link.setAttribute('target', entryObj.target);
            if (settings.hover === true) {
                entry.link.addEventListener('mouseover', mouseOverHandler, true);
                entry.link.addEventListener('mouseout', mouseOutHandler, true);
            }
            if (settings.click) {
                entry.link.addEventListener('click', mouseClickHandler, true)
            }
            entry.link.setAttribute('class', settings.linkClass);
            entry.link.appendChild(entry.substrate);
            entry.link.appendChild(entry.element);
            entry.link.appendChild(entry.dot);
            if (typeof entryObj.tooltip != 'undefined') {
                entry.tooltip = true;
                entry.tooltipLabel = settings.tooltipFontToUpperCase ? entryObj.tooltip.toUpperCase() : entryObj.tooltip;
            } else {
                entry.tooltip = false;
            }
            entry.index = index;
            entry.mouseOver = false;
            entry.vectorPosition = {x: x, y: y, z: z};
            entry.vector2D = {x: 0, y: 0};
            svg.appendChild(entry.link);
            return entry;
        }

        function addEntries() {
            let tooltip = false;
            for (let i = 1, l = settings.entries.length + 1; i < l; i++) {
                let phi = Math.acos(-1 + (2 * i) / l);
                let theta = Math.sqrt(l * Math.PI) * phi;
                let x = Math.cos(theta) * Math.sin(phi);
                let y = Math.sin(theta) * Math.sin(phi);
                let z = Math.cos(phi);
                let entry = addEntry(i - 1, settings.entries[i - 1], x, y, z);
                entryHolder.push(entry);
                if (typeof settings.entries[i - 1].tooltip != 'undefined') {
                    tooltip = true;
                }
            }
            if (tooltip) {
                addTooltip();
            }
        }

        function addTooltip() {
            tooltip = document.createElement('div');
            tooltip.style.opacity = 0;
            // tooltip.setAttribute('id', '0-asd');
            // tooltip.setAttribute('x', 0);
            // tooltip.setAttribute('y', 0);
            // tooltip.setAttribute('padding',10);
            // tooltip.setAttribute('transform','translate('+settings.tooltipFontSize * +')')
            tooltip.style.color = settings.tooltipFontColor;
            tooltip.style.fontFamily = settings.tooltipFontFamily;
            tooltip.style.fontSize = settings.tooltipFontSize + 'px';
            tooltip.style.position = 'absolute';
            tooltip.style.top = element.clientHeight;
            tooltip.style.left = 0;
            tooltip.style.fontWeight = settings.tooltipFontWeight;
            tooltip.style.fontStyle = settings.tooltipFontStyle;
            tooltip.style.width = '200px';
            tooltip.style.fontStretch = settings.tooltipFontStretch;
            tooltip.style.textAnchor = settings.tooltipTextAnchor;
            tooltip.textContent = '';
            element.appendChild(tooltip);
        }

        function getEntryByElement(element) {
            for (let i = 0, l = entryHolder.length; i < l; i++) {
                let entry = entryHolder[i];
                if (entry.element.getAttribute('x') === element.getAttribute('x') && entry.element.getAttribute('y') === element.getAttribute('y') ||
                    entry.substrate.getAttribute('x') === element.getAttribute('x') && entry.substrate.getAttribute('y') === element.getAttribute('y') ||
                    entry.dot.getAttribute('x') === element.getAttribute('x') && entry.dot.getAttribute('y') === element.getAttribute('y')
                ) {
                    return entry;
                }
            }
            return null;
        }

        function highlightEntry(entry) {
            for (let i = 0, l = entryHolder.length; i < l; i++) {
                let e = entryHolder[i];
                if (e.index === entry.index) {
                    e.mouseOver = true;
                } else {
                    e.mouseOver = false;
                }
            }
        }

        let formatter = settings.formatter;

        function showTooltip(entry, event) {
            if (entry.tooltip) {
                tooltip.style.width = 'auto';
                let width = element.clientWidth,
                    height = element.clientHeight,
                    tooltipWidth = tooltip.clientWidth,
                    tooltipHeight = tooltip.clientHeight,
                    offsetOver = 0,
                    offsetX = 0.1 || settings.tooltipOffsetX,
                    offsetY = 0.1 || settings.tooltipOffsetY;
                tooltip.style.visibility = 'visible';
                switch (settings.tooltipPosition) {
                    case 'top-left':
                        tooltip.style.top = event.offsetY - 15 + offsetY - tooltipHeight + 'px';
                        tooltip.style.left = event.offsetX - tooltipWidth + 'px';
                        break;
                    case 'top-right':
                        tooltip.style.top = event.offsetY - 15 + offsetY - tooltipHeight + 'px';
                        tooltip.style.left = event.offsetX + 'px';
                        break;
                    case 'bottom-left':
                        tooltip.style.top = event.offsetY - 15 + offsetY + tooltipHeight + 'px';
                        tooltip.style.left = event.offsetX - tooltipWidth + 'px';
                        break;
                    case 'bottom-right':
                        tooltip.style.top = event.offsetY - 15 + offsetY + tooltipHeight + 'px';
                        tooltip.style.left = event.offsetX + 'px';
                        break;
                    default:
                        if ((tooltipWidth > width - event.offsetX || width - event.offsetX < tooltipWidth - event.offsetX)) {
                            offsetOver = -tooltipWidth / 2
                        }
                        tooltip.style.left = event.offsetX + offsetOver + offsetX + -tooltipWidth / 2 + 'px';
                        tooltip.style.top = event.offsetY - 15 + offsetY - tooltipHeight + 'px';
                        break;
                }
                tooltip.style.position = 'absolute';
                tooltip.style.borderRadius = '5px';
                tooltip.style.padding = '5px 8px';
                tooltip.style.zIndex = 999;
                tooltip.style.opacity = 0.9;
                tooltip.style.background = 'rgb(3,6,18)';
                tooltip.style.transition = 'all ease .1s';
                tooltip.innerHTML = formatter(entry);
            }
        }

        function hideTooltip(entry) {
            tooltip.style.opacity = 0;
            tooltip.style.visibility = 'hidden'
        }

        let onClick = settings.onClick;

        function entryClick(entry, event) {
            onClick(entry, event)
        }

        function render() {
            let fx = speed.x * mousePos.x - settings.speed;
            let fy = settings.speed - speed.y * mousePos.y;
            let angleX = fx * MATHPI180;
            let angleY = fy * MATHPI180;
            position.sx = Math.sin(angleX);
            position.cx = Math.cos(angleX);
            position.sy = Math.sin(angleY);
            position.cy = Math.cos(angleY);
            for (let i = 0, l = entryHolder.length; i < l; i++) {
                let entry = entryHolder[i];
                if (mouseReact) {
                    let rx = entry.vectorPosition.x;
                    let rz = entry.vectorPosition.y * position.sy + entry.vectorPosition.z * position.cy;
                    entry.vectorPosition.x = rx * position.cx + rz * position.sx;
                    entry.vectorPosition.y = entry.vectorPosition.y * position.cy + entry.vectorPosition.z * -position.sy;
                    entry.vectorPosition.z = rx * -position.sx + rz * position.cx;
                }
                let scale = settings.fov / (settings.fov + entry.vectorPosition.z);
                entry.vector2D.x = entry.vectorPosition.x * scale + center2D.x;
                entry.vector2D.y = entry.vectorPosition.y * scale + center2D.y;
                if (entry.diffX && entry.diffY) {
                    entry.vector2D.x -= entry.diffX;
                    entry.vector2D.y -= entry.diffY;
                }
                entry.substrate.setAttribute('x', entry.vector2D.x - 10);
                entry.substrate.setAttribute('y', entry.vector2D.y - 17);
                entry.element.setAttribute('x', entry.vector2D.x);
                entry.element.setAttribute('y', entry.vector2D.y);
                entry.dot.setAttribute('x', entry.vector2D.x - 10);
                entry.dot.setAttribute('y', entry.vector2D.y + 15);
                let opacityRect,
                    opacityText,
                    opacityDot;
                if (mouseReact) {
                    opacityRect = (radius - entry.vectorPosition.z) / diameter;
                    if (opacityRect < settings.opacityOut) {
                        opacityRect = settings.opacityOut;
                    }
                    opacityText = (radius - entry.vectorPosition.z) / diameter;
                    if (opacityText < settings.opacityOut) {
                        opacityText = settings.opacityOut;
                    }
                    opacityDot = (radius - entry.vectorPosition.z) / diameter;
                    if (opacityDot < settings.opacityOut) {
                        opacityDot = settings.opacityOut;
                    }
                } else {
                    opacityRect = parseFloat(entry.substrate.getAttribute('opacity'));
                    opacityText = parseFloat(entry.element.getAttribute('opacity'));
                    opacityDot = parseFloat(entry.dot.getAttribute('opacity'));
                    if (entry.mouseOver) {
                        opacityRect += (settings.opacityOver - opacityRect) / settings.opacitySpeed;
                        opacityText += (settings.opacityOver - opacityText) / settings.opacitySpeed;
                        opacityDot += (settings.opacityOver - opacityDot) / settings.opacitySpeed;
                    } else {
                        opacityRect += (settings.opacityOut - opacityRect) / settings.opacitySpeed;
                        opacityText += (settings.opacityOut - opacityText) / settings.opacitySpeed;
                        opacityDot += (settings.opacityOut - opacityDot) / settings.opacitySpeed;
                    }
                }
                entry.substrate.setAttribute('opacity', opacityRect * (1 - ((radius_factor - 1) / (settings["animatingRadiusLimit"] - 1))));
                entry.element.setAttribute('opacity', opacityText * (1 - ((radius_factor - 1) / (settings["animatingRadiusLimit"] - 1))));
                entry.dot.setAttribute('opacity', opacityDot * (1 - ((radius_factor - 1) / (settings["animatingRadiusLimit"] - 1))));
            }
            entryHolder = entryHolder.sort(function (a, b) {
                return (b.vectorPosition.z - a.vectorPosition.z);
            });
        }

        window.requestAnimFrame = (function () {
            return window.requestAnimationFrame ||
                window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame ||
                function (callback) {
                    return window.setTimeout(callback, 1000 / 60);
                };
        })();

        window.cancelAnimFrame = (function () {
            if (window.requestAnimationFrame) {
                return window.cancelAnimationFrame;
            } else if (window.webkitRequestAnimationFrame) {
                return window.webkitCancelAnimationFrame;
            } else if (window.mozRequestAnimationFrame) {
                return window.mozCancelAnimationFrame;
            }
            return window.clearTimeout;
        })();

        function animloop() {
            animFrameId = requestAnimFrame(animloop);
            render();
        }

        function mouseClickHandler(event) {
            let entry = getEntryByElement(event.target);
            if (entry) {
                entryClick(entry, event);
            }
        }

        function mouseOverHandler(event) {
            mouseReact = false;
            let entry = getEntryByElement(event.target);
            highlightEntry(entry);
            if (entry.tooltip) {
                showTooltip(entry, event);
            }
        }

        function mouseOutHandler(event) {
            mouseReact = true;
            let entry = getEntryByElement(event.target);
            if (entry.tooltip) {
                hideTooltip(entry);
            }
        }

        function mouseMoveHandler(event) {
            mousePos = getMousePos(svg, event);
        }

        function getMousePos(svg, event) {
            let rect = svg.getBoundingClientRect();
            return {
                x: event.clientX - rect.left,
                y: event.clientY - rect.top
            };
        }

        function resizeHandler(event) {
            reInit();
        }

        function setRadiusFactor(factor) {
            radius_factor = Math.min(Math.max(factor, 1), settings["animatingRadiusLimit"]);
            reInit();
        }

        function resetRadiusFactor() {
            setRadiusFactor(1);
        }

        function setEntries(entries) {
            try {
                destroy();
                settings["entries"] = entries;
                init();
            } catch (e) {

            }
        }

        let animOut_cb = false, animIn_cb = false, animating = false;

        function _animOut() {
            if (animating = radius_factor < settings["animatingRadiusLimit"]) {
                setRadiusFactor(radius_factor + settings["animatingSpeed"]);
                requestAnimFrame(_animOut);
            } else {
                if (typeof animOut_cb === 'function') {
                    animOut_cb();
                    animOut_cb = false;
                }
            }
        }

        function _animIn() {
            if (animating = radius_factor > 1) {
                setRadiusFactor(radius_factor - settings["animatingSpeed"]);
                requestAnimFrame(_animIn);
            } else {
                if (typeof animIn_cb === 'function') {
                    animIn_cb();
                    animIn_cb = false;
                }
            }
        }

        function animOut(callback) {
            if (!animating) {
                radius_factor = 1;
                animOut_cb = callback;
                _animOut();
            }
        }

        function animIn(callback) {
            if (!animating) {
                radius_factor = settings["animatingRadiusLimit"];
                animIn_cb = callback;
                _animIn();
            }
        }

        try {
            init();
        } catch (e) {

        }

        this.destroy = destroy;
        this.animOut = animOut;
        this.animIn = animIn;
        this.setEntries = setEntries;
    }

    window.SVG3DTagCloud = SVG3DTagCloud;
    if (typeof module !== `undefined` && typeof exports === `object`) {
        module.exports = SVG3DTagCloud;
    }

}());

if (typeof jQuery !== 'undefined') {
    (function ($) {
        $.fn.svg3DTagCloud = function (params) {
            let args = arguments;
            return this.each(function () {
                if (!$.data(this, 'plugin_SVG3DTagCloud')) {
                    $.data(this, 'plugin_SVG3DTagCloud', new SVG3DTagCloud(this, params));
                } else {
                    let plugin = $.data(this, 'plugin_SVG3DTagCloud');
                    if (plugin[params]) {
                        plugin[params].apply(this, Array.prototype.slice.call(args, 1));
                    } else {
                        $.error('Method ' + params + ' does not exist on jQuery.svg3DTagCloud');
                    }
                }
            });
        };
    }(jQuery));
}