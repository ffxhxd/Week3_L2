document.addEventListener('DOMContentLoaded', () => {
    const hamburgerMenu = document.querySelector('.hamburger-menu');
    const nav = document.querySelector('nav');
    const exploreMoreBtn = document.querySelector('.search-data .explore-more-btn');

    hamburgerMenu.addEventListener('click', () => {
        nav.classList.toggle('show');
        hamburgerMenu.classList.toggle('open');
    });

    const API_KEY = 'wx51YAUW9EsxNaKG59c4ZdHCll3Pxjw4iIhTRkqAnwvAoYuciHdY5Dug';

    async function fetchImages(searchQuery) {
        try {
            const response = await fetch(`https://api.pexels.com/v1/search?query=${searchQuery}`, {
                headers: {
                    Authorization: API_KEY
                }
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();
            return data;
        } catch (error) {
            console.error('There was a problem with your fetch operation:', error);
            return null;
        }
    }

    async function updateSearchResults(query) {
        try {
            const data = await fetchImages(query);
            if (data && data.photos && data.photos.length > 0) {
                const firstResult = data.photos[0];
                const searchImage = document.getElementById('searchImage');
                const searchTitle = document.getElementById('searchTitle');
                const searchGenres = document.getElementById('searchGenres');

                searchImage.src = firstResult.src.medium;
                searchTitle.textContent = firstResult.photographer;
                searchGenres.textContent = 'Photographer';
                exploreMoreBtn.href = firstResult.photographer_url;

                // Populate slider cards with remaining search results
                const carousel = document.getElementById('carousel');
                carousel.innerHTML = '';
                for (let i = 1; i < data.photos.length; i++) {
                    const photo = data.photos[i];
                    const card = document.createElement('li');
                    card.classList.add('card');
                    card.innerHTML = `
                        <div class="img"><img src="${photo.src.medium}" alt="img" draggable="false"></div>
                        <h2>${photo.alt}</h2>
                        <span>${photo.photographer}</span>
                        <button class="add-to-favorites"><i class="fa fa-heart" aria-hidden="true"></i></button>
                    `;
                    carousel.appendChild(card);

                    // Add event listener to the "ADD" button
                    const addToFavoritesBtn = card.querySelector('.add-to-favorites');
                    addToFavoritesBtn.addEventListener('click', function() {
                        const photoData = {
                            src: photo.src.medium,
                            alt: photo.alt,
                            photographer: photo.photographer
                        };
                        addToFavorites(photoData);
                    });
                }
            } else {
                console.error('No search results found');
            }
        } catch (error) {
            console.error('There was a problem updating search results:', error);
        }
    }

    document.getElementById('searchIcon').addEventListener('click', async function() {
        const searchInput = document.getElementById('searchInput').value;
        if (searchInput.trim() !== '') {
            await updateSearchResults(searchInput);
        }
    });

    // Function to add a photo to favorites
    function addToFavorites(photo) {
        const favoritesContainer = document.querySelector('.favourite-list-container');
        const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Check if the photo is already in favorites
        const exists = existingFavorites.some(item => item.alt === photo.alt);
        if (!exists) {
            existingFavorites.push(photo);
            localStorage.setItem('favorites', JSON.stringify(existingFavorites));
            
            const card = document.createElement('div');
            card.classList.add('favourites-card');
            card.innerHTML = `
                <div class="img"><img src="${photo.src}" alt="img" draggable="false"></div>
                <h2>${photo.alt}</h2>
                <span>${photo.photographer}</span>
                <button class="remove-from-favorites"><i class="fa fa-times" aria-hidden="true"></i></button>
            `;
            favoritesContainer.appendChild(card);

            // Add event listener to the "REMOVE" button
            const removeFromFavoritesBtn = card.querySelector('.remove-from-favorites');
            removeFromFavoritesBtn.addEventListener('click', function() {
                removeFromFavorites(photo, card);
            });
        }
    }

    // Function to remove a photo from favorites
    function removeFromFavorites(photo, card) {
        const favoritesContainer = document.querySelector('.favourite-list-container');
        const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        
        // Remove the photo from the favorites list
        const updatedFavorites = existingFavorites.filter(item => item.alt !== photo.alt);
        localStorage.setItem('favorites', JSON.stringify(updatedFavorites));
        
        // Remove the card from the UI
        favoritesContainer.removeChild(card);
    }

    // Load favorites from local storage on refresh
    function loadFavoritesFromStorage() {
        const existingFavorites = JSON.parse(localStorage.getItem('favorites')) || [];
        const favoritesContainer = document.querySelector('.favourite-list-container');
        
        // Add each favorite item to the UI
        existingFavorites.forEach(photo => {
            const card = document.createElement('div');
            card.classList.add('favourites-card');
            card.innerHTML = `
                <div class="img"><img src="${photo.src}" alt="img" draggable="false"></div>
                <h2>${photo.alt}</h2>
                <span>${photo.photographer}</span>
                <button class="remove-from-favorites"><i class="fa fa-times" aria-hidden="true"></i></button>
            `;
            favoritesContainer.appendChild(card);

            // Add event listener to the "REMOVE" button
            const removeFromFavoritesBtn = card.querySelector('.remove-from-favorites');
            removeFromFavoritesBtn.addEventListener('click', function() {
                removeFromFavorites(photo, card);
            });
        });
    }

    // Initial load
    updateSearchResults('india'); // Default search query

    // Load favorites from local storage
    loadFavoritesFromStorage();

    const wrapper = document.querySelector(".wrapper");
    const carousel = document.querySelector(".carousel");   
    if (carousel) {
        const firstCardWidth = carousel.querySelector(".card").offsetWidth;
        const arrowBtns = document.querySelectorAll(".wrapper i");
        const carouselChildrens = [...carousel.children];

        let isDragging = false, isAutoPlay = true, startX, startScrollLeft, timeoutId;

        // Get the number of cards that can fit in the carousel at once
        let cardPerView = Math.round(carousel.offsetWidth / firstCardWidth);

        // Insert copies of the last few cards to beginning of carousel for infinite scrolling
        carouselChildrens.slice(-cardPerView).reverse().forEach(card => {
            carousel.insertAdjacentHTML("afterbegin", card.outerHTML);
        });

        // Insert copies of the first few cards to end of carousel for infinite scrolling
        carouselChildrens.slice(0, cardPerView).forEach(card => {
            carousel.insertAdjacentHTML("beforeend", card.outerHTML);
        });

        // Scroll the carousel at appropriate position to hide first few duplicate cards on Firefox
        carousel.classList.add("no-transition");
        carousel.scrollLeft = carousel.offsetWidth;
        carousel.classList.remove("no-transition");

        // Add event listeners for the arrow buttons to scroll the carousel left and right
        arrowBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                carousel.scrollLeft += btn.id == "left" ? -firstCardWidth : firstCardWidth;
            });
        });

        const dragStart = (e) => {
            isDragging = true;
            carousel.classList.add("dragging");
            // Records the initial cursor and scroll position of the carousel
            startX = e.pageX;
            startScrollLeft = carousel.scrollLeft;
        }

        const dragging = (e) => {
            if(!isDragging) return; // if isDragging is false return from here
            // Updates the scroll position of the carousel based on the cursor movement
            carousel.scrollLeft = startScrollLeft - (e.pageX - startX);
        }

        const dragStop = () => {
            isDragging = false;
            carousel.classList.remove("dragging");
        }

        const infiniteScroll = () => {
            // If the carousel is at the beginning, scroll to the end
            if(carousel.scrollLeft === 0) {
                carousel.classList.add("no-transition");
                carousel.scrollLeft = carousel.scrollWidth - (2 * carousel.offsetWidth);
                carousel.classList.remove("no-transition");
            }
            // If the carousel is at the end, scroll to the beginning
            else if(Math.ceil(carousel.scrollLeft) === carousel.scrollWidth - carousel.offsetWidth) {
                carousel.classList.add("no-transition");
                carousel.scrollLeft = carousel.offsetWidth;
                carousel.classList.remove("no-transition");
            }

            // Clear existing timeout & start autoplay if mouse is not hovering over carousel
            clearTimeout(timeoutId);
            if(!wrapper.matches(":hover")) autoPlay();
        }

        const autoPlay = () => {
            if(window.innerWidth < 800 || !isAutoPlay) return; // Return if window is smaller than 800 or isAutoPlay is false
            // Autoplay the carousel after every 2500 ms
            timeoutId = setTimeout(() => carousel.scrollLeft += firstCardWidth, 2500);
        }
        autoPlay();

        carousel.addEventListener("mousedown", dragStart);
        carousel.addEventListener("mousemove", dragging);
        document.addEventListener("mouseup", dragStop);
        carousel.addEventListener("scroll", infiniteScroll);
        wrapper.addEventListener("mouseenter", () => clearTimeout(timeoutId));
        wrapper.addEventListener("mouseleave", autoPlay);
    }
});
