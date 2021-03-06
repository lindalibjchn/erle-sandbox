//// LOGIC FOR TURNING WHEEL COORDINATES INTO EXPRESSIONS
function changeExpression( emotionCoords, surprise ) {

    // stop problem with all zeros in angle calcuation
    if ( emotionCoords[ 0 ] === 0 && emotionCoords[ 1 ] === 0 ) {

        emotionCoords = [ 0.05, 0.05 ];

    };

    // check if emotion is in centre of circle - if so there is no change
    let dia = Math.sqrt( emotionCoords[0]**2 + emotionCoords[1]**2 )

    let sectorNRatio = getTwoExpressions( emotionCoords );
    //console.log('sectorNRatio:', sectorNRatio);
    let exp01 = sectors[ sectorNRatio[ 0 ] ][ 0 ];
    let exp02 = sectors[ sectorNRatio[ 0 ] ][ 1 ];
    //let speech_rate01 = exp01.speaking_rate;
    //let speech_rate02 = exp02.speaking_rate;
    let ratio = sectorNRatio[ 1 ];

    //arguments are [happyExpression, contentExpression], ratio of 1st to 2nd, diameter/amount, surprise amount
    let calculatedExpressions = createCalculatedExpression( sectors[ sectorNRatio[ 0 ] ], ratio,  dia, surprise );
    expressionObject.calculated = calculatedExpressions[ 0 ]
    expressionObject.half = calculatedExpressions[ 1 ]
    expressionObject.quarter = calculatedExpressions[ 2 ]


}

function getTwoExpressions( eCo ) {

    var angle; 

    if ( eCo[0] >= 0 && eCo[1] >= 0 ) {

        angle = ( 180 / Math.PI ) * ( Math.atan( eCo[ 1 ] / eCo[ 0 ] ));

    } else if ( eCo[0] <= 0 && eCo[1] > 0 ) {

        angle = 180 + ( 180 / Math.PI ) * ( Math.atan( eCo[ 1 ] / eCo[ 0 ] ));

    } else if ( eCo[0] <= 0 && eCo[1] <= 0 ) {
    
        angle = 180 + ( 180 / Math.PI ) * ( Math.atan( eCo[ 1 ] / eCo[ 0 ] ));

    } else if ( eCo[0] >= 0 && eCo[1] < 0 ) {

        angle = 360 + ( 180 / Math.PI ) * ( Math.atan( eCo[ 1 ] / eCo[ 0 ] ));

    }


    // calculate amount away from far edge going anti-clockwise through wheel to calc ratio of each expression amount
    var amountAwayFromFarEdge;
    var sector;
    if ( angle <= 36 || angle > 324 ) {

        sector = 0;

        if ( angle <= 36 ) {

            amountAwayFromFarEdge = ( 36 - angle ) / 72;

        } else {

            amountAwayFromFarEdge = ( 36 + 360 - angle ) / 72;

        }
        

    } else if ( angle <= 108 && angle > 36 ) {

        sector = 1;
        amountAwayFromFarEdge = ( 108 - angle ) / 72;

    } else if ( angle <= 180 && angle > 108 ) {

        sector = 2;
        amountAwayFromFarEdge = ( 180 - angle ) / 72;

    } else if ( angle <= 252 && angle > 180 ) {

        sector = 3;
        amountAwayFromFarEdge = ( 252 - angle ) / 72;

    } else if ( angle <= 324 && angle > 252 ) {

        sector = 4;
        amountAwayFromFarEdge = ( 324 - angle ) / 72;

    }

    return [ sector, amountAwayFromFarEdge ];

}

function createSingleExpression( exp, mult ) {

    let calcExp = $.extend(true, {}, exp);
    let halfCalcExp = $.extend(true, {}, exp);
    let quartCalcExp = $.extend(true, {}, exp);

    Object.keys( exp.AUs ).forEach( function( AU ) {

        Object.keys( exp.AUs[ AU ] ).forEach( function( bone ) {

            let expThisBone = exp.AUs[ AU ][ bone ]

            for ( var j=0; j < 2; j++ ) {

                for ( var k=0; k < 3; k++ ) {

                    let movementAmount = expThisBone[ j ][ k ] * mult;
                    let halfAmount = 0.5 * expThisBone[ j ][ k ] * mult;
                    let quartAmount = 0.25 * expThisBone[ j ][ k ] * mult;

                    calcExp.AUs[ AU ][ bone ][ j ][ k ] = movementAmount;
                    halfCalcExp.AUs[ AU ][ bone ][ j ][ k ] = halfAmount;
                    quartCalcExp.AUs[ AU ][ bone ][ j ][ k ] = quartAmount;

                }

            }

        })

    })

    let eyelidMovementAmount = exp.eyelids * mult;
    calcExp.eyelids = eyelidMovementAmount;
    halfCalcExp.eyelids = 0.5 * eyelidMovementAmount;
    quartCalcExp.eyelids = 0.25 * eyelidMovementAmount;

    let calculated = getAbsoluteCoordsOfExpressionTo( calcExp ); 
    let half = getAbsoluteCoordsOfExpressionTo( halfCalcExp );
    let quarter = getAbsoluteCoordsOfExpressionTo( quartCalcExp );

    return [ calculated, half, quarter ]

}

var sectors = [ 
    [ expressionObject.rel.expressions.content, expressionObject.rel.expressions.happy ], 
    [ expressionObject.rel.expressions.happy, expressionObject.rel.expressions.disgust ],
    [ expressionObject.rel.expressions.disgust, expressionObject.rel.expressions.fear ],
    [ expressionObject.rel.expressions.fear, expressionObject.rel.expressions.sad ],
    [ expressionObject.rel.expressions.sad, expressionObject.rel.expressions.content ]
]

function createCalculatedExpression( twoExpressions, ratio, mult, surp ){

    calcExp = $.extend(true, {}, expressionObject.rel.expressions.blank );
    halfCalcExp = $.extend(true, {}, expressionObject.rel.expressions.blank );
    quartCalcExp = $.extend(true, {}, expressionObject.rel.expressions.blank );

    let zeroMovement = [[0,0,0],[0,0,0]];

    let expression01Amount = ratio * mult;
    let expression02Amount = ( 1 - ratio ) * mult;

    let expression01 = twoExpressions[ 0 ];
    let expression02 = twoExpressions[ 1 ];

    // loops through every pos and rot a,y,z of each bone and assigns mix of two expressions in proportion to calcExp. negativeCalculatedExpression is for returning to neutral
    Object.keys( calcExp.AUs ).forEach( function( AU ) {

        Object.keys( calcExp.AUs[AU] ).forEach( function( bone ) {

            var expression01ThisBone;
            expression01ThisBone = expression01.AUs[ AU ][ bone ];

            var expression02ThisBone;
            expression02ThisBone = expression02.AUs[ AU ][ bone ];

            //maybe no surprise at all
            var surpriseExpressionThisBone = expressionObject.rel.expressions.surprise.AUs[ AU ][ bone ];

            if ( expression01ThisBone === zeroMovement && expression02ThisBone === zeroMovement && surpriseExpressionThisBone === zeroMovement ) { 

            } else {

                calcExp.AUs[ AU ][ bone ] = [[],[]];
                halfCalcExp.AUs[ AU ][ bone ] = [[],[]];
                quartCalcExp.AUs[ AU ][ bone ] = [[],[]];

                for ( var j=0; j < 2; j++ ) {

                    for ( var k=0; k < 3; k++ ) {

                        let movementAmount = expression01ThisBone[ j ][ k ] * expression01Amount + expression02ThisBone[ j ][ k ] * expression02Amount + surpriseExpressionThisBone[ j ][ k ] * surp;
                        let halfAmount = 0.5 * expression01ThisBone[ j ][ k ] * expression01Amount + 0.5 * expression02ThisBone[ j ][ k ] * expression02Amount + 0 * surpriseExpressionThisBone[ j ][ k ] * surp// * 0.25; // smaller surprise to open mouth a wee bit
                        let quartAmount = 0.25 * expression01ThisBone[ j ][ k ] * expression01Amount + 0.25 * expression02ThisBone[ j ][ k ] * expression02Amount + 0 * surpriseExpressionThisBone[ j ][ k ] * surp// * 0.1; // smaller surprise to open mouth a wee bit

                        calcExp.AUs[ AU ][ bone ][ j ][ k ] = movementAmount;
                        halfCalcExp.AUs[ AU ][ bone ][ j ][ k ] = halfAmount;
                        quartCalcExp.AUs[ AU ][ bone ][ j ][ k ] = quartAmount;
                        //only for half
                        //negativeCalculatedExpression.AUs[ AU ][ bone ][ j ][ k ] = -movementAmount;

                    }

                }

            }

        })

    })

    let eyelidMovementAmount = expression01.eyelids * expression01Amount + expression02.eyelids * expression02Amount + expressionObject.abs.expressions.surprise.eyelids * surp
    calcExp.eyelids = eyelidMovementAmount;
    halfCalcExp.eyelids = 0.5 * eyelidMovementAmount;
    quartCalcExp.eyelids = 0.25 * eyelidMovementAmount;

    let calculated = getAbsoluteCoordsOfExpressionTo( calcExp ); 
    let half = getAbsoluteCoordsOfExpressionTo( halfCalcExp );
    let quarter = getAbsoluteCoordsOfExpressionTo( quartCalcExp );

    return [ calculated, half, quarter ]


}

