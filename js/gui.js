$( function() {
    $( "#iso" ).slider({
        change: function( event, ui ) {
            let value = getIsoSlider();
            document.getElementById("isoValue").innerHTML = value;
        }
    });
} );

let setIsoSlider = function(value){
    $( "#iso" ).slider('value', value * 100);
};


let getIsoSlider = function(){
    return $( "#iso" ).slider("value") / 100.0;
};