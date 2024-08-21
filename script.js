let timerInterval;
let startTime;
let moveCount = 0;

function allowDrop(event) {
  event.preventDefault();
}

function dragStart(event) {
  const ballContainer = event.target.closest(".ball-container");
  const tube = ballContainer.parentElement;
  if (tube.firstElementChild !== ballContainer) {
    return;
  }
  event.dataTransfer.setData("text", ballContainer.id);
  setTimeout(() => ballContainer.classList.add("dragging"), 0);
}

function dragEnd(event) {
  event.target.classList.remove("dragging");
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
  event.preventDefault();
  const ball = event.target;
  const tube = ball.parentElement;
  if (tube.lastElementChild !== ball) {
    return;
  }
  ball.classList.add("dragging");
  const touch = event.touches[0];
  ball.style.left = `${touch.clientX - ball.offsetWidth / 2}px`;
  ball.style.top = `${touch.clientY - ball.offsetHeight / 2}px`;
}

function touchMove(event) {
  event.preventDefault();
  const ball = event.target;
  const touch = event.touches[0];
  ball.style.left = `${touch.clientX - ball.offsetWidth / 2}px`;
  ball.style.top = `${touch.clientY - ball.offsetHeight / 2}px`;
}

function touchEnd(event) {
  event.preventDefault();
  const ball = event.target;
  ball.classList.remove("dragging");
  ball.style.left = "";
  ball.style.top = "";

  const touch = event.changedTouches[0];
  const targetElement = document.elementFromPoint(touch.clientX, touch.clientY);
  const targetTube = targetElement.closest(".tube");

  if (targetTube) {
    const lastBallInTargetTube = targetTube.lastElementChild;
    if (
      !lastBallInTargetTube ||
      lastBallInTargetTube.style.backgroundImage === ball.style.backgroundImage
    ) {
      if (targetTube.childElementCount < 4) {
        targetTube.appendChild(ball);
        moveCount++;
        // document.getElementById("moves").textContent = `Moves: ${moveCount}`;
        checkWinCondition();
      }
    }
  }
}

function checkWinCondition() {
  const tubes = document.querySelectorAll(".tube");
  let allSorted = true;
  let nonEmptyTubes = 0;

  tubes.forEach((tube) => {
    if (tube.childElementCount > 0) {
      nonEmptyTubes++;
      if (tube.childElementCount !== 3) { // Adjust to match your tube capacity
        allSorted = false;
        return;
      }
      const firstBallColor = tube.firstElementChild.getAttribute("data-color");
      for (let i = 0; i < tube.childElementCount; i++) {
        const currentBallColor = tube.children[i].getAttribute("data-color");
        if (currentBallColor !== firstBallColor) {
          allSorted = false;
          return;
        }
      }
    }
  });

  const statusElement = document.getElementById("status");
  const failStatusElement = document.getElementById("failstatus");

  // Calculate elapsed time in seconds
  const endTime = new Date();
  const elapsedTime = (endTime - startTime) / 1000;
  console.log("Elapsed Time: ", elapsedTime);

  // Check if the time exceeds 40 seconds
  if (elapsedTime > 40) {
    console.log("Time exceeded 40 seconds");
    clearInterval(timerInterval);
    statusElement.classList.remove("active");
    failStatusElement.style.display = "flex";
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

    // Stop the game if elapsed time exceeds 40 seconds
    if (elapsedTime > 40) {
      clearInterval(timerInterval);
      document.getElementById("status").style.display = "none";
      document.getElementById("failstatus").style.display = "flex";
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
      frontImage: "/images/gamescreen/donuts/donut_5_front.webp",
      backImage: "/images/gamescreen/donuts/donut_5_back.webp",
    },
    {
      id: "ball14",
      color: "orange",
      frontImage: "/images/gamescreen/donuts/donut_5_front.webp",
      backImage: "/images/gamescreen/donuts/donut_5_back.webp",
    },
    {
      id: "ball15",
      color: "orange",
      frontImage: "/images/gamescreen/donuts/donut_5_front.webp",
      backImage: "/images/gamescreen/donuts/donut_5_back.webp",
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

  resetGame();
}
// Initialize the game by showing the start menu
document.getElementById("start-menu").style.display = "flex";
document.getElementById("game-screen").style.display = "none";


function toggleLandscape() {
  
  const mainContainer = document.querySelector('.container')
  const container = document.querySelector('.phone-container');
  //phone container
  const phone = document.querySelector('.phone-img');
  const startmenu = document.querySelector('.start-menu');

  container.classList.toggle('landscape');
  mainContainer.classList.toggle('landscape');
  phone.classList.toggle('landscape');

  // Start Menu Style
  startmenu.classList.toggle('landscape')
}
