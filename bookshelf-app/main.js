let booksList = [];
let originalBooksList = [];
const RENDER_EVENT = 'render-book';
let editingBookId = null; // Track the book being edited

function isStorageExist() {
    if (typeof Storage === 'undefined') {
        alert('Browser tidak mendukung web storage');
        return false;
    }
    return true;
}

document.addEventListener('DOMContentLoaded', function () {
    const submitForm = document.getElementById('bookForm');
    
    submitForm.addEventListener('submit', function (event) {
        event.preventDefault();

        if (editingBookId !== null) {
            updateBook(editingBookId); // Update the book
        } else {
            addBook(); // Add a new book
        }

        // Reset the form and clear the editing flag
        submitForm.reset();
        editingBookId = null;
    });

    if (isStorageExist()) {
        loadDataFromStorage(); // Initial load of books from storage
    }

    const searchForm = document.getElementById('searchBook');
    const searchInput = document.getElementById('searchBookTitle');

    // Add event listener for the search form
    searchForm.addEventListener('submit', function (event) {
        event.preventDefault();

        const query = searchInput.value.toLowerCase(); // Get the search query and convert it to lowercase

        // Filter books based on title (case-insensitive)
        const filteredBooks = originalBooksList.filter(book => book.title.toLowerCase().includes(query));

        // Update booksList with filtered data and re-render
        booksList.length = 0; // Clear the booksList
        booksList.push(...filteredBooks); // Push the filtered books into the list
        document.dispatchEvent(new Event(RENDER_EVENT)); // Trigger the render event
    });

    // Show all books when search is cleared
    searchInput.addEventListener('input', function () {
        if (searchInput.value === '') {
            // Restore the booksList from the original list and re-render
            booksList.length = 0; // Clear the current booksList
            booksList.push(...originalBooksList); // Add back the original list of books
            document.dispatchEvent(new Event(RENDER_EVENT)); // Re-render all books
        }
    });
});


function addBook() {
    const title = document.getElementById('bookFormTitle').value;
    const author = document.getElementById('bookFormAuthor').value;
    const year = parseInt(document.getElementById('bookFormYear').value);
    const isComplete = document.getElementById('bookFormIsComplete').checked;

    if (title === '' || author === '' || year === '') {
        alert('Tolong isi semua kolom!');
        return;
    }

    const generatedID = generateId();
    const bookObject = generateBookObject(generatedID, title, author, year, isComplete);
    booksList.push(bookObject);

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function generateId() {
    return +new Date();
}

function generateBookObject(id, title, author, year, isComplete) {
    return { id, title, author, year:Number(year), isComplete };
}

document.addEventListener(RENDER_EVENT, function () {
    const incompleteBookList = document.getElementById('incompleteBookList');
    const completeBookList = document.getElementById('completeBookList');

    // Clear the containers
    incompleteBookList.innerHTML = '';
    completeBookList.innerHTML = '';

    booksList.forEach((book) => {
        const bookElement = makeBook(book);
        if (book.isComplete) {
            completeBookList.append(bookElement);
        } else {
            incompleteBookList.append(bookElement);
        }
    });
});

function makeBook(bookObject) {
    const bookItem = document.createElement('div');
    bookItem.setAttribute('data-bookid', bookObject.id);
    bookItem.setAttribute('data-testid','bookItem');

    const textJudul = document.createElement('h3');
    textJudul.innerText = bookObject.title;
    textJudul.setAttribute('data-testid','bookItemTitle');
    bookItem.appendChild(textJudul);

    const textAuthor = document.createElement('p');
    textAuthor.innerText = bookObject.author;
    textAuthor.setAttribute('data-testid','bookItemAuthor');
    bookItem.appendChild(textAuthor);

    const textYear = document.createElement('p');
    textYear.innerText = bookObject.year;
    textYear.setAttribute('data-testid','bookItemYear')
    bookItem.appendChild(textYear);

    const buttonContainer = document.createElement('div');

    const buttonComplete = document.createElement('button');
    buttonComplete.innerText = 'Selesai dibaca';
    buttonComplete.setAttribute('data-testid', 'bookItemIsCompleteButton');
    buttonComplete.addEventListener('click', function () {
        bookObject.isComplete = !bookObject.isComplete;
        document.dispatchEvent(new Event(RENDER_EVENT));
        saveData();
    });
    buttonContainer.appendChild(buttonComplete);

    const buttonDelete = document.createElement('button');
    buttonDelete.innerText = 'Hapus Buku';
    buttonDelete.setAttribute('data-testid','bookItemDeleteButton');
    buttonDelete.addEventListener('click', function () {
        removeBookFromComplete(bookObject.id);
    });
    buttonContainer.appendChild(buttonDelete);

    const buttonEdit = document.createElement('button');
    buttonEdit.innerText = 'Edit Buku';
    buttonEdit.setAttribute('data-testid','bookItemEditButton');
    buttonEdit.addEventListener('click', function () {
        editBook(bookObject.id);
    });
    buttonContainer.appendChild(buttonEdit);

    bookItem.appendChild(buttonContainer);

    return bookItem;
}

function removeBookFromComplete(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    booksList.splice(bookIndex, 1);
    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function findBookIndex(bookId) {
    return booksList.findIndex((book) => book.id === bookId);
}

function editBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    const book = booksList[bookIndex];

    // Pre-fill the form with the book's details
    document.getElementById('bookFormTitle').value = book.title;
    document.getElementById('bookFormAuthor').value = book.author;
    document.getElementById('bookFormYear').value = book.year;
    document.getElementById('bookFormIsComplete').checked = book.isComplete;

    // Set the global editing flag
    editingBookId = bookId;
}

function updateBook(bookId) {
    const bookIndex = findBookIndex(bookId);
    if (bookIndex === -1) return;

    const book = booksList[bookIndex];

    book.title = document.getElementById('bookFormTitle').value;
    book.author = document.getElementById('bookFormAuthor').value;
    book.year = parseInt(document.getElementById('bookFormYear').value);
    book.isComplete = document.getElementById('bookFormIsComplete').checked;

    document.dispatchEvent(new Event(RENDER_EVENT));
    saveData();
}

function saveData(){
    if(isStorageExist()){
        localStorage.setItem('BOOKS_LIST',JSON.stringify(booksList));
    }
}

function loadDataFromStorage() {
    const serializedData = localStorage.getItem('BOOKS_LIST');
    if (serializedData !== null) {
        originalBooksList = JSON.parse(serializedData); // Store the original books list
        booksList.push(...originalBooksList); // Populate booksList with the data
    }
    document.dispatchEvent(new Event(RENDER_EVENT)); // Trigger the render event
}