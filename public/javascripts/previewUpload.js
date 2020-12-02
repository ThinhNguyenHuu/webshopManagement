// get input type file
let file = document.getElementById("image");
let columns = document.querySelectorAll(".column");

// create array to store image tag
let arrImg;

// event handler for input type file
file.onchange = () => {
  arrImg = [];

  let oldThumbnails = document.querySelectorAll(".img-upload-thumbnail");
  removeOldThumbnail(oldThumbnails);

  // get files from the selected folder
  for (const key in file.files) {
    
    const element = file.files[key];

    if (element.type === "image/jpeg" || element.type === "image/png") {
      // get the column with minimum child
      let parent_column = minParent(columns);

      // create thumbnail
      const reader = new FileReader();
      let img = document.createElement("img");
      reader.addEventListener("load", function() {
        img.setAttribute("src", this.result);
        img.className = "img-upload-thumbnail";
      });

      // store images in the array for animation
      arrImg[key] = img;
      // append images in the parent node
      parent_column.appendChild(img);

      reader.readAsDataURL(element);
    }
  }

  // create variable for index number
  let i = 0;
  let clearinter = setInterval(() => {
    arrImg[i].setAttribute("style", "display : initial");
    arrImg[i].classList.add("animated", "bounceInUp");
    i++;
    // clear set interval when i is equal to array lenght
    i == arrImg.length ? clearInterval(clearinter) : undefined;
  }, 150);
};

// obtain parent node which has minimun child
function minParent(parentNode) {
  let arr = [];

  // get the children of the parent nodes
  parentNode.forEach((element, i) => {
    arr[i] = element.children.length;
  });

  // get min number from array
  let min = Math.min.apply(null, arr);

  // get parent which has min child nodes.
  for (let i = 0; i < parentNode.length; i++) {
    if (parentNode[i].children.length == min) {
      return parentNode[i];
    }
  }
}

function removeOldThumbnail(oldThumbnails) {
  for (let i = 0; i < oldThumbnails.length; i++) {
    oldThumbnails[i].parentNode.removeChild(oldThumbnails[i]);
  }
}
