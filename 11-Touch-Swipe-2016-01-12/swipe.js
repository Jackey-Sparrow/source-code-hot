/**
 * Created by lja on 2016/1/12.
 */
(function (document) {
    'use strict';

    var startX = 0,
        startY = 0,
        distance = window.devicePixelRatio >= 2 ? 25 : 50;

    var touchEvents = {
        start: 'touchstart',
        move: 'touchmove',
        end: 'touchend'
    };

    var element = document;

    //touchstart
    //touchend
    //touchmove
    element.addEventListener(touchEvents.start, touchStart);

    function touchStart(event) {
        var touches = event.touches;
        if (touches && touches.length) {
            startX = touches[0].pageX;
            startY = touches[0].pageY;
            element.addEventListener(touchEvents.move, touchMove);
            element.addEventListener(touchEvents.end, touchEnd);
        }
        event.preventDefault();

    }

    function touchMove(event) {
        console.log('move');
        var touches = event.touches;
        if (touches && touches.length) {
            var deltaX = startX - touches[0].pageX;
            var deltaY = startY - touches[0].pageY;

            if (deltaX >= distance) {
                console.log('left');
            }

            if (deltaX <= -distance) {
                console.log('right');
            }

            if (deltaY >= distance) {
                console.log('up');
            }

            if (deltaY <= -distance) {
                console.log('down');
            }

            //Math.abs取绝对值， 再移除事件监听，避免继续触发
            if (Math.abs(deltaX) >= 50 || Math.abs(deltaY) >= 50) {
                element.removeEventListener(touchEvents.move, touchMove);
                element.removeEventListener(touchEvents.end, touchEnd);
            }
        }

        event.preventDefault();
    }

    function touchEnd(event) {
        element.removeEventListener(touchEvents.move, touchMove);
        event.preventDefault();
    }

})(document);