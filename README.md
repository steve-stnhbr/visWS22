## How to Use

Load one of the provided volume files through the GUI. 
Rotate the orbit camera around the bounding box using the left mouse button. Zoom using the scroll wheel. 


On the right side of the screen you will see a dropdown containing options for the render mode.
Below this dropdown you can see the histogram portraying the distribution of the density values present in the 
currently loaded Volume.

By clicking and dragging in the histogram you can data points for the transfer function. These are represented by a circle and a line. On the x-Axis the density value of the transfer function is selcted, on the y-axis the opacity of this part of the transfer function is selected. You can click on a transfer function indicator to either change its color (clicking on one of the squares) or remove the indicator completely (by clicking on remove). 
The color context menu can be closed by either clicking on the x or anywhere outside on the histogram.

If the rendermode is First Hit Projection at least on indicator has to be set for anything to be displayed

## Framework Description

This framework uses three.js and d3.js for volume rendering and setting the appearance, respectively. 
The following files are provided: 
* **index.html**: contains the HTML content. Please enter your names! Otherwise, it does not need to be changed 
(but can be, if required). 
* **style.css**: CSS styles (can be adjusted, but does not need to be changed). 
* **three.js/build/three.js**: Contains the three.js library. **Do not modify!**
* **shaders**: Folder containing a dummy vertex and fragment shader. **Add your shaders to this folder!** 
* **js**: Folder containing all JavaScript files. **Add new classes as separate js-files in this folder!** 
    * **vis1.js**: Main script file. Needs to be modified. 
    * **shader.js**: Base shader class. Does not need to be modified. Derive your custom shader materials from this class!
    * **testShader.js**: Example shader class demonstrating how to create and use a shader material 
    using external .essl files. Should not be used in the final submission.
    * **camera.js**: Simple orbit camera that moves nicely around our volumes. Does not need to be modified. 
    
Created 2021 by Manuela Waldner, Diana Schalko, amd Laura Luidolt based on the Vis1 Task 1 Qt framework 
initially created by Johanna Schmidt, Tobias Klein, and Laura Luidolt. 

## JavaScript

Javascript files should go to folder 'js' and end with '.js'. All new javascript files have to be included in index.html. 

Recommended IDE: Webstorm (free educational version available using TU Wien e-mail address)

*Important*: do not run index.html from the file system! Only execute it from inside WebStorm 
(by selecting a browser icon from the top right panel that appears when you open index.html) 
or from hosting the project within another web server. Opening index.html directly in the browser without a server
will result in an error when trying to load the the .essl shader files. 


## Shaders

.essl is the OpenGL ES shading language. Shader files should all be located in the folder 'shaders' and end with '.essl'.  

Recommended code editor: Visual Studio Code (free): https://code.visualstudio.com/

Install syntax highlighting for shading languages: https://marketplace.visualstudio.com/items?itemName=slevesque.shader

Enable syntax highlighting: open shader file --> in the bar on the bottom right, switch from plain text to GLSL.  