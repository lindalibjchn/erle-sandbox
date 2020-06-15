$(window).on( 'load', function() {

    definePrefixURL();
    loadScene( beginAnimation );
    dealWithResizing();
    //setCookie();

});

var prefixURL;
function definePrefixURL() {

    if ( inDevelopment ) {

        prefixURL = "http://127.0.0.1:8000/"

    } else {

        prefixURL = "http://erle-sandbox.ucd.ie/"

    }

}

function beginAnimation() {

    setBaseExpressionsAndMovements();
    animate();
    loadControlPanel();
    resetSaoirse();
    synthesisObject.parameters.voice = "Irish";
    $('#voiceSelectContainer').val("Irish");


}

function setBaseExpressionsAndMovements() {

    expressionObject.base = getAbsoluteCoordsOfExpressionNow(); // get absolute position of base expression
    expressionObject.now = $.extend( true, {}, expressionObject.base ); // create a copy of this for expression now
    getAbsoluteCoordsOfMainExpressions(); // gets coordinates for all main expressions
    let calculatedExpressions = createSingleExpression( expressionObject.rel.expressions.neutral, 1 );
    expressionObject.calculated = calculatedExpressions[ 0 ]
    expressionObject.half = calculatedExpressions[ 1 ]
    expressionObject.quarter = calculatedExpressions[ 2 ]
    synthesisObject.parameters.emphasis = 0;

    movementObject.base = getAbsoluteCoordsOfMovementNow(); // same as above for movementObject.abs
    movementObject.now = $.extend( true, {}, movementObject.base );
    getAbsoluteCoordsOfMainMovements(); // gets coordinates for all main expressions

}

function dealWithResizing() {

    window.addEventListener('resize', function() {
        
        resizeSaoirse();

    });

}

