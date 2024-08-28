let timerInterval;
let startTime;
let moveCount = 0;

// SOUND EFFECTS
const dragStartSound = new Audio("/sound/put_down.mp3");
const dragEndSound = new Audio("/sound/put_down.mp3");
const victorySound = new Audio("/sound/victory.mp3");
const failedSound = new Audio("/sound/Failed.wav");

function playSound(sound) {
  sound.currentTime = 0;
  sound.play();
}

function allowDrop(event) {
  event.preventDefault();
}

const donutImageMap = {
  red: "/images/wholedonuts/wholedonut_1.png",
  blue: "/images/wholedonuts/wholedonut_2.png",
  green: "/images/wholedonuts/wholedonut_3.png",
  yellow: "/images/wholedonuts/wholedonut_4.png",
  orange: "/images/wholedonuts/wholedonut_6.png",
  purple: "/images/wholedonuts/wholedonut_6.png",
};

const preloadedImages = {};

// Preload the images when the game initializes
function preloadImages() {
  for (const color in donutImageMap) {
    const img = new Image();
    img.src = donutImageMap[color];
    preloadedImages[color] = img;
  }
}

function dragStart(event) {
  const ballContainer = event.target.closest(".ball-container");
  const tube = ballContainer.parentElement;
  if (tube.firstElementChild !== ballContainer) {
    event.preventDefault();
    return;
  }
  event.dataTransfer.setData("text", ballContainer.id);

  const donutColor = ballContainer.getAttribute("data-color");

  const img = preloadedImages[donutColor];

  // Adjust the offset values
  event.dataTransfer.setDragImage(img, 35, 25);
  setTimeout(() => ballContainer.classList.add("dragging"), 0);

  playSound(dragStartSound);
}
function dragEnd(event) {
  event.target.classList.remove("dragging");
  playSound(dragEndSound);
}

function drop(event) {
  event.preventDefault();
  const ballContainerId = event.dataTransfer.getData("text");
  const ballContainer = document.getElementById(ballContainerId);
  const targetTube = event.target.closest(".tube");

  if (!targetTube) {
    return;
  }

  const firstBallInTargetTube = targetTube.firstElementChild;
  if (
    !firstBallInTargetTube ||
    firstBallInTargetTube.querySelector(".frontball").style.backgroundImage ===
      ballContainer.querySelector(".frontball").style.backgroundImage
  ) {
    if (targetTube.childElementCount < 5) {
      ballContainer.classList.remove("dragging");
      targetTube.insertBefore(ballContainer, targetTube.firstChild);
      updateZIndexes(targetTube); // Update z-index after drop
      moveCount++;
      // document.getElementById("moves").textContent = `Moves: ${moveCount}`;
      checkWinCondition();
    }
  }
}

function dragOver(event) {
  const targetTube = event.target.closest(".tube");
  if (targetTube) {
    targetTube.classList.add("highlight");
  }
}

function dragLeave(event) {
  event.target.classList.remove("highlight");
}

function touchStart(event) {
  const ballContainer = event.target.closest(".ball-container");
  const tube = ballContainer.parentElement;
  if (tube.firstElementChild !== ballContainer) {
    event.preventDefault(); // Prevent default action if the ball is not at the top
    return;
  }

  const donutColor = ballContainer.getAttribute("data-color");

  const img = preloadedImages[donutColor];

  const touch = event.touches[0];
  const dragImage = img.cloneNode(true);
  dragImage.style.position = "absolute";
  dragImage.style.left = `${touch.clientX - 35}px`;
  dragImage.style.top = `${touch.clientY - 25}px`;
  dragImage.style.pointerEvents = "none";
  dragImage.id = "drag-image";
  document.body.appendChild(dragImage);

  ballContainer.classList.add("dragging");
  playSound(dragStartSound);
}

function touchMove(event) {
  event.preventDefault();
  const touch = event.touches[0];
  const dragImage = document.getElementById("drag-image");
  if (dragImage) {
    dragImage.style.left = `${touch.clientX - 35}px`;
    dragImage.style.top = `${touch.clientY - 25}px`;
  }
}

function touchEnd(event) {
  event.preventDefault();
  const ballContainer = event.target.closest(".ball-container");
  ballContainer.classList.remove("dragging");

  const dragImage = document.getElementById("drag-image");
  if (dragImage) {
    dragImage.remove(); // Remove the drag image after touch ends
  }

  const touch = event.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetTube = targetElement.closest(".tube");

  if (targetTube) {
    const firstBallInTargetTube = targetTube.firstElementChild;
    if (
      !firstBallInTargetTube ||
      firstBallInTargetTube.querySelector(".frontball").style
        .backgroundImage ===
        ballContainer.querySelector(".frontball").style.backgroundImage
    ) {
      if (targetTube.childElementCount < 5) {
        ballContainer.classList.remove("dragging");
        targetTube.insertBefore(ballContainer, targetTube.firstChild);
        updateZIndexes(targetTube); // Update z-index after drop
        moveCount++;
        checkWinCondition();
      }
    }
  }
  playSound(dragEndSound);
}
function triggerBounceAnimation(tube) {
  // Check if the tube already has the bounce-animation class
  if (!tube.classList.contains("bounce-animation")) {
    tube.classList.add("bounce-animation");
  }
}

function checkWinCondition() {
  const tubes = document.querySelectorAll(".tube");
  let allSorted = true;
  let nonEmptyTubes = 0;

  tubes.forEach((tube) => {
    if (tube.childElementCount > 0) {
      nonEmptyTubes++;
      if (tube.childElementCount !== 3) {
        // Adjust to match your tube capacity
        allSorted = false;
        return;
      }
      const firstBallColor = tube.firstElementChild.getAttribute("data-color");
      let isTubeSorted = true;
      for (let i = 0; i < tube.childElementCount; i++) {
        const currentBallColor = tube.children[i].getAttribute("data-color");
        if (currentBallColor !== firstBallColor) {
          allSorted = false;
          isTubeSorted = false;
          return;
        }
      }
      if (isTubeSorted) {
        // Trigger the bounce animation only once per tube
        triggerBounceAnimation(tube);
      }
    }
  });

  const statusElement = document.getElementById("status");
  const failStatusElement = document.getElementById("failstatus");

  // Calculate elapsed time in seconds
  const endTime = new Date();
  const elapsedTime = (endTime - startTime) / 1000;

  // Check if the time exceeds 40 seconds
  if (elapsedTime > 40) {
    clearInterval(timerInterval);
    statusElement.classList.remove("active");
    failStatusElement.style.display = "flex"; // Make sure it's visible before animating
    const themeSong = document.getElementById("theme-song");
    themeSong.pause();
    playSound(failedSound);
    setTimeout(() => {
      failStatusElement.classList.add("active");
    }, 10);
    return; // Stop further execution if the time limit is exceeded
  }

  // Check that there are exactly 4 non-empty tubes and all are sorted
  if (allSorted && nonEmptyTubes === 5) {
    clearInterval(timerInterval);

    // Reset all stars visibility before updating them
    for (let i = 0; i < 3; i++) {
      const starElement = document.getElementById(`star${i}`);
      if (starElement) {
        starElement.style.visibility = "hidden";
      }
    }

    // Determine the number of stars to display
    let stars = 1; // Default to 1 star
    if (elapsedTime < 20) {
      stars = 3;
    } else if (elapsedTime < 30) {
      stars = 2;
    }

    // Display the stars
    for (let i = 0; i < stars; i++) {
      const starElement = document.getElementById(`star${i}`);
      if (starElement) {
        starElement.style.visibility = "visible";
      }
    }

    statusElement.style.display = "flex";
    setTimeout(() => {
      statusElement.classList.add("active");
      playSound(victorySound);
    }, 10);
  } else {
    statusElement.classList.remove("active");
    failStatusElement.classList.remove("active");
    setTimeout(() => {
      statusElement.style.display = "none";
      failStatusElement.style.display = "none";
    }, 500);
  }
}

function startTimer() {
  startTime = new Date();
  timerInterval = setInterval(() => {
    const now = new Date();
    const elapsedTime = (now - startTime) / 1000; // elapsedTime in seconds
    const minutes = String(Math.floor(elapsedTime / 60)).padStart(2, "0");
    const seconds = String(Math.floor(elapsedTime % 60)).padStart(2, "0");
    document.getElementById("timer").textContent = `${minutes}:${seconds}`;

    if (elapsedTime > 40) {
      clearInterval(timerInterval);

      // Handle status and failstatus elements
      const statusElement = document.getElementById("status");
      const failStatusElement = document.getElementById("failstatus");
      const themeSong = document.getElementById("theme-song");

      statusElement.style.display = "none"; // Hide status element
      failStatusElement.style.display = "flex"; // Show failstatus element
      setTimeout(() => {
        failStatusElement.classList.add("active"); // Apply the active class after a short delay
        playSound(failedSound);
        themeSong.pause()
      }, 10);

      return;
    }
  }, 1000);
}

function updateZIndexes(tube) {
  const ballContainers = tube.querySelectorAll(".ball-container");
  const totalBalls = ballContainers.length;

  ballContainers.forEach((ballContainer, index) => {
    const frontball = ballContainer.querySelector(".frontball");
    // Set the z-index for the frontball only
    frontball.style.zIndex = totalBalls - index;
  });
}

function resetGame() {
  clearInterval(timerInterval);
  document.getElementById("timer").textContent = "00:00";
  // document.getElementById("moves").textContent = "Moves: 0";
  moveCount = 0;

  const gameContainer = document.getElementById("game-container");
  gameContainer.innerHTML = "";

  const tubes = Array.from({ length: 6 }, (_, i) => {
    const tube = document.createElement("div");
    tube.className = "tube";
    tube.id = `tube${i + 1}`;
    tube.ondrop = drop;
    tube.ondragover = allowDrop;
    tube.ondragenter = dragOver;
    tube.ondragleave = dragLeave;
    return tube;
  });

  const balls = [
    {
      id: "ball1",
      color: "red",
      frontImage: "/images/gamescreen/donuts/donut_1_front.webp",
      backImage: "/images/gamescreen/donuts/donut_1_back.webp",
    },
    {
      id: "ball2",
      color: "blue",
      frontImage: "/images/gamescreen/donuts/donut_2_front.webp",
      backImage: "/images/gamescreen/donuts/donut_2_back.webp",
    },
    {
      id: "ball3",
      color: "green",
      frontImage: "/images/gamescreen/donuts/donut_3_front.webp",
      backImage: "/images/gamescreen/donuts/donut_3_back.webp",
    },
    {
      id: "ball4",
      color: "red",
      frontImage: "/images/gamescreen/donuts/donut_1_front.webp",
      backImage: "/images/gamescreen/donuts/donut_1_back.webp",
    },
    {
      id: "ball5",
      color: "blue",
      frontImage: "/images/gamescreen/donuts/donut_2_front.webp",
      backImage: "/images/gamescreen/donuts/donut_2_back.webp",
    },
    {
      id: "ball6",
      color: "green",
      frontImage: "/images/gamescreen/donuts/donut_3_front.webp",
      backImage: "/images/gamescreen/donuts/donut_3_back.webp",
    },
    {
      id: "ball7",
      color: "red",
      frontImage: "/images/gamescreen/donuts/donut_1_front.webp",
      backImage: "/images/gamescreen/donuts/donut_1_back.webp",
    },
    {
      id: "ball8",
      color: "blue",
      frontImage: "/images/gamescreen/donuts/donut_2_front.webp",
      backImage: "/images/gamescreen/donuts/donut_2_back.webp",
    },
    {
      id: "ball9",
      color: "green",
      frontImage: "/images/gamescreen/donuts/donut_3_front.webp",
      backImage: "/images/gamescreen/donuts/donut_3_back.webp",
    },
    {
      id: "ball10",
      color: "yellow",
      frontImage: "/images/gamescreen/donuts/donut_4_front.webp",
      backImage: "/images/gamescreen/donuts/donut_4_back.webp",
    },
    {
      id: "ball11",
      color: "yellow",
      frontImage: "/images/gamescreen/donuts/donut_4_front.webp",
      backImage: "/images/gamescreen/donuts/donut_4_back.webp",
    },
    {
      id: "ball12",
      color: "yellow",
      frontImage: "/images/gamescreen/donuts/donut_4_front.webp",
      backImage: "/images/gamescreen/donuts/donut_4_back.webp",
    },
    {
      id: "ball13",
      color: "orange",
      frontImage: "/images/gamescreen/donuts/donut_6_front.webp",
      backImage: "/images/gamescreen/donuts/donut_6_back.webp",
    },
    {
      id: "ball14",
      color: "orange",
      frontImage: "/images/gamescreen/donuts/donut_6_front.webp",
      backImage: "/images/gamescreen/donuts/donut_6_back.webp",
    },
    {
      id: "ball15",
      color: "orange",
      frontImage: "/images/gamescreen/donuts/donut_6_front.webp",
      backImage: "/images/gamescreen/donuts/donut_6_back.webp",
    },
  ];

  const shuffledBalls = balls.sort(() => 0.5 - Math.random());

  for (let i = 0; i < shuffledBalls.length; i++) {
    const ballContainer = document.createElement("div");
    ballContainer.className = "ball-container";
    ballContainer.id = `container${shuffledBalls[i].id}`;
    ballContainer.setAttribute("data-color", shuffledBalls[i].color);

    const backball = document.createElement("div");
    backball.className = "backball";
    backball.style.backgroundImage = `url(${shuffledBalls[i].backImage})`;
    backball.style.backgroundSize = "cover";

    const frontball = document.createElement("div");
    frontball.className = "frontball";
    frontball.style.backgroundImage = `url(${shuffledBalls[i].frontImage})`;
    frontball.style.backgroundSize = "cover";

    ballContainer.appendChild(backball);
    ballContainer.appendChild(frontball);

    // Attach the drag and touch events
    ballContainer.draggable = true;
    ballContainer.ondragstart = dragStart;
    ballContainer.ondragend = dragEnd;
    ballContainer.ontouchstart = touchStart;
    ballContainer.ontouchmove = touchMove;
    ballContainer.ontouchend = touchEnd;

    tubes[Math.floor(i / 3)].appendChild(ballContainer);
  }

  tubes.forEach((tube) => {
    gameContainer.appendChild(tube);
    updateZIndexes(tube); // Update z-index after adding balls
  });
  document.getElementById("status").style.display = "none";
  startTimer();
  document.getElementById("failstatus").style.display = "none";
}
function startGame() {
  document.getElementById("start-menu").style.display = "none";
  const gameScreen = document.getElementById("game-screen");
  gameScreen.style.display = "flex";

  // Trigger animation
  setTimeout(() => {
    gameScreen.classList.add("active");
  }, 10);

  // Preload images before starting the game
  preloadImages();
  const themeSong = document.getElementById("theme-song");

  themeSong.play();

  resetGame();
}
// Initialize the game by showing the start menu
document.getElementById("start-menu").style.display = "flex";
document.getElementById("game-screen").style.display = "none";

function toggleLandscape() {
  const mainContainer = document.querySelector(".container");
  const container = document.querySelector(".phone-container");
  //phone container
  const phone = document.querySelector(".phone-img");
  const startmenu = document.querySelector(".start-menu");
  const landscapeBtn = document.querySelector(".landscape");
  const portraitBtn = document.querySelector(".portrait");

  container.classList.add("landscape");
  mainContainer.classList.add("landscape");
  phone.classList.add("landscape");

  // Start Menu Style
  startmenu.classList.add("landscape");
  const svgland = landscapeBtn.querySelector("svg");
  if (svgland) {
    svgland.style.color = "#ff3413";
  }
  const svgport = portraitBtn.querySelector("svg");
  if (svgport) {
    svgport.style.color = "#9d9d9d";
  }
}

function togglePortrait() {
  const mainContainer = document.querySelector(".container");
  const container = document.querySelector(".phone-container");
  //phone container
  const phone = document.querySelector(".phone-img");
  const startmenu = document.querySelector(".start-menu");

  container.classList.remove("landscape");
  mainContainer.classList.remove("landscape");
  phone.classList.remove("landscape");

  // Start Menu Style
  startmenu.classList.remove("landscape");

  const landscapeBtn = document.querySelector(".landscape");
  const portraitBtn = document.querySelector(".portrait");
  const svgland = landscapeBtn.querySelector("svg");
  if (svgland) {
    svgland.style.color = "#9d9d9d";
  }
  const svgport = portraitBtn.querySelector("svg");
  if (svgport) {
    svgport.style.color = "#ff3413";
  }
}
