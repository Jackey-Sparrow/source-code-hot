```

/**
@type {number}
*/
MouseEventInit.prototype.screenX = 0;
/**
@type {number}
*/
MouseEventInit.prototype.screenY = 0;
/**
@type {number}
*/
MouseEventInit.prototype.clientX = 0;
/**
@type {number}
*/
MouseEventInit.prototype.clientY = 0;
/**
@type {number}
*/
MouseEventInit.prototype.button = 0;
/**
@type {number}
*/
MouseEventInit.prototype.buttons = 0;
/**
@type {EventTarget}
*/
MouseEventInit.prototype.relatedTarget = 0;
MouseEventInit.prototype = new SharedKeyboardAndMouseEventInit();
MouseEventInit = {};

/**
@browser Gecko
@type {number}
@const
*/
MouseEvent.prototype.screenX = 0;
/**
@browser Gecko
@type {number}
@const
*/
MouseEvent.prototype.screenY = 0;
/**
@browser Gecko
@type {number}
@const
*/
MouseEvent.prototype.clientX = 0;
/**
@browser Gecko
@type {number}
@const
*/
MouseEvent.prototype.clientY = 0;
/**
@browser Gecko
@type {boolean}
@const
*/
MouseEvent.prototype.ctrlKey = 0;
/**
@browser Gecko
@type {boolean}
@const
*/
MouseEvent.prototype.shiftKey = 0;
/**
@browser Gecko
@type {boolean}
@const
*/
MouseEvent.prototype.altKey = 0;
/**
@browser Gecko
@type {boolean}
@const
*/
MouseEvent.prototype.metaKey = 0;
/**
@browser Gecko
@type {Number}
@const
*/
MouseEvent.prototype.button = 0;
/**
@browser Gecko
@type {EventTarget}
@const
*/
MouseEvent.prototype.relatedTarget = 0;
/**
@browser Gecko
@type {number}
@const
*/
MouseEvent.prototype.buttons = 0;
/**
@browser Gecko
@param {string} keyIdentifierArg
@return {boolean}
*/
MouseEvent.prototype.getModifierState = function(keyIdentifierArg) {};
/**
@browser Gecko
@param {string} typeArg
@param {boolean} canBubbleArg
@param {boolean} cancelableArg
@param {AbstractView} viewArg
@param {number} detailArg
@param {number} screenXArg
@param {number} screenYArg
@param {number} clientXArg
@param {number} clientYArg
@param {boolean} ctrlKeyArg
@param {boolean} altKeyArg
@param {boolean} shiftKeyArg
@param {boolean} metaKeyArg
@param {number} buttonArg
@param {EventTarget} relatedTargetArg
@deprecated
*/
MouseEvent.prototype.initMouseEvent = function(typeArg,canBubbleArg,cancelableArg,viewArg,detailArg,screenXArg,screenYArg,clientXArg,clientYArg,ctrlKeyArg,altKeyArg,shiftKeyArg,metaKeyArg,buttonArg,relatedTargetArg) {};
/**
@browser Gecko
@param {string} namespaceURI
@param {string} typeArg
@param {boolean} canBubbleArg
@param {boolean} cancelableArg
@param {AbstractView} viewArg
@param {Number} detailArg
@param {Number} screenXArg
@param {Number} screenYArg
@param {Number} clientXArg
@param {Number} clientYArg
@param {boolean} ctrlKeyArg
@param {boolean} altKeyArg
@param {boolean} shiftKeyArg
@param {boolean} metaKeyArg
@param {Number} buttonArg
@param {EventTarget} relatedTargetArg
@deprecated
*/
MouseEvent.prototype.initMouseEventNS = function(namespaceURI,typeArg,canBubbleArg,cancelableArg,viewArg,detailArg,screenXArg,screenYArg,clientXArg,clientYArg,ctrlKeyArg,altKeyArg,shiftKeyArg,metaKeyArg,buttonArg,relatedTargetArg) {};
MouseEvent.prototype = new UIEvent();
MouseEvent = {};

```