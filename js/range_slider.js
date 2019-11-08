// Function for displaying slider values
// Modified from Codepen example: https://codepen.io/seanstopnik/pen/CeLqA

let rangeSlider = function(){
  let slider = document.getElementsByClassName('range-slider');

  for (let s of slider) {
      let range_and_slider = s.childNodes;
      range_and_slider[1].oninput = function() {
          range_and_slider[2].innerHTML = this.value;
      }
  }
};
