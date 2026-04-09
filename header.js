//This goes at the top of all pages
document.getElementById("header").innerHTML = `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <title>Rodge118's Site</title>
    <link rel="stylesheet" href="style.css">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
  </head>

  <nav id="navbar">
    <div class="HomeButton"><a href="index.html" style="color: orangered">R118</a></div>
    <a href="index.html"><button>Home</button></a>
    <!--<a href="demo.html"><button>Play Demo</button></a>-->
    <a href="about.html"><button>About</button></a>
    <!--<a href="test.html"><button>Testing page</button></a>-->
    <a href="tictactoe.html"><button>Tic Tac Toe</button></a>
  </nav>`;

  
/* Insert at the top of every page:
<div id="header"></div>
<script src="header.js"></script>
*/