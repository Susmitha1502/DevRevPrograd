var searchInput = document.getElementById("searchInput");
var suggestionsContainer = document.getElementById("suggestions");
var outputContainer = document.getElementById("output");
var loadingAnimation = document.getElementById("loadingAnimation");
var loadedBooks = [];

var filterSelect = document.getElementById("filterSelect");
var sortSelect = document.getElementById("sortSelect");
var cartCount = 0;
var cartButtonCount = document.getElementById("cartButtonCount");

// Retrieve cart items from local storage
var cartItems = getCartItems();

function showLoadingAnimation() {
    loadingAnimation.style.display = "block";
}

function hideLoadingAnimation() {
    loadingAnimation.style.display = "none";
}

// Function to update the cart count
// ...

function updateCartCount() {
    var cartButtonCount = document.getElementById("cartButtonCount");
var cartCountContainer = document.getElementById("cartCountContainer");

if (cartItems.length > 0) {
    cartCountContainer.style.display = "block";
    cartButtonCount.textContent = cartItems.length;
} else {
    cartCountContainer.style.display = "none";
}
}


var cartDetailsButton = document.getElementById("cartDetailsButton");
cartDetailsButton.addEventListener("click", displayCartItems);

function displayCartItems() {
    cartItemsContainer.innerHTML = "";

if (cartItems.length > 0) {
    cartItems.forEach(function (item) {
    var listItem = document.createElement("p");
    listItem.textContent = item.title;
    cartItemsContainer.appendChild(listItem);
    });
} else {
    var emptyCartMessage = document.createElement("p");
    emptyCartMessage.textContent = "No items in cart.";
    cartItemsContainer.appendChild(emptyCartMessage);
}
}

document.getElementById("cartButton").addEventListener("click", function () {
displayCartItems();
});

// ...


function displaySuggestions(suggestions) {
    suggestionsContainer.innerHTML = "";
    if (suggestions.length > 0) {
    suggestions.forEach(function (suggestion) {
        var listItem = document.createElement("li");
        listItem.textContent = suggestion;
        listItem.addEventListener("click", function () {
        searchInput.value = suggestion;
        suggestionsContainer.innerHTML = "";
        performSearch(suggestion);
        });
        suggestionsContainer.appendChild(listItem);
    });
    }
}

function displayBooks(books) {
    var filteredBooks = filterBooks(books); 
    var output = "";
    var displayedBookCount = 0; 

    for (var i = 0; i < filteredBooks.length; i++) {
    if (filteredBooks[i].cover_i && !loadedBooks.includes(filteredBooks[i].title)) {
    loadedBooks.push(filteredBooks[i].title);
    output += `
    <div class="book">
        <h2>${filteredBooks[i].title}</h2>
        <p>Author: ${filteredBooks[i].author_name ? filteredBooks[i].author_name[0] : "Unknown"}</p>
        <img class="book-image lazy" data-src="http://covers.openlibrary.org/b/id/${filteredBooks[i].cover_i}-M.jpg">
        <button class="add-to-cart-button" data-index="${i}">ADD</button>
        </div>
    `;
    displayedBookCount++; 
    }
}

outputContainer.innerHTML = output;

var addToCartButtons = document.querySelectorAll(".add-to-cart-button");
addToCartButtons.forEach(function (button) {
    button.addEventListener("click", function () {
    var index = button.getAttribute("data-index");
    var book = filteredBooks[index];
    addToCart(book);
    });
});

    // Display the count of displayed books
    var bookCountElement = document.getElementById("bookCount");
    bookCountElement.textContent = "Total Books: " + displayedBookCount;

    lazyLoadImages();
}
        function setupAddToCartButtons() {
            var addToCartButtons = document.getElementsByClassName("add-to-cart-button");
            Array.from(addToCartButtons).forEach(function (button) {
                button.addEventListener("click", function () {
                    var index = parseInt(button.dataset.index);
                    var book = filteredBooks[index];
                    addToCart(book);
                });
            });
        }

        function addToCart(book) {
            cartCount++;
cartButtonCount.textContent = cartCount;
            var bookDetails = {
    title: book.title,
    author: book.author_name ? book.author_name[0] : "Unknown",
    cover: `http://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`,
    copies: 1, 
    freshlySelected: true ;
};

cartItems.push(bookDetails);

// Save cart items to local storage
saveCartItems();

// Update the cart button count
updateCartCount();
}
// Function to save cart items to local storage
function saveCartItems() {
localStorage.setItem("cartItems", JSON.stringify(cartItems));
}

function removeFromCart(bookTitle) {
cartItems = cartItems.filter(function (item) {
    return item.title !== bookTitle;
});

// Save cart items to local storage
saveCartItems();

// Update the cart button count
updateCartCount();
}
        function lazyLoadImages() {
            var images = document.querySelectorAll(".book-image");
            var observerOptions = {
                root: null,
                rootMargin: "0px",
                threshold: 0.1
            };

            var imageObserver = new IntersectionObserver(function (entries, observer) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        var image = entry.target;
                        image.src = image.dataset.src;
                        image.classList.remove("lazy");
                        imageObserver.unobserve(image);
                    }
                });
            }, observerOptions);

            images.forEach(function (image) {
                imageObserver.observe(image);
            });
        }

        function performSearch(searchTerm) {
            loadedBooks = [];
            outputContainer.innerHTML = "";
            showLoadingAnimation();

            fetch("http://openlibrary.org/search.json?q=" + searchTerm)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var books = data.docs;
                    applyFilterAndSort(books);
                    hideLoadingAnimation();
                })
                .catch(function (error) {
                    console.error("Error:", error);
                    hideLoadingAnimation();
                });
        }

        function getSuggestions(searchTerm) {
            fetch("http://openlibrary.org/search.json?title=" + searchTerm)
                .then(function (response) {
                    return response.json();
                })
                .then(function (data) {
                    var suggestions = data.docs.map(function (doc) {
                        return doc.title;
                    });
                    displaySuggestions(suggestions);
                })
                .catch(function (error) {
                    console.error("Error:", error);
                });
        }

        function applyFilterAndSort(books) {
            var filteredBooks = filterBooks(books);
            var sortedBooks = sortBooks(filteredBooks);
            displayBooks(sortedBooks);
        }

        function filterBooks(books) {
            var filterValue = filterSelect.value;
            var searchTerm = searchInput.value.trim().toLowerCase();

            if (filterValue === "all") {
                return books.filter(function (book) {
                    return book.title.toLowerCase().includes(searchTerm) ||
                        (book.author_name && book.author_name[0].toLowerCase().includes(searchTerm));
                });
            } else if (filterValue === "title") {
                return books.filter(function (book) {
                    return book.title.toLowerCase().includes(searchTerm);
                });
            } else if (filterValue === "author") {
                return books.filter(function (book) {
                    return book.author_name && book.author_name[0].toLowerCase().includes(searchTerm);
                });
            }

            return books;
        }

        function sortBooks(books) {
            var sortValue = sortSelect.value;

            if (sortValue === "title_asc") {
                return books.sort(function (a, b) {
                    return a.title.localeCompare(b.title);
                });
            } else if (sortValue === "title_desc") {
                return books.sort(function (a, b) {
                    return b.title.localeCompare(a.title);
                });
            } else if (sortValue === "author_asc") {
                return books.sort(function (a, b) {
                    var authorA = a.author_name ? a.author_name[0] : "";
                    var authorB = b.author_name ? b.author_name[0] : "";
                    return authorA.localeCompare(authorB);
                });
            } else if (sortValue === "author_desc") {
                return books.sort(function (a, b) {
                    var authorA = a.author_name ? a.author_name[0] : "";
                    var authorB = b.author_name ? b.author_name[0] : "";
                    return authorB.localeCompare(authorA);
                });
            } else if (sortValue === "publish_date_asc") {
                return books.sort(function (a, b) {
                    return a.first_publish_year - b.first_publish_year;
                });
            } else if (sortValue === "publish_date_desc") {
                return books.sort(function (a, b) {
                    return b.first_publish_year - a.first_publish_year;
                });
            }

            return books;
        }

        filterSelect.addEventListener("change", function () {
            var searchTerm = searchInput.value.trim();
            if (searchTerm.length > 0) {
                performSearch(searchTerm);
            }
        });

        sortSelect.addEventListener("change", function () {
            var searchTerm = searchInput.value.trim();
            if (searchTerm.length > 0) {
                performSearch(searchTerm);
            }
        });

        searchInput.addEventListener("input", function () {
            var searchTerm = this.value.trim();
            if (searchTerm.length > 0) {
                getSuggestions(searchTerm);
            } else {
                suggestionsContainer.innerHTML = "";
            }
        });

        document.addEventListener("click", function (event) {
            if (!event.target.closest("#searchInput") && !event.target.closest("#suggestions")) {
                suggestionsContainer.innerHTML = "";
            }
        });

        document.getElementById("searchButton").addEventListener("click", function () {
            var searchTerm = searchInput.value.trim();
            if (searchTerm.length > 0) {
                performSearch(searchTerm);
            }
        })

// Event listener for adding items to the cart
outputContainer.addEventListener("click", function (event) {
    var target = event.target;
    if (target.classList.contains("add-to-cart-button")) {
    var index = target.getAttribute("data-index");
    var selectedBook = filteredBooks[index];
    addToCart(selectedBook); // Add the selected book to the cart
    }
});

var cartCount = 0;

document.getElementById("cartButton").addEventListener("click", function () {
displayCartItems();
});

function displayCartItems() {

    var cartItemsContainer = document.getElementById("cartItems");
cartItemsContainer.innerHTML = "";

if (cartItems.length > 0) {
    cartItems.forEach(function (item) {
    var listItem = document.createElement("p");
    listItem.textContent = item.title;
    cartItemsContainer.appendChild(listItem);
    });
    listItem.appendChild(titleElement);
    listItem.appendChild(removeButton);
    cartItemsContainer.appendChild(listItem);
    }
else {
    var emptyCartMessage = document.createElement("p");
    emptyCartMessage.textContent = "No items in cart.";
    cartItemsContainer.appendChild(emptyCartMessage);
}
}

// Retrieve cart items from localStorage
function getCartItems() {
var cartItems = localStorage.getItem("cartItems");
if (cartItems) {
    return JSON.parse(cartItems);
} else {
    return [];
}
}
