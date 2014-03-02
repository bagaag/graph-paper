// Browser-based interactive graph paper using SVG
// https://github.com/wiseley/graph-paper
// Author: Matt Wiseley
// License: GPL2

function GraphPaper(options) {
  var w = options.w || 600;
  var h = options.h || 600;
  var boxSize = options.box || 25;
  var snap;
  var paper = hexToRGB(options.paper) || 'rgb(255, 255, 255)';
  var paperHex = options.hex || '#ffffff';
  var fill = hexToRGB(options.draw) || 'rgb(200, 200, 200)';
  var stroke = hexToRGB(options.grid) || 'rgb(190, 190, 190)';
  var mouse = false;
  var paperFormat = { stroke: stroke, strokeWidth: 1, fill: paper };
  var drawFormat = { stroke: stroke, strokeWidth: 1, fill: fill };
  var boxes = [];
  var dropper = false; // holds pointer to one of the color pickers in eyedropper mode
  var dropper_change; // pointer to appropriate change function 

  // color format conversion  
  function hexToRGB(h) {
    function hexToR(h) {return parseInt((cutHex(h)).substring(0,2),16)}
    function hexToG(h) {return parseInt((cutHex(h)).substring(2,4),16)}
    function hexToB(h) {return parseInt((cutHex(h)).substring(4,6),16)}
    function cutHex(h) {return (h.charAt(0)=="#") ? h.substring(1,7):h}
    if (typeof h == 'undefined') return h; 
    return 'rgb('+hexToR(h)+', '+hexToG(h)+', '+hexToB(h)+')'; 
  }

  // setup form controls and initialize svg
  function init() {
    // the "Draw" color picker
    $("#color").spectrum({
      color:fill,
      change: function(color) {
          updateFill(color.toRgbString())
      }
    });
    // the "Grid" color picker
    $("#gridcolor").spectrum({
      color:stroke,
      change: function(color) {
          updateGrid(color.toRgbString());
      }
    });
    // the "Paper" color picker
    $("#paper").spectrum({
      color:paper,
      change: function(color) {
          updatePaper(color.toRgbString());
          console.log('paperHex',paperHex);
          paperHex = color.toHexString();
          console.log('paperHex',paperHex);
      }
    });
    // the three eye dropper icons
    $("#colordrop").click(function() {
      eyeDropper($("#color"), updateFill);
    });
    $("#paperdrop").click(function() {
      eyeDropper($("#paper"), updatePaper);
    });
    $("#griddrop").click(function() {
      eyeDropper($("#gridcolor"), updateGrid);
    });
    // populate the fields, set the update event and init Snap
    setFields();
    $("#update").click(redraw);
    snap = Snap("#graph");
  }
  
  // enter eye dropper mode
  function eyeDropper(picker, change) {
    dropper = picker;
    dropper_change = change;
    $(".dropperhelp").show(200);
  }
  
  // exit eye dropper mode
  function exitEyeDropper(picker) {
    var rgb = picker.attr('fill');
    dropper.spectrum('set',rgb);
    dropper_change(rgb); // change event isn't called if set programmatically
    dropper = false;
    $(".dropperhelp").hide(200);
  }
  
  // event handler for user changing draw color
  function updateFill(color) {
    console.log('updateFill', color);
    fill = color;
    drawFormat.fill = color;
  }

  // event handler for user changing grid color
  function updateGrid(color) {
    $("#graph rect").attr('stroke',color);
    stroke = color;
    drawFormat.stroke = color;
    paperFormat.stroke = color;
  }
  
  // event handler for user changing paper color
  function updatePaper(color) {
    $("#graph rect").each(function(i,rect){
      rect = $(rect);
      var thisFill = rect.attr('fill');
      if (thisFill==paperHex || thisFill==paperFormat.fill) {
        rect.attr('fill', color);
      } else console.log('wasnt',rect.attr('fill'));
    });
    paperFormat.fill = color;
  }

  // set the form field values
  function setFields() {
    $("#w").val(w);
    $("#h").val(h);
    $("#box").val(boxSize);
  }

  // recreate the grid based on current form settings
  function redraw() {
    w = Number($("#w").val());
    h = Number($("#h").val());
    boxSize = Number($("#box").val());
    fill = $("#color").spectrum('get').toRgbString();
    snap.clear();
    $("#graph").empty();
    snap = Snap("#graph");
    drawGraph();
  }

  // draw the grid
  function drawGraph() {
    $("#container, #graph").height(h).width(w);
    boxes = [];
    for (var x=0; x<=w; x+=boxSize) {
      boxes[x] = [];
      for (var y=0; y<=h; y+=boxSize) {
        var r = snap.rect(x, y, boxSize, boxSize).attr(paperFormat);
        boxes[x][y] = r;
        r.draw = function() {
          this.attr({fill: fill});
        };
        r.mousedown(function() {
          if (!dropper) {
            this.draw();
          }
          else {
            exitEyeDropper(this);
          }
          mouse = true;
          return false;
        });
        r.mouseover(function() {
          if (mouse) this.draw();
        });
        r.mouseup(function() {
          mouse = false;
        });
      }
    }  
  }
  
  init();
  drawGraph();
}


