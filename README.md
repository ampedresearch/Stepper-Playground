# Step Routine Playground
Interactive web app allowing users to control the parameters of a [step-dance](https://en.wikipedia.org/wiki/Stepping_(African-American)) routine including tempo, number of dancers, and timing offset, and instantly hear the results. It uses actual audio files captured from performances given by step dancers.

**Live URL: [https://ampedresearch.github.io/Stepper-Playground/](https://ampedresearch.github.io/Stepper-Playground/)**

## Research
This work is developed by researchers in the [AMPED Lab](http://www.ampedresearch.com) at NYU as part of ***Dance Data Science.***

[Bergner, Y., Mund, S., Chen, O., & Payne, W. (2019, October). First Steps in Dance Data Science: Educational Design. In Proceedings of the 6th International Conference on Movement and Computing (p. 14). ACM.](https://dl.acm.org/citation.cfm?id=3347137)

## Contributing
The web app is built using [p5.js](https://p5js.org) for animations and [Tone.js](https://tonejs.github.io) for audio. It is tested in Chrome, but should work in other browsers as well.

To run locally, download the source folder, fire up a local server, and navigate to it in your browser. For example:
```
$ python -m SimpleHTTPServer
```
